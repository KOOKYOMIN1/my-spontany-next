const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();

const allowedOrigins = [
  "https://my-spontany-next.vercel.app",
  "http://localhost:3000"
];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ---- 실서비스 안전성 보강 변수 ----
let chatRooms = {};   // { matchId: [ {sender, text, time}, ... ] }
let roomUsers = {};   // { matchId: Set(socket.id, ...) }
let pendingDisconnects = {}; // { matchId_socketId: timeoutId }

io.on("connection", (socket) => {
  console.log(`[connect] socketId: ${socket.id}`);

  socket.on("joinRoom", ({ matchId }) => {
    if (!matchId) return;
    socket.join(matchId);

    if (!roomUsers[matchId]) roomUsers[matchId] = new Set();
    roomUsers[matchId].add(socket.id);

    // Grace period 예약 해제
    const key = `${matchId}_${socket.id}`;
    if (pendingDisconnects[key]) {
      clearTimeout(pendingDisconnects[key]);
      delete pendingDisconnects[key];
    }

    // 기존 메시지 송신
    socket.emit("chatHistory", chatRooms[matchId] || []);

    // 파트너 동시 접속 확인
    if (roomUsers[matchId].size >= 2) {
      io.to(matchId).emit("partner-joined");
    }
  });

  socket.on("leaveRoom", ({ matchId }) => {
    if (!matchId) return;
    socket.leave(matchId);
    if (roomUsers[matchId]) {
      roomUsers[matchId].delete(socket.id);

      // Grace period 2초 후 진짜 퇴장 처리
      const key = `${matchId}_${socket.id}`;
      pendingDisconnects[key] = setTimeout(() => {
        if (roomUsers[matchId] && roomUsers[matchId].size < 2) {
          io.to(matchId).emit("partner-left");
        }
        if (roomUsers[matchId] && roomUsers[matchId].size === 0) {
          delete roomUsers[matchId];
        }
        delete pendingDisconnects[key];
      }, 2000);
    }
  });

  socket.on("sendMessage", ({ matchId, sender, text, time }) => {
    try {
      // ---- 메시지 유효성 검사/제한 ----
      if (!matchId || !sender || typeof text !== "string" || !time) return;
      if (text.length > 1000) return;

      if (!chatRooms[matchId]) chatRooms[matchId] = [];
      const msg = { sender, text, time };
      chatRooms[matchId].push(msg);

      // 메시지 히스토리 개수 제한 (최대 100개)
      if (chatRooms[matchId].length > 100) chatRooms[matchId].shift();

      io.to(matchId).emit("receiveMessage", msg);

    } catch (e) {
      socket.emit("error", "메시지 처리 오류");
      console.error("sendMessage error:", e);
    }
  });

  socket.on("disconnect", () => {
    for (const matchId in roomUsers) {
      if (roomUsers[matchId].has(socket.id)) {
        roomUsers[matchId].delete(socket.id);

        // Grace period 2초 후 진짜 퇴장 처리
        const key = `${matchId}_${socket.id}`;
        pendingDisconnects[key] = setTimeout(() => {
          if (roomUsers[matchId] && roomUsers[matchId].size < 2) {
            io.to(matchId).emit("partner-left");
          }
          if (roomUsers[matchId] && roomUsers[matchId].size === 0) {
            delete roomUsers[matchId];
          }
          delete pendingDisconnects[key];
        }, 2000);
      }
    }
  });
});

// ---- (옵션) 헬스체크 라우트 ----
app.get("/health", (req, res) => res.send("OK"));

// ---- 서버 시작 ----
server.listen(process.env.PORT || 3001, () => {
  console.log("Socket.io server on " + (process.env.PORT || 3001));
});