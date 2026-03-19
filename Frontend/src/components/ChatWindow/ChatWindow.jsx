import { useEffect, useState, useRef } from "react";
import api from "../../api/axiosConfig";
import { useSocket } from "../../context/SocketContext";
import MessageInput from "../MessageInput";
import "./ChatWindow.css";

const ChatWindow = ({ conversation, currentUser }) => {
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const messagesEndRef = useRef(null);

  const partner = conversation?.participants?.find(
    (p) => String(p._id) !== String(currentUser?._id),
  );

  // Reset messages when switching conversations
  useEffect(() => {
    setMessages([]);
  }, [conversation?._id]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await api.get(
          `/messages/conversations/${conversation._id}`,
        );

        setMessages(res.data);

        await api.put(`/messages/mark-read/${conversation._id}`);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    if (conversation?._id) {
      loadMessages();
    }
  }, [conversation?._id]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !conversation?._id || !partner?._id) return;

    const handleReceiveMessage = async (message) => {
      if (message.conversation !== conversation._id) return;
      // if (message.sender._id === currentUser._id) return;

      if (message.sender._id === currentUser._id && message.t0) {
        const latency = Date.now() - message.t0;
        console.log("True End-to-End Latency:", latency, "ms");
      }

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });

      // mark read instantly if chat is open
      try {
        await api.put(`/messages/mark-read/${conversation._id}`);
      } catch (err) {
        console.error("Error marking read:", err);
      }
    };

    const handleTyping = (senderId) => {
      if (senderId !== partner._id) return;

      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    };

    const handleOnlineUsers = (users) => {
      setIsOnline(users.includes(String(partner._id)));
    };

    // 🔹 NEW: handle message seen event
    const handleMessageSeen = (data) => {
      if (data.conversation !== conversation._id) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.sender._id === currentUser._id ? { ...m, read: true } : m,
        ),
      );
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("online-users", handleOnlineUsers);
    socket.on("message-seen", handleMessageSeen);

    // 🔥 request current online users
    socket.emit("get-online-users");

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("online-users", handleOnlineUsers);
      socket.off("message-seen", handleMessageSeen);
    };
  }, [socket?.id, conversation?._id, partner?._id, currentUser?._id]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    if (!partner?._id) {
      console.error("Partner not found");
      return;
    }

    try {
      const t0 = Date.now();

      const res = await api.post("/messages/send", {
        receiverId: partner._id,
        text,
        t0,
      });

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === res.data._id);
        if (exists) return prev;
        return [...prev, res.data];
      });
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err);
    }
  };

  const handleTyping = () => {
    if (!socket || !partner?._id) return;

    socket.emit("typing", {
      receiverId: partner._id,
      senderId: currentUser._id,
    });
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation || !partner) {
    return <div className="chat-window">Loading chat...</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img
          src={partner.avatar || "/placeholder.jpg"}
          alt="avatar"
          className="conv-avatar"
        />

        <div>
          <h3>@{partner.username}</h3>

          {isTyping ? (
            <p className="typing-status">typing...</p>
          ) : (
            <p className={`status-text ${isOnline ? "online" : "offline"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1;
          const isMyMessage = msg.sender._id === currentUser._id;

          return (
            <div
              key={msg._id}
              className={`message ${isMyMessage ? "sent" : "received"}`}
            >
              <div className="message-bubble">
                {msg.text}

                <span className="timestamp">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* 🔹 Seen indicator */}
              {isMyMessage && isLastMessage && msg.read && (
                <div className="seen-indicator">Seen</div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;
