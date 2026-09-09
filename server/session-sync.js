// Shared by Next.js and the persistent Discord worker.
const API = 'https://discord.com/api/v10';
async function discord(path, method = 'GET', body) {
  if (!process.env.DISCORD_BOT_TOKEN || !process.env.DISCORD_GUILD_ID) throw new Error('Configure DISCORD_BOT_TOKEN e DISCORD_GUILD_ID no servidor.');
  const response = await fetch(API + path, { method, headers: { Authorization: 'Bot ' + process.env.DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(10000) });
  if (response.status === 404 && (method === 'GET' || method === 'DELETE')) return null;
  if (!response.ok) throw new Error('Discord: HTTP ' + response.status + (response.status === 403 ? ' — verifique as permissões do bot.' : '. Tente sincronizar novamente.'));
  return response.status === 204 ? null : response.json();
}
async function syncSession(prisma, id) {
  const now = new Date();
  const lock = new Date(now.getTime() + 180000);
  const acquired = await prisma.gameSession.updateMany({ where: { id, OR: [{ syncLockedUntil: null }, { syncLockedUntil: { lt: now } }] }, data: { syncLockedUntil: lock } });
  if (!acquired.count) return;
  try {
    const s = await prisma.gameSession.findUnique({ where: { id }, include: { participants: { include: { user: true } } } });
    const guild = '/guilds/' + process.env.DISCORD_GUILD_ID;
    // Inspect terminal events before creating or repairing channels. Keep the
    // event ID as a tombstone so a later sync cannot recreate its voice room.
    if (s.discordEventId) {
      const event = await discord(guild + '/scheduled-events/' + s.discordEventId);
      if (!event || event.status === 3 || event.status === 4) {
        if (s.discordVoiceChannelId) await discord('/channels/' + s.discordVoiceChannelId, 'DELETE');
        await prisma.gameSession.update({ where: { id }, data: { discordVoiceChannelId: null, discordSyncError: null, discordSyncedAt: new Date() } });
        return;
      }
    }
    if (s.endedAt) {
      if (s.discordEventId) {
        const event = await discord(guild + '/scheduled-events/' + s.discordEventId);
        if (event && (event.status === 1 || event.status === 2)) await discord(guild + '/scheduled-events/' + s.discordEventId, 'PATCH', { status: event.status === 1 ? 4 : 3 });
      }
      if (s.discordVoiceChannelId) await discord('/channels/' + s.discordVoiceChannelId, 'DELETE');
      await prisma.gameSession.update({ where: { id }, data: { discordVoiceChannelId: null } });
    } else {
      const [creator, admins, bot] = await Promise.all([
        prisma.user.findUnique({ where: { id: s.createdBy } }), prisma.user.findMany({ where: { role: 'ADMIN' } }), discord('/users/@me')
      ]);
      const ids = [...new Set([bot.id, creator?.discordId, ...admins.map(a => a.discordId), ...s.participants.map(p => p.user.discordId)].filter(Boolean))];
      const permissions = [{ id: process.env.DISCORD_GUILD_ID, type: 0, deny: '1024' }, ...ids.map(id => ({ id, type: 1, allow: '1049600' }))];
      if (!s.discordVoiceChannelId) {
        // Recover a channel after a process interruption between Discord and DB writes.
        const channels = await discord(guild + '/channels');
        const name = (s.title.slice(0, 60) + '-' + s.id).slice(0, 100);
        const channel = channels.find(c => c.type === 2 && c.name === name) || await discord(guild + '/channels', 'POST', { name, type: 2, permission_overwrites: permissions });
        s.discordVoiceChannelId = channel.id;
        await prisma.gameSession.update({ where: { id }, data: { discordVoiceChannelId: channel.id } });
      }
      await discord('/channels/' + s.discordVoiceChannelId, 'PATCH', { permission_overwrites: permissions });
      if (!s.discordEventId) {
        const events = await discord(guild + '/scheduled-events');
        const event = events.find(e => e.channel_id === s.discordVoiceChannelId && (e.status === 1 || e.status === 2)) || await discord(guild + '/scheduled-events', 'POST', {
          name: s.title.slice(0, 100), description: s.description?.slice(0, 1000) || undefined,
          scheduled_start_time: new Date(Math.max(new Date(s.scheduledAt).getTime(), Date.now() + 60000)).toISOString(),
          privacy_level: 2, entity_type: 2, channel_id: s.discordVoiceChannelId
        });
        s.discordEventId = event.id;
        await prisma.gameSession.update({ where: { id }, data: { discordEventId: event.id } });
      }
      if (new Date(s.scheduledAt) <= new Date()) {
        const event = await discord(guild + '/scheduled-events/' + s.discordEventId);
        if (!event) throw new Error('O evento foi removido no Discord. A sessão permanece aberta no site.');
        if (event.status === 1) await discord(guild + '/scheduled-events/' + s.discordEventId, 'PATCH', { status: 2 });
      }
    }
    await prisma.gameSession.update({ where: { id }, data: { discordSyncError: null, discordSyncedAt: new Date() } });
  } catch (error) {
    await prisma.gameSession.update({ where: { id }, data: { discordSyncError: error.message || 'Falha ao sincronizar com Discord.' } });
  } finally {
    await prisma.gameSession.updateMany({ where: { id, syncLockedUntil: lock }, data: { syncLockedUntil: null } });
  }
}
function startSessionSync(prisma) {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const sessions = await prisma.gameSession.findMany({ where: { OR: [{ endedAt: null }, { discordSyncedAt: null }, { discordSyncError: { not: null } }] }, orderBy: { scheduledAt: 'asc' } });
      for (const session of sessions) await syncSession(prisma, session.id);
    } catch (error) { console.error('Session sync failed:', error.message); }
    finally { running = false; }
  };
  void tick();
  return setInterval(tick, 30000);
}
module.exports = { discord, syncSession, startSessionSync };
