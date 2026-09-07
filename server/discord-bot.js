// Bridges the in-site "Party Chat" with a Discord channel:
//   Discord -> site:  bot listens for messages in DISCORD_CHANNEL_ID, saves
//                      them to the ChatMessage table, and broadcasts them to
//                      the site over the socket server so open tabs update live.
//   Site -> Discord:  server/socket-server.js re-emits "chat-message" events;
//                      this bot also listens on that socket connection and
//                      posts site-originated messages into the Discord channel.
//
// Requires a bot application in the Discord Developer Portal with the
// "Message Content" privileged intent enabled, invited to your server with
// permission to read/send messages in the target channel.
//
// Run with: node server/discord-bot.js

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { io } = require("socket.io-client");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
if (!process.env.SOCKET_SERVER_SECRET || process.env.SOCKET_SERVER_SECRET.length < 32) throw new Error("Configure SOCKET_SERVER_SECRET");
const socket = io(process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
  auth: { secret: process.env.SOCKET_SERVER_SECRET },
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => console.log(`Discord bot logged in as ${client.user.tag}`));

// Discord -> site
client.on("messageCreate", async (message) => {
  if (message.channelId !== process.env.DISCORD_CHANNEL_ID) return;
  if (message.author.bot) return; // don't echo the bot's own relayed messages

  // Match the Discord author to a site account (linked via discordId at login).
  const user = await prisma.user.findUnique({
    where: { discordId: message.author.id },
  });

  const saved = await prisma.chatMessage.create({
    data: {
      userId: user?.id ?? null,
      // Prefer the site username so it matches what's shown everywhere else
      // on the site; fall back to the Discord display name for unlinked users.
      displayName: user?.username ?? (message.member?.displayName ?? message.author.username),
      source: "discord",
      content: message.content,
    },
  });

  socket.emit("relay-to-site", saved); // socket-server.js should re-emit this as "chat-message"
});

// Site -> Discord
socket.on("chat-message", (msg) => {
  if (msg.source !== "site") return; // avoid re-posting Discord-origin messages back to Discord
  const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
  if (channel?.isTextBased()) {
    channel.send({ content: `**${msg.displayName}**: ${msg.content}`.slice(0, 2000), allowedMentions: { parse: [] } })
      .catch((error) => console.error("Discord delivery failed", error));
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
