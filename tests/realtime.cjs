const { test } = require('node:test');
const assert = require('node:assert/strict');
const { io: connect } = require('socket.io-client');
const { createRealtimeServer } = require('../server/socket-server');
const { createToken, verifyToken } = require('../server/realtime-auth');
const secret = 'test-secret-'.repeat(4);
test('signed tokens reject tampering and expiration', () => {
  const token = createToken('u', secret, 1000);
  assert.equal(verifyToken(token, secret, 1001).sub, 'u');
  assert.equal(verifyToken(token, secret, 301000), null);
  assert.equal(verifyToken(token + 'x', secret, 1001), null);
  assert.equal(verifyToken(token, 'other', 1001), null);
});
test('realtime rejects anonymous publishing and keeps chat private', async (t) => {
  const { server, io } = createRealtimeServer({ secret });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const sockets = [];
  t.after(async () => { sockets.forEach(s => s.disconnect()); await new Promise(resolve => io.close(resolve)); });
  async function client(auth = {}) {
    const socket = connect(url, { auth, transports: ['websocket'], reconnection: false }); sockets.push(socket);
    await new Promise((resolve, reject) => { socket.once('connect', resolve); socket.once('connect_error', reject); });
    return socket;
  }
  const anonymous = await client();
  const reader = await client({ token: createToken('user', secret) });
  const service = await client({ secret });
  let leaked = 0, forged = 0;
  anonymous.on('chat-message', () => leaked++);
  reader.on('chat-message', msg => { if (msg.id === 'forged') forged++; });
  const msg = { id: 'real', displayName: 'Player', source: 'site', content: 'Hello' };
  assert.equal((await fetch(`${url}/broadcast-chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) })).status, 401);
  assert.equal((await fetch(`${url}/broadcast-xp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
  anonymous.emit('relay-to-site', { ...msg, id: 'forged', source: 'discord' });
  reader.emit('relay-to-site', { ...msg, id: 'forged', source: 'discord' });
  const received = new Promise(resolve => reader.once('chat-message', resolve));
  assert.equal((await fetch(`${url}/broadcast-chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` }, body: JSON.stringify(msg) })).status, 200);
  assert.equal((await received).id, 'real');
  const relayed = new Promise(resolve => reader.once('chat-message', resolve));
  service.emit('relay-to-site', { ...msg, id: 'discord', source: 'discord' });
  assert.equal((await relayed).id, 'discord');
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(leaked, 0); assert.equal(forged, 0);
  const bad = connect(url, { auth: { token: 'forged' }, reconnection: false }); sockets.push(bad);
  assert.equal((await new Promise(resolve => bad.once('connect_error', resolve))).message, 'Unauthorized');
});
