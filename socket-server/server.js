const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();

const allowedOrigins = [
  "https://my-spontany-next.vercel.app", // Vercel 배포 주소
  "http://localhost:3000"                // 로컬 개발 주소
];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let chatRooms = {};      // { matchId: [ {sender, text, time}, ... ] }
let roomUsers = {};      // { matchId: Set(socket.id, ...) }

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ matchId }) => {
    socket.join(matchId);

    // 방 입장자 관리
    if (!roomUsers[matchId]) roomUsers[matchId] = new Set();
    roomUsers[matchId].add(socket.id);

    // 기존 메시지 송신
    socket.emit("chatHistory", chatRooms[matchId] || []);

    // 파트너 동시 접속 확인
    if (roomUsers[matchId].size >= 2) {
      io.to(matchId).emit("partner-joined");
    }
  });

  socket.on("leaveRoom", ({ matchId }) => {
    socket.leave(matchId);
    if (roomUsers[matchId]) {
      roomUsers[matchId].delete(socket.id);
      // 한 명 이하 남았으면 "partner-left" 알림
      if (roomUsers[matchId].size < 2) {
        io.to(matchId).emit("partner-left");
      }
      // 아무도 없으면 정리
      if (roomUsers[matchId].size === 0) {
        delete roomUsers[matchId];
      }
    }
  });

  socket.on("sendMessage", ({ matchId, sender, text, time }) => {
    if (!chatRooms[matchId]) chatRooms[matchId] = [];
    const msg = { sender, text, time };
    chatRooms[matchId].push(msg);
    io.to(matchId).emit("receiveMessage", msg);
  });

  // 연결 종료시 자동 leaveRoom 처리
  socket.on("disconnect", () => {
    for (const matchId in roomUsers) {
      if (roomUsers[matchId].has(socket.id)) {
        roomUsers[matchId].delete(socket.id);
        if (roomUsers[matchId].size < 2) {
          io.to(matchId).emit("partner-left");
        }
        if (roomUsers[matchId].size === 0) {
          delete roomUsers[matchId];
        }
      }
    }
  });
});

server.listen(3001, () => {
  console.log("Socket.io server on 3001");
});