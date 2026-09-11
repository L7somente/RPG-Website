const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, f);
let auth, session, character, access, role;
const prisma = {
  user: { findUnique: async () => role ? { id: 'owner', role } : null },
  gameSession: { findUnique: async () => session },
  character: { findUnique: async () => character },
  owlbearAccess: { findUnique: async () => access },
};
const original = Module._load;
Module._load = function(n, p, main) {
  if (n === 'next-auth') return { getServerSession: async () => auth };
  if (n === '@/lib/auth') return { authOptions: {} };
  if (n === '@/lib/prisma') return { prisma };
  return original.call(this, n.startsWith('@/') ? path.join(root, n.slice(2)) : n, p, main);
};
const { parseOwlbearRoom, allowedOwlbearCharacter } = require('../lib/owlbear.ts');
const sheet = require('../app/api/owlbear/sheet/route.ts');
const room = require('../app/api/sessions/[id]/owlbear/route.ts');
const pairing = require('../app/api/owlbear/access/route.ts');
const request = () => new Request('http://localhost/api/owlbear/sheet', { headers: { Authorization: 'Bearer ' + 'a'.repeat(43), 'X-Owlbear-Room': 'room1' } });
beforeEach(() => {
  auth = { user: { id: 'owner', role: 'PLAYER' } }; role = 'PLAYER';
  session = { id: 'session', title: 'Mesa', createdBy: 'dm', endedAt: null, owlbearRoomId: 'room1', participants: [{ userId: 'owner', characterId: 'c', confirmed: true }] };
  character = { id: 'c', userId: 'owner', name: 'Hero', currentHp: 5 };
  access = { userId: 'owner', sessionId: 'session', characterId: 'c', roomId: 'room1', expiresAt: new Date(Date.now() + 60000) };
});
test('room URLs reject lookalike hosts, credentials, non-HTTPS and non-room paths', () => {
  assert.equal(parseOwlbearRoom('https://www.owlbear.rodeo/room/abc/My-Room').owlbearRoomId, 'abc');
  for (const url of ['https://owlbear.rodeo.evil.com/room/a', 'http://owlbear.rodeo/room/a', 'https://user@owlbear.rodeo/room/a', 'https://owlbear.rodeo/profile', 'javascript:alert(1)', 'https://owlbear.rodeo:444/room/a']) assert.throws(() => parseOwlbearRoom(url));
});
test('read access requires ownership and confirmed participation with that character', async () => {
  assert.ok(await allowedOwlbearCharacter('owner', 'session', 'c'));
  character.userId = 'other'; assert.equal(await allowedOwlbearCharacter('owner', 'session', 'c'), null);
  character.userId = 'owner'; session.participants[0].confirmed = false; assert.equal(await allowedOwlbearCharacter('owner', 'session', 'c'), null);
  session.participants[0].confirmed = true; session.participants[0].characterId = 'another'; assert.equal(await allowedOwlbearCharacter('owner', 'session', 'c'), null);
});
test('sheet checks expiration, revocation, room, ended sessions and deleted accounts', async () => {
  const valid = await sheet.GET(request()); assert.equal(valid.status, 200); assert.equal(valid.headers.get('cache-control'), 'no-store');
  assert.equal((await valid.json()).character.userId, undefined);
  access.expiresAt = new Date(0); assert.equal((await sheet.GET(request())).status, 401);
  access.expiresAt = new Date(Date.now() + 60000); access.roomId = 'other'; assert.equal((await sheet.GET(request())).status, 401);
  access.roomId = 'room1'; session.endedAt = new Date(); assert.equal((await sheet.GET(request())).status, 401);
  session.endedAt = null; role = null; assert.equal((await sheet.GET(request())).status, 401);
  role = 'PLAYER'; access = null; assert.equal((await sheet.GET(request())).status, 401);
});
test('room linking denies players and another DM', async () => {
  const ctx = { params: Promise.resolve({ id: 'session' }) };
  assert.equal((await room.PUT(new Request('http://localhost'), ctx)).status, 403);
  auth.user.role = 'DM'; assert.equal((await room.PUT(new Request('http://localhost'), ctx)).status, 403);
});
test('pairing cannot issue credentials for a different owner', async () => {
  character.userId = 'other';
  const res = await pairing.POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ sessionId: 'session', characterId: 'c' }) }));
  assert.equal(res.status, 403);
});
