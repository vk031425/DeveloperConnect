import { useEffect, useState, useRef } from "react";
import api from "../api/axiosConfig";
import { getSocket } from "../socket";
import MessageInput from "./MessageInput";
import "../styles/ChatWindow.css";

const ChatWindow = ({ conversation, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const partner = conversation.participants.find(
    (p) => p._id !== currentUser._id
  );
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    const s = getSocket();
    if (!s) return console.warn("⚠️ Socket not initialized yet");

    // 🧠 Listen for new messages
    s.on("receive-message", (message) => {
      if (message.conversation === conversation._id) {
        if (message.sender._id !== currentUser._id) {
          setMessages((prev) => [...prev, message]);
        }
      }
    });

    // 💬 Listen for typing indicator
    s.on("typing", (senderId) => {
      if (senderId === partner._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    // 🟢 Presence updates
    s.on("user-online", (id) => {
      if (id === partner._id) setIsOnline(true);
    });
    s.on("user-offline", (id) => {
      if (id === partner._id) setIsOnline(false);
    });

    return () => {
      s.off("receive-message");
      s.off("typing");
      s.off("user-online");
      s.off("user-offline");
    };
  }, [conversation._id, currentUser._id]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/conversations/${conversation._id}`);
      setMessages(res.data);

      // ✅ Immediately mark them as read
      await api.put(`/messages/mark-read/${conversation._id}`);
    } catch (err) {
      console.error(
        "Error fetching messages:",
        err.response?.data || err.message
      );
    }
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;
    try {
      const res = await api.post("/messages/send", {
        receiverId: partner._id,
        text,
      });

      // Add locally for instant feedback
      setMessages((prev) => [...prev, res.data]);

      // Emit message through socket
      const s = getSocket();
      if (s) {
        s.emit("send-message", {
          receiverId: partner._id,
          message: res.data,
        });
      }
    } catch (err) {
      console.error(
        "Error sending message:",
        err.response?.data || err.message
      );
    }
  };

  const handleTyping = () => {
    const s = getSocket();
    if (s)
      s.emit("typing", { receiverId: partner._id, senderId: currentUser._id });
  };

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img
          src={partner?.avatar || "https://via.placeholder.com/40"}
          alt="avatar"
          className="conv-avatar"
        />
        <div>
          <h3>@{partner?.username}</h3>
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
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${
              msg.sender._id === currentUser._id ? "sent" : "received"
            }`}
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
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;
