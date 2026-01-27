import { createServer } from "http";
import { jwtVerify } from "jose";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const MAX_MESSAGE_LENGTH = 500;
const JOIN_COOLDOWN = 3000;
const MAX_CHAT_HISTORY = 60;
const TOKEN_MAX = 2;
const TOKEN_REFILL_TIME = 3000;
const FORBIDDEN_WORDS = [
  "fuck", "fucked", "fucking", "dick", "pusy", "niga", "niger", "niggr", "asshole",
  "کص", "کصکش", "کیر", "کیرم", "کیری", "کون", "کونی", "جنده", "گایید",
  "kos", "kir", "kiram", "kiri", "jende", "gaiid",
  "شاه", "خمینی", "خامنه",
  "shah", "khomeini", "khamene"
];

const channels = new Map();
const histories = new Map();
const bans = new Map();

const appNext = next({ dev, hostname, port });
const handle = appNext.getRequestHandler();

const normalizeText = text => text.toLowerCase()
  .replace(/[يى]/g, "ی")
  .replace(/[ك]/g, "ک")
  .replace(/[\u064B-\u065F]/g, "")
  .replace(/[\u200c\u200f]/g, "")
  .replace(/ـ/g, "")
  .replace(/(.)\1+/g, "$1");

const censorForbiddenWords = text => {
  let result = text;
  const boundary = "(?:[^a-zA-Z\\u0600-\\u06FF]|^)";
  const boundaryEnd = "(?:[^a-zA-Z\\u0600-\\u06FF]|$)";
  for (const word of FORBIDDEN_WORDS) {
    const pattern = normalizeText(word).split("").map(ch => ch === "ی" ? "[یيى]+" : ch === "ک" ? "[کك]+" : `${ch}+`).join("");
    result = result.replace(new RegExp(`${boundary}${pattern}${boundaryEnd}`, "gi"), m => "*".repeat(m.length));
  }
  return result;
};

const refillTokens = client => {
  const now = Date.now();
  const refill = Math.floor((now - client.lastRefill) / TOKEN_REFILL_TIME);
  if (refill > 0) {
    client.tokens = Math.min(TOKEN_MAX, client.tokens + refill);
    client.lastRefill = now;
  }
};

const isBanned = (channel, username) => {
  const until = bans.get(channel)?.get(username);
  if (!until) return { banned: false, remaining: 0 };

  const now = Date.now();
  if (now > until) {
    bans.get(channel).delete(username);
    return { banned: false, remaining: 0 };
  }

  return { banned: true, remaining: until - now };
};

const isNicknameTaken = (channel, nickname) => {
  const channelMap = channels.get(channel);
  if (!channelMap) return false;
  nickname = nickname.toLowerCase();
  for (const c of channelMap.values()) {
    if (c.nickname.toLowerCase() === nickname)
      return true;
  }
  return false;
};

const broadcastCount = channel => {
  const channelMap = channels.get(channel);
  if (!channelMap) return;
  const users = new Set([...channelMap.values()].filter(c => c.socket.connected).map(c => c.nickname));
  channelMap.forEach(c => c.socket.emit("count", users.size));
};

const broadcastMessage = (channel, message) => {
  const channelMap = channels.get(channel);
  if (!channelMap) return;
  if (message.whisperTo) channelMap.forEach(c => {
    if (c.nickname === message.whisperTo || c.nickname === message.nickname)
      c.socket.emit("message", message);
  });
  else {
    channelMap.forEach(c => c.socket.emit("message", message));
    if (!histories.has(channel)) histories.set(channel, []);
    histories.get(channel).push(message);
    if (histories.get(channel).length > MAX_CHAT_HISTORY) histories.get(channel).shift();
  }
};

