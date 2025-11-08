import { useEffect, useState, useRef } from "react";
import api from "../api/axiosConfig";
import socket from "../socket";
import MessageInput from "./MessageInput";

const ChatWindow = ({ conversation, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const partner = conversation.participants.find((p) => p._id !== currentUser._id);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    socket.on("receive-message", (message) => {
      if (message.conversation === conversation._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("receive-message");
  }, [conversation._id]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/conversations/${conversation._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err.response?.data || err.message);
    }
  };

  const handleSend = async (text) => {
    try {
      const res = await api.post("/messages/send", {
        receiverId: partner._id,
        text,
      });
      setMessages((prev) => [...prev, res.data]);
      socket.emit("send-message", {
        receiverId: partner._id,
        message: res.data,
      });
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err.message);
    }
  };

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
        <h3>@{partner?.username}</h3>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message-bubble ${
              msg.sender._id === currentUser._id ? "sent" : "received"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;
