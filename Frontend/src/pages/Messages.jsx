import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import { getSocket } from "../socket"; //Use getSocket instead of direct import
import "../styles/Messages.css";

const Messages = () => {
  const { authData } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!authData) return;

    const s = getSocket(); //safely get active socket instance
    if (s) {
      s.emit("register", authData._id);
    } else {
      console.warn("Socket not initialized yet.");
    }

    fetchConversations();
  }, [authData]);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/messages/conversations");
      setConversations(res.data);

      // 👇 Auto-open chat if redirected from profile with openChatWith
      if (location.state?.openChatWith) {
        const targetauthData = location.state.openChatWith;
        const existingChat = res.data.find((c) =>
          c.participants.some((p) => p._id === targetauthData._id)
        );

        if (existingChat) {
          setSelectedChat(existingChat);
        } else {
          // if no existing chat, prepare temporary chat (will create on first message)
          setSelectedChat({
            _id: null,
            participants: [authData, targetauthData],
            messages: [],
          });
        }
      }
    } catch (err) {
      console.error(
        "Error fetching conversations:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <ConversationList
          conversations={conversations}
          authDataId={authData?._id}
          onSelect={setSelectedChat}
          selectedChat={selectedChat}
        />
        {selectedChat ? (
          <ChatWindow conversation={selectedChat} currentauthData={authData} />
        ) : (
          <div className="no-chat">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
