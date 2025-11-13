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
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    const s = socketRef.current;
    if (!s) return;

    // --- STABLE HANDLERS ---
    const onReceive = (message) => {
      if (message.conversation !== conversation._id) return;
      if (message.sender._id === currentUser._id) return;
      setMessages((prev) => [...prev, message]);
    };

    const onTyping = (senderId) => {
      if (senderId !== partner._id) return;
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    };

    const onOnlineUsers = (users) => {
      setIsOnline(users.includes(partner._id));
    };

    // --- ATTACH LISTENERS ---
    s.on("receive-message", onReceive);
    s.on("typing", onTyping);
    s.on("online-users", onOnlineUsers);

    // --- REMOVE ON UNMOUNT ---
    return () => {
      s.off("receive-message", onReceive);
      s.off("typing", onTyping);
      s.off("online-users", onOnlineUsers);
    };
  }, [conversation._id, partner._id, currentUser._id]);

  // Load messages
  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/messages/conversations/${conversation._id}`);
      setMessages(res.data);
      await api.put(`/messages/mark-read/${conversation._id}`);
    };
    load();
  }, [conversation._id]);

  const handleSend = async (text) => {
    const s = socketRef.current;
    if (!s) return;

    const res = await api.post("/messages/send", {
      receiverId: partner._id,
      text,
    });

    setMessages((prev) => [...prev, res.data]);

    s.emit("send-message", {
      receiverId: partner._id,
      message: res.data,
    });
  };

  const handleTyping = () => {
    const s = socketRef.current;
    if (!s) return;

    s.emit("typing", {
      receiverId: partner._id,
      senderId: currentUser._id,
    });
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img
          src={partner.avatar || "https://via.placeholder.com/40"}
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
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;
