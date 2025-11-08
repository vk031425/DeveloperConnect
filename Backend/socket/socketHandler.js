import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔗 User connected:", socket.id);

    // ✅ Register user when logged in
    socket.on("register", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log("User registered:", userId);
    });

    // 💬 Handle sending a message
    socket.on("send-message", (data) => {
      const { receiverId, message } = data;
      const receiverSocket = onlineUsers.get(receiverId?.toString());
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", message);
      }
    });

    // ✍️ Optional typing indicator
    socket.on("typing", ({ receiverId, senderId }) => {
      const receiverSocket = onlineUsers.get(receiverId?.toString());
      if (receiverSocket) {
        io.to(receiverSocket).emit("typing", senderId);
      }
    });

    // ❌ Remove disconnected users
    socket.on("disconnect", () => {
      for (const [key, value] of onlineUsers.entries()) {
        if (value === socket.id) onlineUsers.delete(key);
      }
      console.log("❌ User disconnected:", socket.id);
    });
  });
};

// ✅ Helper to send notifications (used by controllers)
export const sendNotification = (userId, notification) => {
  if (!io) return;
  const socketId = onlineUsers.get(userId.toString());
  if (socketId) io.to(socketId).emit("new-notification", notification);
};

// ✅ Helper to send real-time message delivery
export const sendMessageToUser = (receiverId, message) => {
  if (!io) return;
  const socketId = onlineUsers.get(receiverId.toString());
  if (socketId) io.to(socketId).emit("receive-message", message);
};
