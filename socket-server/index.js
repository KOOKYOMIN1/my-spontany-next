const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const { v4: uuidv4 } = require("uuid"); // UUID 생성기 추가

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
let waitingUser = null; // 전역에 추가
let waitingQueue = []; // 대기열 추가

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

  // 매칭 대기 큐 진입
  socket.on("joinMatchQueue", (userInfo) => {
    if (!waitingQueue.find(u => u.userId === userInfo.userId)) {
      waitingQueue.push({ ...userInfo, socketId: socket.id });
      console.log("[서버] 큐 진입:", userInfo.userId, waitingQueue.length);
    }
    tryMatch();
  });

  // 매칭 대기 취소
  socket.on("cancelMatchWait", () => {
    const idx = waitingQueue.findIndex(u => u.socketId === socket.id);
    if (idx !== -1) {
      waitingQueue.splice(idx, 1);
      console.log("[서버] 큐 취소:", socket.id);
    }
    socket.emit("matchWaitCanceled");
  });

  // 연결 끊기면 큐에서 제거
  socket.on("disconnect", () => {
    const idx = waitingQueue.findIndex(u => u.socketId === socket.id);
    if (idx !== -1) {
      waitingQueue.splice(idx, 1);
      console.log("[서버] 큐에서 제거(연결끊김):", socket.id);
    }
  });

  // 매칭 시도 함수
  function tryMatch() {
    if (waitingQueue.length >= 2) {
      const userA = waitingQueue.shift();
      const userB = waitingQueue.shift();
      const matchId = uuidv4();
      io.to(userA.socketId).emit("matched", { matchId });
      io.to(userB.socketId).emit("matched", { matchId });
      console.log("[서버] 매칭 성사!", matchId);
    }
  }
}
);
// ---- (옵션) 헬스체크 라우트 ----
app.get("/health", (req, res) => res.send("OK"));

// ---- 서버 시작 ----
server.listen(process.env.PORT || 3001, () => {
  console.log("Socket.io server on " + (process.env.PORT || 3001));
});

