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
      if (!userId) return;

      // Clean duplicates
      for (const [key, value] of onlineUsers.entries()) {
        if (key === userId || value === socket.id) {
          onlineUsers.delete(key);
        }
      }

      onlineUsers.set(userId.toString(), socket.id);
      console.log("✅ User registered:", userId, "→", socket.id);

      // Broadcast to others
      io.emit("user-online", userId);
    });

    // 💬 Handle message delivery
    socket.on("send-message", (data) => {
      const { receiverId, message } = data;
      const receiverSocket = onlineUsers.get(receiverId?.toString());
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", message);
        console.log(`📨 Message sent to user ${receiverId}`);
      } else {
        console.log(`⚠️ Receiver ${receiverId} not online`);
      }
    });

    // ✍️ Typing event
    socket.on("typing", ({ receiverId, senderId }) => {
      const receiverSocket = onlineUsers.get(receiverId?.toString());
      if (receiverSocket) io.to(receiverSocket).emit("typing", senderId);
    });

    // ❌ Handle disconnection
    socket.on("disconnect", () => {
      let disconnectedUser = null;
      for (const [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          disconnectedUser = key;
          onlineUsers.delete(key);
          console.log("❌ User disconnected:", key);
          break;
        }
      }

      if (disconnectedUser) {
        io.emit("user-offline", disconnectedUser);
      }
    });
  });
};

// ✅ Helper to send notifications
export const sendNotification = (userId, notification) => {
  if (!io || !userId) return;
  const socketId = onlineUsers.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("new-notification", notification);
    console.log(`🔔 Notification sent to user ${userId}`);
  }
};

// ✅ Helper to send message delivery
export const sendMessageToUser = (receiverId, message) => {
  if (!io || !receiverId) return;
  const socketId = onlineUsers.get(receiverId.toString());
  if (socketId) {
    io.to(socketId).emit("receive-message", message);
    console.log(`💬 Delivered message to user ${receiverId}`);
  }
};
