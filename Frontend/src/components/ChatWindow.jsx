import { useEffect, useState, useRef, useCallback } from "react";
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
  const socketRef = getSocket();

  // 💬 stable message handler
  const handleIncomingMessage = useCallback(
    (message) => {
      if (message.conversation === conversation._id) {
        if (message.sender._id !== currentUser._id) {
          setMessages((prev) => [...prev, message]);
        }
      }
    },
    [conversation._id, currentUser._id]
  );

  // ✍️ stable typing handler
  const handleTypingEvent = useCallback(
    (senderId) => {
      if (senderId === partner._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    },
    [partner._id]
  );

  // 🟢 stable online-users handler
  const handleOnlineUsers = useCallback(
    (users) => {
      setIsOnline(users.includes(partner._id));
    },
    [partner._id]
  );

  // 🧠 Attach listeners ONCE per conversation change
  useEffect(() => {
    if (!socketRef) return;

    socketRef.on("receive-message", handleIncomingMessage);
    socketRef.on("typing", handleTypingEvent);
    socketRef.on("online-users", handleOnlineUsers);

    return () => {
      socketRef.off("receive-message", handleIncomingMessage);
      socketRef.off("typing", handleTypingEvent);
      socketRef.off("online-users", handleOnlineUsers);
    };
  }, [socketRef, handleIncomingMessage, handleTypingEvent, handleOnlineUsers]);

  // 🔄 Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/conversations/${conversation._id}`);
      setMessages(res.data);
      await api.put(`/messages/mark-read/${conversation._id}`);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversation._id]);

  // ➤ Send
  const handleSend = async (text) => {
    if (!text.trim()) return;

    try {
      const res = await api.post("/messages/send", {
        receiverId: partner._id,
        text,
      });

      setMessages((prev) => [...prev, res.data]);

      if (socketRef) {
        socketRef.emit("send-message", {
          receiverId: partner._id,
          message: res.data,
        });
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const handleTyping = () => {
    if (socketRef)
      socketRef.emit("typing", {
        receiverId: partner._id,
        senderId: currentUser._id,
      });
  };

  // Smooth scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  return (
    <div className="chat-window">
      <div className="chat-header">
        <img
          src={partner.avatar || "https://via.placeholder.com/40"}
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
