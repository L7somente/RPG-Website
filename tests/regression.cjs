const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
}).outputText, filename);
let session;
const prisma = {};
const originalLoad = Module._load;
Module._load = function(name, parent, isMain) {
  if (name === 'next-auth') return { getServerSession: async () => session };
  if (name === '@/lib/auth') return { authOptions: {} };
  if (name === '@/lib/prisma' || (name === './prisma' && parent.filename.startsWith(root))) return { prisma };
  if (name === '@/lib/realtime' || (name === './realtime' && parent.filename.startsWith(root))) return { broadcast: async () => {} };
  if (name === '@/lib/discord' || (name === './discord' && parent.filename.startsWith(root))) return { resolveSiteRoleFromDiscord: async () => null, archiveDiscordForumPost: async () => {} };
  if (name.startsWith('@/')) name = path.join(root, name.slice(2));
  return originalLoad.call(this, name, parent, isMain);
};
const { characterPatchSchema, itemPatchSchema } = require('../lib/validation.ts');
const characters = require('../app/api/characters/[id]/route.ts');
const items = require('../app/api/characters/[id]/inventory/[itemId]/route.ts');
const quests = require('../app/api/quests/[id]/route.ts');
const { authOptions } = require('../lib/auth.ts');
const { awardXP } = require('../lib/xp.ts');
const { Prisma } = require('@prisma/client');
const request = (body) => new Request('http://localhost', { method: 'PATCH', body: JSON.stringify(body) });
const params = (values) => ({ params: Promise.resolve(values) });
beforeEach(() => {
  session = { user: { id: 'owner', role: 'DM' } };
  Object.keys(prisma).forEach(k => delete prisma[k]);
});
test('rejects nested account updates, ownership changes and unknown fields', () => {
  for (const patch of [{ user: { update: { role: 'ADMIN' } } }, { userId: 'other' }, { id: 'other' }, { inventory: { deleteMany: {} } }]) {
    assert.equal(characterPatchSchema.safeParse(patch).success, false);
  }
  assert.equal(characterPatchSchema.safeParse({ currentHp: 8, notes: 'hello', classes: [{ id: 'wizard', level: 2 }] }).success, true);
  assert.equal(characterPatchSchema.safeParse({ strength: 999 }).success, false);
  assert.equal(itemPatchSchema.safeParse({ character: { connect: { id: 'other' } } }).success, false);
});
test('character API refuses privilege escalation before writing', async () => {
  prisma.character = { findUnique: async () => ({ userId: 'owner' }), update: () => assert.fail('must not write') };
  assert.equal((await characters.PATCH(request({ user: { update: { role: 'ADMIN' } } }), params({ id: 'c' }))).status, 400);
});
test('character API denies another owner', async () => {
  prisma.character = { findUnique: async () => ({ userId: 'other' }), update: () => assert.fail('must not write') };
  assert.equal((await characters.PATCH(request({ name: 'New' }), params({ id: 'c' }))).status, 404);
});
test('inventory writes and deletes are constrained to the character', async () => {
  prisma.character = { findUnique: async () => ({ userId: 'owner' }) };
  const missing = ({ where }) => {
    assert.deepEqual(where, { id: 'foreign', characterId: 'owned' });
    throw { code: 'P2025' };
  };
  prisma.inventoryItem = { update: missing, delete: missing };
  assert.equal((await items.PATCH(request({ equipped: true }), params({ id: 'owned', itemId: 'foreign' }))).status, 404);
  assert.equal((await items.DELETE(request({}), params({ id: 'owned', itemId: 'foreign' }))).status, 404);
});
test('session uses current database permissions instead of stale token', async () => {
  prisma.user = { findUnique: async () => ({ id: 'owner', role: 'PLAYER', username: 'new' }) };
  const result = await authOptions.callbacks.session({ session: { user: {} }, token: { id: 'owner', role: 'ADMIN' } });
  assert.equal(result.user.role, 'PLAYER');
});
test('deleted accounts lose their session identity', async () => {
  prisma.user = { findUnique: async () => null };
  assert.equal((await authOptions.callbacks.session({ session: { user: {} }, token: { id: 'gone' } })).user, undefined);
});
test('matching a legacy username creates a separate account', async () => {
  let created;
  prisma.user = {
    findUnique: async ({ where }) => where.username === 'Legacy' ? { id: 'legacy', role: 'ADMIN' } : null,
    create: async ({ data }) => { created = data; return { id: 'new', ...data }; },
    update: () => assert.fail('must not claim legacy account'), findFirst: () => assert.fail('must not match legacy name'),
  };
  assert.equal(await authOptions.callbacks.signIn({ user: {}, account: { provider: 'discord' }, profile: { id: 'discord-new', username: 'Legacy' } }), true);
  assert.equal(created.role, 'PLAYER'); assert.equal(created.username, 'Legacy1');
});
function world() {
  let state = { quest: { id: 'q', title: 'Quest', description: 'Story', status: 'active', completedAt: null, xpReward: 100 }, xp: { currentXP: 0, currentLevel: 1, xpToNextLevel: 1000 }, logs: [] };
  const tx = {
    quest: { findUnique: async () => ({ ...state.quest }), update: async ({ data }) => (state.quest = { ...state.quest, ...data }) },
    missionLogEntry: { create: async ({ data }) => state.logs.push(data) },
    globalXP: { upsert: async () => ({ ...state.xp }), update: async ({ data }) => (state.xp = { ...state.xp, ...data }) },
  };
  prisma.$transaction = async (work) => { const snapshot = structuredClone(state); try { return await work(tx); } catch (e) { state = snapshot; throw e; } };
  return { state: () => state, tx };
}
test('completion awards XP once and cannot be reopened', async () => {
  const w = world();
  for (let i = 0; i < 2; i++) assert.equal((await quests.PATCH(request({ status: 'completed' }), params({ id: 'q' }))).status, 200);
  assert.equal(w.state().xp.currentXP, 100); assert.equal(w.state().logs.length, 1);
  assert.equal((await quests.PATCH(request({ status: 'active' }), params({ id: 'q' }))).status, 409);
});
test('rejected quests cannot bypass approval', async () => {
  const w = world(); w.state().quest.status = 'rejected';
  assert.equal((await quests.PATCH(request({ status: 'completed' }), params({ id: 'q' }))).status, 409);
  assert.equal(w.state().logs.length, 0);
});
test('failed XP write rolls back quest and mission log', async () => {
  const w = world(); w.tx.globalXP.update = async () => { throw new Error('simulated database failure'); };
  assert.equal((await quests.PATCH(request({ status: 'completed' }), params({ id: 'q' }))).status, 500);
  assert.equal(w.state().quest.status, 'active'); assert.equal(w.state().logs.length, 0);
});
test('serialization conflicts retry and XP rolls across levels', async () => {
  const w = world(); const transact = prisma.$transaction; let calls = 0;
  prisma.$transaction = async (work, options) => {
    assert.equal(options.isolationLevel, 'Serializable');
    if (calls++ === 0) throw new Prisma.PrismaClientKnownRequestError('conflict', { code: 'P2034', clientVersion: '5' });
    return transact(work);
  };
  const result = await awardXP(2300);
  assert.equal(result.currentLevel, 3); assert.equal(result.currentXP, 50); assert.equal(calls, 2);
  await assert.rejects(() => awardXP(-1)); await assert.rejects(() => awardXP(1.5));
});

