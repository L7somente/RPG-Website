const { createHmac, timingSafeEqual } = require("node:crypto");
function equalSecret(value, secret) {
  if (typeof value !== "string" || !secret) return false;
  const a = Buffer.from(value), b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
function createToken(userId, secret, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: now + 300000 })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}
function verifyToken(token, secret, now = Date.now()) {
  if (typeof token !== "string" || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!equalSecret(signature, createHmac("sha256", secret).update(payload).digest("base64url"))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof data.sub === "string" && Number.isFinite(data.exp) && data.exp > now && data.exp <= now + 300000 ? data : null;
  } catch { return null; }
}
module.exports = { equalSecret, createToken, verifyToken };
