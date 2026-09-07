require("dotenv").config();
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const { equalSecret, verifyToken } = require("./realtime-auth");
function createRealtimeServer({ secret = process.env.SOCKET_SERVER_SECRET, origin = process.env.NEXTAUTH_URL || "http://localhost:3000" } = {}) {
if (!secret || secret.length < 32) throw new Error("SOCKET_SERVER_SECRET must contain at least 32 characters");
const app = express();
app.use(express.json({ limit: "32kb" }));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin } });
io.use((socket, next) => {
  const auth = socket.handshake.auth || {};
  if (equalSecret(auth.secret, secret)) socket.data.service = true;
  else if (auth.token) {
    const claims = verifyToken(auth.token, secret);
    if (!claims) return next(new Error("Unauthorized"));
    socket.data.claims = claims;
  }
  next(); // Anonymous clients receive public XP only.
});
io.on("connection", (socket) => {
  if (socket.data.service || socket.data.claims) socket.join("chat");
  if (socket.data.claims) {
    const timer = setTimeout(() => socket.disconnect(true), socket.data.claims.exp - Date.now());
    socket.on("disconnect", () => clearTimeout(timer));
  }
  socket.on("relay-to-site", (msg) => {
    if (socket.data.service && validMessage(msg) && msg.source === "discord") io.to("chat").emit("chat-message", msg);
  });
});
function validMessage(msg) {
  return msg && typeof msg.id === "string" && typeof msg.displayName === "string" &&
    typeof msg.content === "string" && msg.content.length <= 2000 && ["site", "discord"].includes(msg.source);
}
function serviceOnly(req, res, next) {
  if (!equalSecret(req.headers.authorization, `Bearer ${secret}`)) return res.status(401).json({ error: "Unauthorized" });
  next();
}
app.post("/broadcast-xp", serviceOnly, (req, res) => {
  if (!["currentXP", "currentLevel", "xpToNextLevel"].every((key) => Number.isSafeInteger(req.body[key]) && req.body[key] >= 0)) return res.sendStatus(400);
  io.emit("xp-update", req.body);
  res.json({ ok: true });
});
app.post("/broadcast-chat", serviceOnly, (req, res) => {
  if (!validMessage(req.body)) return res.sendStatus(400);
  io.to("chat").emit("chat-message", req.body);
  res.json({ ok: true });
});
return { server, io };
}
module.exports = { createRealtimeServer };
if (require.main === module) createRealtimeServer().server.listen(process.env.SOCKET_SERVER_PORT || 4000);
