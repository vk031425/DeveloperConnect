// src/socket.js
import { io } from "socket.io-client";

let socket = null;
let userId = null;

export const initSocket = (id) => {
  if (!id) return console.warn("⚠️ Tried to init socket with no user ID");
  userId = id;

  // Clean old socket
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
    withCredentials: true,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("🔗 Connected:", socket.id);
    socket.emit("register", userId); // REGISTER ONLY HERE
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket error:", err.message);
  });
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};
