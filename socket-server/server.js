const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();

// 꼭 배포 도메인/로컬 모두 허용!
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

let chatRooms = {};   // { matchId: [ {sender, text, time}, ... ] }
let roomUsers = {};   // { matchId: Set(socket.id, ...) }

// 소켓 연결 로그
io.on("connection", (socket) => {
  console.log(`[connect] socketId: ${socket.id}`);

  socket.on("joinRoom", ({ matchId }) => {
    socket.join(matchId);

    // 방 입장자 관리
    if (!roomUsers[matchId]) roomUsers[matchId] = new Set();
    roomUsers[matchId].add(socket.id);

    // 로그
    console.log(`[joinRoom] matchId: ${matchId}, socketId: ${socket.id}, userCount: ${roomUsers[matchId].size}`);

    // 기존 메시지 송신
    socket.emit("chatHistory", chatRooms[matchId] || []);

    // 파트너 동시 접속 확인
    if (roomUsers[matchId].size >= 2) {
      io.to(matchId).emit("partner-joined");
      console.log(`[partner-joined] matchId: ${matchId}, userCount: ${roomUsers[matchId].size}`);
    }
  });

  socket.on("leaveRoom", ({ matchId }) => {
    socket.leave(matchId);
    if (roomUsers[matchId]) {
      roomUsers[matchId].delete(socket.id);
      // 로그
      console.log(`[leaveRoom] matchId: ${matchId}, socketId: ${socket.id}, left: ${roomUsers[matchId].size}`);
      // 한 명 이하 남았으면 "partner-left" 알림
      if (roomUsers[matchId].size < 2) {
        io.to(matchId).emit("partner-left");
        console.log(`[partner-left] matchId: ${matchId}`);
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

    // 로그
    console.log(`[sendMessage] matchId: ${matchId}, sender: ${sender}, text: ${text}`);
  });

  // 연결 종료시 자동 leaveRoom 처리
  socket.on("disconnect", () => {
    console.log(`[disconnect] socketId: ${socket.id}`);
    for (const matchId in roomUsers) {
      if (roomUsers[matchId].has(socket.id)) {
        roomUsers[matchId].delete(socket.id);
        if (roomUsers[matchId].size < 2) {
          io.to(matchId).emit("partner-left");
          console.log(`[partner-left] matchId: ${matchId} (disconnect)`);
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