const handleMessage = (client, channel, msg) => {
  if (!msg?.content) return client.socket.emit("error", "Invalid message");

  const banStatus = isBanned(channel, client.username);
  if (banStatus.banned) {
    const seconds = Math.ceil(banStatus.remaining / 1000);
    return client.socket.emit("error", `You are banned for another ${seconds} seconds`);
  }

  if (Date.now() - client.joinedAt < JOIN_COOLDOWN) return client.socket.emit("error", "Please wait before chatting");
  refillTokens(client);
  if (client.tokens <= 0) return client.socket.emit("error", "Slow down");
  client.tokens--;
  if (msg.content.length > MAX_MESSAGE_LENGTH) return client.socket.emit("error", "Message too long");
  broadcastMessage(channel, {
    id: Date.now() + Math.random(),
    timestamp: Date.now(),
    username: client.username,
    nickname: client.nickname,
    content: censorForbiddenWords(msg.content),
    replyToId: msg.replyToId || null,
    replyToPreview: msg.replyToPreview || null,
    whisperTo: msg.whisperTo || null
  });
};

appNext.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new SocketIOServer(httpServer, { cors: { origin: "*" } });

  io.on("connection", async socket => {
    const cookies = Object.fromEntries((socket.handshake.headers.cookie || "").split(";").map(c => { const [k, v] = c.trim().split("="); return [k, v]; }));
    const token = cookies.token || null;
    const nicknameCookie = cookies.nickname || null;
    const { channel } = socket.handshake.query;
    if (!channel) { socket.emit("error", "No channel provided"); return socket.disconnect(true); }

    let username, nickname, isAdmin = false;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (!payload.username) throw new Error();
        username = payload.username;
        nickname = payload.name || payload.username;
        isAdmin = username === channel;
        if (isNicknameTaken(channel, nickname)) {
          let counter = 2;
          let baseNickname = nickname;
          while (isNicknameTaken(channel, nickname)) {
            nickname = `${baseNickname} (${counter})`;
            counter++;
          }
        }
      } catch {
        socket.emit("error", "Invalid token");
        return socket.disconnect(true);
      }
    } else {
      if (!nicknameCookie || nicknameCookie.length < 2) {
        socket.emit("error", "Guest nickname required");
        return socket.disconnect(true);
      }
      nickname = decodeURIComponent(nicknameCookie).trim().slice(0, 20);
      username = `guest_${socket.id.slice(0, 6)}`;

      if (nickname.toLowerCase() === channel.toLowerCase() || isNicknameTaken(channel, nickname)) {
        let counter = 2;
        let baseNickname = nickname;
        while (nickname.toLowerCase() === channel.toLowerCase() || isNicknameTaken(channel, nickname)) {
          nickname = `${baseNickname} (${counter})`;
          counter++;
        }
      }
    }

    if (!channels.has(channel)) channels.set(channel, new Map());
    const client = { socket, username, nickname, isAdmin, joinedAt: Date.now(), tokens: TOKEN_MAX, lastRefill: Date.now() };
    channels.get(channel).set(socket.id, client);

    socket.on("disconnect", () => {
      const map = channels.get(channel);
      if (map) {
        map.delete(socket.id);
        if (!map.size) channels.delete(channel);
      }
      broadcastCount(channel);
    });

    histories.get(channel)?.forEach(m => !m.whisperTo && socket.emit("message", m));
    broadcastCount(channel);

    socket.on("message", msg => handleMessage(client, channel, msg));
    socket.on("delete", messageId => {
      if (!client.isAdmin) return socket.emit("error", "Only streamer can delete messages");
      const history = histories.get(channel);
      if (!history) return;
      const index = history.findIndex(m => m.id === messageId);
      if (index !== -1) {
        history.splice(index, 1);
        channels.get(channel)?.forEach(c => c.socket.emit("deleted", messageId));
      }
    });
    socket.on("ban", targetUsername => {
      if (!client.isAdmin) return socket.emit("error", "Only streamer can ban users");
      if (!bans.has(channel)) bans.set(channel, new Map());
      bans.get(channel).set(targetUsername, Date.now() + 5 * 60 * 1000);
      channels.get(channel)?.forEach(c => {
        if (c.username === targetUsername) c.socket.emit("error", "You are banned for 5 minutes");
      });
    });
  });

  httpServer.listen(port, () => console.log(`> Server running at http://${hostname}:${port}`));
});
