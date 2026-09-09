const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { syncSession } = require('../server/session-sync');
let row, calls, failEvent, prisma;
beforeEach(() => {
  process.env.DISCORD_BOT_TOKEN = 'fake'; process.env.DISCORD_GUILD_ID = 'guild';
  calls = []; failEvent = false;
  row = { id: 's1', title: 'Mesa', scheduledAt: new Date(Date.now()-1000), participants: [], createdBy: 'dm', endedAt: null };
  prisma = { gameSession: { updateMany: async () => ({count: 1}), findUnique: async () => ({...row}), update: async ({data}) => Object.assign(row,data) }, user: { findUnique: async () => ({discordId:'dm'}), findMany: async () => [] } };
  global.fetch = async (url, options) => {
    const body = options.body && JSON.parse(options.body); calls.push({url,method: options.method,body});
    if(failEvent && url.includes('scheduled-events') && options.method === 'POST') return new Response('{}',{status:403});
    let data = {};
    if(url.endsWith('/users/@me')) data = {id:'bot'};
    else if(options.method === 'GET' && (url.endsWith('/channels') || url.endsWith('/scheduled-events'))) data = [];
    else if(url.endsWith('/channels') && options.method === 'POST') data={id:'voice'};
    else if(url.endsWith('/scheduled-events') && options.method === 'POST') data={id:'event'};
    else if(url.endsWith('/scheduled-events/event')) data={id:'event',status:row.eventStatus || 1};
    return new Response(JSON.stringify(data));
  };
});
test('creates a private channel including the bot and automatically starts due events',async()=>{
  await syncSession(prisma,'s1');
  assert.equal(row.discordEventId,'event'); assert.equal(row.discordVoiceChannelId,'voice');
  assert(calls.find(c=>c.body?.permission_overwrites?.some(p=>p.id==='bot')));
  assert(calls.find(c=>c.method==='PATCH' && c.body.status===2));
  assert.equal(row.discordSyncError,null);
});
test('partial failure persists channel and retries without creating another',async()=>{
  failEvent=true; await syncSession(prisma,'s1'); assert.match(row.discordSyncError,/403/); assert.equal(row.discordVoiceChannelId,'voice');
  failEvent=false; calls=[]; await syncSession(prisma,'s1');
  assert(!calls.some(c=>c.method==='POST' && c.url.endsWith('/channels'))); assert.equal(row.discordEventId,'event');
});
test('ending completes an active event before deleting voice and preserves history',async()=>{
  Object.assign(row,{endedAt:new Date(),discordEventId:'event',discordVoiceChannelId:'voice',eventStatus:2});
  await syncSession(prisma,'s1');
  const complete=calls.findIndex(c=>c.body?.status===3); const remove=calls.findIndex(c=>c.method==='DELETE');
  assert(complete>=0 && remove>complete); assert(row.endedAt); assert(row.discordSyncedAt);
});
test('ending a scheduled event cancels it; ending a completed event does not transition again',async()=>{
  Object.assign(row,{endedAt:new Date(),discordEventId:'event'}); await syncSession(prisma,'s1'); assert(calls.some(c=>c.body?.status===4));
  calls=[];row.eventStatus=3;await syncSession(prisma,'s1');assert(!calls.some(c=>c.method==='PATCH'));
});
test('Discord failure on completion remains pending for the worker',async()=>{
  Object.assign(row,{endedAt:new Date(),discordEventId:'event',discordVoiceChannelId:'voice'});
  global.fetch=async()=>new Response('{}',{status:503}); await syncSession(prisma,'s1');
  assert.match(row.discordSyncError,/503/); assert.equal(row.discordSyncedAt,undefined);
});
test('another synchronizer cannot acquire an occupied lease',async()=>{
  prisma.gameSession.updateMany=async()=>({count:0});await syncSession(prisma,'s1');assert.equal(calls.length,0);
});

test('Discord completion or cancellation deletes its voice room without closing the site session', async () => {
  for (const eventStatus of [3, 4]) {
    Object.assign(row, { discordEventId: 'event', discordVoiceChannelId: 'voice', eventStatus }); calls = [];
    await syncSession(prisma, 's1');
    assert(calls.some(c => c.method === 'DELETE' && c.url.endsWith('/channels/voice')));
    assert.equal(row.discordVoiceChannelId, null); assert.equal(row.endedAt, null);
    calls = []; await syncSession(prisma, 's1');
    assert(!calls.some(c => c.method === 'POST')); assert(!calls.some(c => c.method === 'DELETE'));
  }
});
test('deleted Discord events clean up only the associated room', async () => {
  Object.assign(row, { discordEventId: 'event', discordVoiceChannelId: 'voice' });
  const original = global.fetch;
  global.fetch = (url, options) => url.endsWith('/scheduled-events/event') ? Promise.resolve(new Response('{}', {status:404})) : original(url, options);
  await syncSession(prisma, 's1');
  assert.deepEqual(calls.filter(c => c.method === 'DELETE').map(c => c.url), ['https://discord.com/api/v10/channels/voice']);
  assert.equal(row.discordVoiceChannelId, null);
});
test('failed channel deletion preserves the ID for retry and never creates another room', async () => {
  Object.assign(row, { discordEventId: 'event', discordVoiceChannelId: 'voice', eventStatus: 3 });
  const original = global.fetch;
  global.fetch = (url, options) => options.method === 'DELETE' ? Promise.resolve(new Response('{}', {status:403})) : original(url, options);
  await syncSession(prisma, 's1'); assert.equal(row.discordVoiceChannelId, 'voice'); assert.match(row.discordSyncError, /403/);
  global.fetch = original; await syncSession(prisma, 's1'); assert.equal(row.discordVoiceChannelId, null); assert.equal(row.discordSyncError, null);
});
