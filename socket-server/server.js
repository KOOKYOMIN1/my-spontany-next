// socket-server/server.js
const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  socket.on("join", ({ matchId }) => {
    socket.join(matchId);
  });

  socket.on("leave", ({ matchId, email }) => {
    socket.leave(matchId);
    socket.to(matchId).emit("partner-left", { email });
  });

  socket.on("message", (msg) => {
    io.to(msg.matchId).emit("message", msg);
  });
});

console.log("Socket.io 서버가 3001포트에서 실행중");