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

    // ✅ Safe Register (NO duplicates)
    socket.on("register", (userId) => {
      if (!userId) return;

      const uid = userId.toString();

      // 🛡 If already registered to this socket → do NOTHING
      if (onlineUsers.get(uid) === socket.id) {
        console.log(`⚠️ Ignored duplicate register for ${uid}`);
        return;
      }

      // 🧹 Clean previous stale mapping
      for (const [key, value] of onlineUsers.entries()) {
        if (key === uid || value === socket.id) {
          onlineUsers.delete(key);
        }
      }

      onlineUsers.set(uid, socket.id);
      console.log("✅ User registered:", uid, "→", socket.id);

      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // 📩 Message + message-alert
    socket.on("send-message", (data) => {
      const { receiverId, message } = data;
      const receiverSocket = onlineUsers.get(receiverId?.toString());

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", message);

        io.to(receiverSocket).emit("new-message-alert", {
          senderId: message.sender?._id,
          text: message.text,
          conversation: message.conversation,
        });

        console.log(`📨 Message sent to user ${receiverId}`);
      } else {
        console.log(`⚠️ Receiver ${receiverId} offline`);
      }
    });

    socket.on("typing", ({ receiverId, senderId }) => {
      const receiverSocket = onlineUsers.get(receiverId?.toString());
      if (receiverSocket) io.to(receiverSocket).emit("typing", senderId);
    });

    // Send online users list when someone asks
    socket.on("get-online-users", () => {
      socket.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // Sync notifications read state
    socket.on("notifications-read", () => {
      for (const [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          io.to(sid).emit("notifications-read");
          break;
        }
      }
    });

    // ❌ Disconnected
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

export const sendNotification = (userId, notification) => {
  if (!io || !userId) return;
  const socketId = onlineUsers.get(userId.toString());
  if (socketId) {
    if (notification.type === "message-alert") {
      io.to(socketId).emit("new-message-alert", notification);
    } else {
      io.to(socketId).emit("new-notification", notification);
    }
  }
};

export const sendMessageToUser = (receiverId, message) => {
  if (!io || !receiverId) return;
  const socketId = onlineUsers.get(receiverId.toString());
  if (socketId) {
    io.to(socketId).emit("receive-message", message);
  }
};
