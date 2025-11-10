import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URLI, process.env.FRONTEND_URLII],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔗 User connected:", socket.id);

    // ✅ Register user
    socket.on("register", (userId) => {
      if (!userId) return;
      for (const [key, value] of onlineUsers.entries()) {
        if (key === userId || value === socket.id) onlineUsers.delete(key);
      }
      onlineUsers.set(userId.toString(), socket.id);
      console.log("✅ User registered:", userId, "→", socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // ✉️ Send-message handler + real-time alert
    socket.on("send-message", (data) => {
      const { receiverId, message } = data;
      const receiverSocket = onlineUsers.get(receiverId?.toString());
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", message);

        // 🟢 Emit a separate message-alert event for unread badge
        io.to(receiverSocket).emit("new-message-alert", {
          senderId: message.sender?._id,
          text: message.text,
          conversation: message.conversation,
        });

        console.log(`📨 Message sent to user ${receiverId}`);
      } else {
        console.log(`⚠️ Receiver ${receiverId} not online`);
      }
    });

    // ✍️ Typing
    socket.on("typing", ({ receiverId, senderId }) => {
      const receiverSocket = onlineUsers.get(receiverId?.toString());
      if (receiverSocket) io.to(receiverSocket).emit("typing", senderId);
    });

    socket.on("get-online-users", () => {
      socket.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on("notifications-read", () => {
      for (const [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          io.to(sid).emit("notifications-read");
          console.log(`📩 Notifications marked as read by ${userId}`);
          break;
        }
      }
    });

    // ❌ Disconnect
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
        io.emit("online-users", Array.from(onlineUsers.keys()));
      }
    });
  });
};

// ✅ Helper to send normal notifications (not for messages)
export const sendNotification = (userId, notification) => {
  if (!io || !userId) return;
  const socketId = onlineUsers.get(userId.toString());
  if (socketId) {
    if (notification.type === "message-alert") {
      io.to(socketId).emit("new-message-alert", notification);
      console.log(`💬 Message alert sent to user ${userId}`);
    } else {
      io.to(socketId).emit("new-notification", notification);
      console.log(`🔔 Notification sent to user ${userId}`);
    }
  }
};

// ✅ Message delivery helper
export const sendMessageToUser = (receiverId, message) => {
  if (!io || !receiverId) return;
  const socketId = onlineUsers.get(receiverId.toString());
  if (socketId) {
    io.to(socketId).emit("receive-message", message);
    console.log(`💬 Delivered message to user ${receiverId}`);
  }
};