test('world cap rejects direct levels, multiclass totals and mismatched summaries', async () => {
  const { constrainedLevel } = require('../lib/world-level.ts');
  const current = {level: 2, classes: [{id:'fighter',level:2}]};
  assert.equal(constrainedLevel(current,{level:8},3),null);
  assert.equal(constrainedLevel(current,{classes:[{id:'fighter',level:2},{id:'wizard',level:2}]},3),null);
  assert.equal(constrainedLevel(current,{classes:[{id:'fighter',level:2},{id:'wizard',level:1}],level:3},3),3);
  prisma.character = {findUnique:async()=>({...current,userId:'owner'}),update:()=>assert.fail('must not write')};
  prisma.globalXP = {findUnique:async()=>({currentLevel:3})};
  prisma.$transaction = async callback => callback(prisma);
  assert.equal((await characters.PATCH(request({classes:[{id:'wizard',level:4}]}),params({id:'c'}))).status,400);
});

test('only the assigned DM or an admin can end a game session', async () => {
  const routes = require('../app/api/sessions/[id]/route.ts');
  prisma.gameSession = { findUnique: async () => ({id:'s',createdBy:'another-dm'}), updateMany: () => assert.fail('must not write') };
  assert.equal((await routes.PATCH(request({action:'end'}),params({id:'s'}))).status,403);
  session = {user:{id:'another-dm',role:'PLAYER'}};
  assert.equal((await routes.PATCH(request({action:'end'}),params({id:'s'}))).status,403);
});
test('ending preserves the game session even when Discord is unconfigured', async () => {
  const routes = require('../app/api/sessions/[id]/route.ts');
  let row = {id:'s',createdBy:'owner',endedAt:null};
  prisma.gameSession = {
    findUnique:async()=>row,
    updateMany:async({data})=>{if(data.endedAt)row={...row,...data};return {count:0};},
    delete:()=>assert.fail('history must remain')
  };
  // A synchronizer already holds the lease, so the DM must retry instead of racing it.
  assert.equal((await routes.PATCH(request({action:'end'}),params({id:'s'}))).status,409);
});
test('valid multiclass writes derive total level and proficiency inside a transaction',async()=>{
  let saved;
  prisma.character={findUnique:async()=>({userId:'owner',level:1,classes:[{id:'fighter',level:1}]}),update:async({data})=>(saved=data)};
  prisma.globalXP={findUnique:async()=>({currentLevel:5})};
  prisma.$transaction=async callback=>callback(prisma);
  const response=await characters.PATCH(request({classes:[{id:'fighter',level:3},{id:'wizard',level:2}],proficiencyBonus:99}),params({id:'c'}));
  assert.equal(response.status,200);assert.equal(saved.level,5);assert.equal(saved.proficiencyBonus,3);
});

test('distance conversion supports exact metres, fractional edits and zero', () => {
  const { displayDistance, distanceInFeet } = require('../lib/distance.ts');
  assert.equal(displayDistance(30,'m'),9.144);
  assert.equal(displayDistance(5,'m'),1.524);
  assert.equal(distanceInFeet(9.144,'m'),30);
  assert.equal(displayDistance(distanceInFeet(9,'m'),'m'),9);
  assert.equal(displayDistance(0,'m'),0);
  assert.equal(characterPatchSchema.safeParse({speed:distanceInFeet(9,'m')}).success,true);
  for(const speed of [-1,NaN,Infinity,1000001]) assert.equal(characterPatchSchema.safeParse({speed}).success,false);
});
