// lib/socket-client.js
import { io } from "socket.io-client";
let socket;

if (typeof window !== "undefined") {
  if (!window.__spontanySocket) {
    window.__spontanySocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");
  }
  socket = window.__spontanySocket;
}

export default socket;