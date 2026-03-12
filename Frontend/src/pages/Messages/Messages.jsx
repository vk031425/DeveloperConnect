import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import ConversationList from "../../components/ConversationList/ConversationList";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import "./Messages.css";

const Messages = () => {
  const { authData } = useAuth();
  const { setUnreadCount } = useNotifications();

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const location = useLocation();

  useEffect(() => {
    if (!authData?.user) return;

    const openInbox = async () => {
      try {
        // Tell backend the inbox was opened
        await api.post("/messages/mark-inbox-seen");

        // Reset navbar badge
        setUnreadCount(0);
      } catch (err) {
        console.error(
          "Error marking inbox seen:",
          err.response?.data || err.message,
        );
      }
    };

    openInbox();
    fetchConversations();
  }, [authData]);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/messages/conversations");
      setConversations(res.data);

      const unreadConversations = res.data.filter(
        (c) => c.unreadCount > 0,
      ).length;

      setUnreadCount(unreadConversations);

      // Auto-open chat if redirected from profile
      if (location.state?.openChatWith) {
        const targetUser = location.state.openChatWith;

        const existingChat = res.data.find((c) =>
          c.participants.some((p) => p._id === targetUser._id),
        );

        if (existingChat) {
          setSelectedChat(existingChat);
        } else {
          // Create temporary chat if conversation doesn't exist yet
          setSelectedChat({
            _id: null,
            participants: [authData.user, targetUser],
            messages: [],
          });
        }
      }
    } catch (err) {
      console.error(
        "Error fetching conversations:",
        err.response?.data || err.message,
      );
    }
  };

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessageAlert = (data) => {
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv._id !== data.conversation) return conv;

          const isActive = selectedChat?._id === data.conversation;

          return {
            ...conv,
            unreadCount: isActive ? 0 : (conv.unreadCount || 0) + 1,
          };
        });

        const unreadConversations = updated.filter(
          (c) => c.unreadCount > 0,
        ).length;

        setUnreadCount(unreadConversations);

        return updated;
      });
    };

    socket.on("new-message-alert", handleNewMessageAlert);

    return () => socket.off("new-message-alert", handleNewMessageAlert);
  }, [socket, selectedChat]);

  return (
    <div className="messages-page">
      <div className="messages-container">
        <ConversationList
          conversations={conversations}
          authDataId={authData?.user?._id}
          onSelect={setSelectedChat}
          selectedChat={selectedChat}
        />

        {selectedChat ? (
          <ChatWindow conversation={selectedChat} currentUser={authData.user} />
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
