// One-shot server-side calls to the Discord REST API using the same bot
// token as server/discord-bot.js. Unlike that script, this file runs inside
// Next.js API routes (no gateway/socket connection needed) — it just posts
// messages and manages Guild Scheduled Events.
//
// All functions fail silently (return null / no-op) when the relevant env
// vars aren't set yet, so the site's own quest/session flows never break
// because Discord is unconfigured or unreachable.

const API = "https://discord.com/api/v10";

function botHeaders() {
  return {
    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function configured() {
  return Boolean(process.env.DISCORD_BOT_TOKEN);
}

// ---------- Quest board -> Discord Forum post ----------
// DISCORD_QUEST_CHANNEL_ID must point to a Forum channel (type 15). Each
// quest becomes its own forum thread, tagged with its rarity/xp, that
// players can read and discuss.

export async function postQuestToDiscordForum(quest: {
  title: string;
  description: string;
  xpReward: number;
  creatorName?: string;
}): Promise<string | null> {
  const channelId = process.env.DISCORD_QUEST_CHANNEL_ID;
  if (!configured() || !channelId) return null;

  const embed = {
    title: `📜 ${quest.title}`,
    description: quest.description?.slice(0, 4000),
    color: 0xc9a227,
    fields: [
      { name: "Recompensa", value: `${quest.xpReward} XP`, inline: true },
      ...(quest.creatorName ? [{ name: "Mestre", value: quest.creatorName, inline: true }] : []),
    ],
  };

  try {
    const res = await fetch(`${API}/channels/${channelId}/threads`, {
      method: "POST",
      headers: botHeaders(),
      body: JSON.stringify({
        name: quest.title.slice(0, 100),
        message: { embeds: [embed] },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.id ?? null; // the forum post's thread id
  } catch {
    return null;
  }
}

// Marks a quest's forum thread as resolved: renames it with a ✅ prefix and
// archives + locks it so it stops accepting new replies.
export async function archiveDiscordForumPost(threadId: string, questTitle: string) {
  if (!configured()) return;
  try {
    await fetch(`${API}/channels/${threadId}`, {
      method: "PATCH",
      headers: botHeaders(),
      body: JSON.stringify({
        name: `✅ ${questTitle}`.slice(0, 100),
        archived: true,
        locked: true,
      }),
    });
  } catch {
    // best-effort; the site's own quest status is unaffected
  }
}

// ---------- Sessions -> private temporary voice channel + Scheduled Event ----------

const VIEW_CHANNEL = 1n << 10n; // 0x400
const CONNECT = 1n << 20n; // 0x100000
const MEMBER_ALLOW = (VIEW_CHANNEL | CONNECT).toString();
const EVERYONE_DENY = VIEW_CHANNEL.toString();

// Creates a voice channel visible only to @everyone-denied + the given
// Discord member IDs (DM, admins, assigned players). Returns the channel id.
export async function createDiscordSessionVoiceChannel(input: {
  name: string;
  allowedDiscordIds: string[];
}): Promise<string | null> {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!configured() || !guildId) return null;

  const uniqueIds = [...new Set(input.allowedDiscordIds.filter(Boolean))];
  const permission_overwrites = [
    { id: guildId, type: 0, deny: EVERYONE_DENY }, // @everyone role id == guild id
    ...uniqueIds.map((discordId) => ({ id: discordId, type: 1, allow: MEMBER_ALLOW })),
  ];

  try {
    const res = await fetch(`${API}/guilds/${guildId}/channels`, {
      method: "POST",
      headers: botHeaders(),
      body: JSON.stringify({
        name: input.name.slice(0, 100),
        type: 2, // GUILD_VOICE
        permission_overwrites,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.id ?? null;
  } catch {
    return null;
  }
}

// Re-applies the allowed-member list on an existing channel (call whenever
// participants are added/removed from the session).
export async function syncDiscordVoiceChannelAccess(
  channelId: string,
  allowedDiscordIds: string[]
) {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!configured() || !guildId) return;

  const uniqueIds = [...new Set(allowedDiscordIds.filter(Boolean))];
  const permission_overwrites = [
    { id: guildId, type: 0, deny: EVERYONE_DENY },
    ...uniqueIds.map((discordId) => ({ id: discordId, type: 1, allow: MEMBER_ALLOW })),
  ];

  try {
    await fetch(`${API}/channels/${channelId}`, {
      method: "PATCH",
      headers: botHeaders(),
      body: JSON.stringify({ permission_overwrites }),
    });
  } catch {
    // best-effort; access will just lag until the next successful sync
  }
}

export async function deleteDiscordChannel(channelId: string) {
  if (!configured()) return;
  try {
    await fetch(`${API}/channels/${channelId}`, { method: "DELETE", headers: botHeaders() });
  } catch {
    // best-effort cleanup
  }
}

export async function createDiscordSessionEvent(input: {
  title: string;
  description?: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  voiceChannelId: string;
}): Promise<string | null> {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!configured() || !guildId) return null;

  const start = input.scheduledAt;
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);

  try {
    const res = await fetch(`${API}/guilds/${guildId}/scheduled-events`, {
      method: "POST",
      headers: botHeaders(),
      body: JSON.stringify({
        name: input.title.slice(0, 100),
        description: input.description?.slice(0, 1000) ?? undefined,
        scheduled_start_time: start.toISOString(),
        scheduled_end_time: end.toISOString(),
        privacy_level: 2, // GUILD_ONLY (only valid value today)
        entity_type: 2, // VOICE — tied to a real, private voice channel
        channel_id: input.voiceChannelId,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.id ?? null;
  } catch {
    return null;
  }
}

export async function deleteDiscordSessionEvent(eventId: string) {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!configured() || !guildId) return;
  try {
    await fetch(`${API}/guilds/${guildId}/scheduled-events/${eventId}`, {
      method: "DELETE",
      headers: botHeaders(),
    });
  } catch {
    // best-effort cleanup
  }
}

// ---------- Discord role -> site role sync ----------
// Set DISCORD_ADMIN_ROLE_ID / DISCORD_DM_ROLE_ID to the role IDs (not names)
// from your server. On every Discord login we check which of these the
// member currently holds and mirror it onto the site account.
// ADMIN takes priority over DM if a member somehow has both.

export type SiteRole = "ADMIN" | "DM" | "PLAYER";

export async function resolveSiteRoleFromDiscord(discordId: string): Promise<SiteRole | null> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const adminRoleId = process.env.DISCORD_ADMIN_ROLE_ID;
  const dmRoleId = process.env.DISCORD_DM_ROLE_ID;
  if (!configured() || !guildId || (!adminRoleId && !dmRoleId)) return null; // sync not configured

  try {
    const res = await fetch(`${API}/guilds/${guildId}/members/${discordId}`, {
      headers: botHeaders(),
    });
    if (res.status === 404) return "PLAYER"; // A former guild member must lose elevated access.
    if (!res.ok) return null;
    const member = await res.json();
    const roleIds: string[] = member.roles ?? [];

    if (adminRoleId && roleIds.includes(adminRoleId)) return "ADMIN";
    if (dmRoleId && roleIds.includes(dmRoleId)) return "DM";
    return "PLAYER";
  } catch {
    return null; // Discord unreachable — don't touch the site role this login
  }
}
