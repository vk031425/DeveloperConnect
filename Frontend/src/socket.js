// src/socket.js
import { io } from "socket.io-client";

let socket = null; // Shared socket instance
let userId = null; // Track current user

// ✅ Initialize a socket connection for a user
export const initSocket = (id) => {
  if (!id) return console.warn("⚠️ Tried to init socket with no user ID");
  userId = id;

  // If an old socket exists, cleanly close it first
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Create a new socket instance
  socket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
    withCredentials: true,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  // Register events once
  socket.on("connect", () => {
    console.log("🔗 Connected to server:", socket.id);
    socket.emit("register", userId); // ✅ Re-register user after reconnect
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connection error:", err.message);
  });
};

// ✅ Return the active socket instance
export const getSocket = () => {
  return socket;
};

// ✅ Cleanly disconnect (used on logout)
export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};
