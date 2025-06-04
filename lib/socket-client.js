import { io } from "socket.io-client";
let socket = null;

if (typeof window !== "undefined") {
  if (!window.__spontanySocket) {
    window.__spontanySocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
      secure: true,
      reconnection: true,
      reconnectionDelay: 700,
      reconnectionAttempts: 5,
    });
  }
  socket = window.__spontanySocket;
}

export default socket;