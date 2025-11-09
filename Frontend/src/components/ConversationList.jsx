import { useEffect, useState } from "react";
import { getSocket } from "../socket";
import api from "../api/axiosConfig";
import "../styles/ConversationList.css";

const ConversationList = ({ conversations, userId, onSelect, selectedChat }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    // 🟢 Listen for real-time presence updates
    s.on("user-online", (id) => {
      setOnlineUsers((prev) => new Set([...prev, id]));
    });

    s.on("user-offline", (id) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    });

    // Optional: ask backend who’s online when connecting
    s.emit("get-online-users");

    return () => {
      s.off("user-online");
      s.off("user-offline");
    };
  }, []);

  const handleSelect = async (conv) => {
    try {
      // ✅ Mark messages in this conversation as read
      await api.put(`/messages/mark-read/${conv._id}`);
      onSelect(conv);
    } catch (err) {
      console.error("Error marking messages read:", err);
      onSelect(conv); // still open chat
    }
  };

  return (
    <div className="conversation-list">
      <h3 className="chat-title">Chats</h3>

      {conversations.length === 0 ? (
        <p className="no-conv">No conversations yet</p>
      ) : (
        conversations.map((conv) => {
          const partner = conv.participants.find((p) => p._id !== userId);
          const isActive = selectedChat?._id === conv._id;
          const isUnread =
            conv.lastMessage &&
            conv.lastMessage.sender._id !== userId &&
            !conv.lastMessage.read;
          const isOnline = onlineUsers.has(partner?._id);

          return (
            <div
              key={conv._id}
              className={`conversation-item ${isActive ? "active" : ""}`}
              onClick={() => handleSelect(conv)}
            >
              <div className="avatar-wrapper">
                <img
                  src={partner?.avatar || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className="conv-avatar"
                />
                <span
                  className={`status-dot ${isOnline ? "online" : "offline"}`}
                ></span>
              </div>

              <div className="conv-info">
                <div className="conv-header">
                  <h4>@{partner?.username}</h4>
                  {conv.lastMessage?.createdAt && (
                    <span className="conv-time">
                      {new Date(conv.lastMessage.createdAt).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  )}
                </div>

                <p className={`last-message ${isUnread ? "unread" : ""}`}>
                  {conv.lastMessage?.text
                    ? conv.lastMessage.text.slice(0, 35) +
                      (conv.lastMessage.text.length > 35 ? "..." : "")
                    : "No messages yet"}
                </p>
              </div>

              {isUnread && <span className="unread-dot"></span>}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ConversationList;
