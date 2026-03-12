import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import api from "../../api/axiosConfig";
import "./ConversationList.css";

const ConversationList = ({
  conversations,
  authDataId,
  onSelect,
  selectedChat,
}) => {
  const socket = useSocket();

  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [localConversations, setLocalConversations] = useState(conversations);

  // Keep local state synced with parent
  useEffect(() => {
    setLocalConversations(conversations);
  }, [conversations]);

  // Listen for online users
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users) => {
      setOnlineUsers(new Set(users));
    };

    socket.on("online-users", handleOnlineUsers);

    socket.emit("get-online-users");

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, [socket]);

  // Listen for new messages to update sidebar instantly
  useEffect(() => {
    if (!socket) return;

    const handleNewMessageAlert = (data) => {
      setLocalConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv._id !== data.conversation) return conv;

          const isActive = selectedChat?._id === data.conversation;

          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              text: data.text,
              sender: { _id: data.senderId },
              createdAt: new Date(),
              read: isActive,
            },
            unreadCount: isActive ? 0 : (conv.unreadCount || 0) + 1,
          };
        });

        // move conversation to top
        const target = updated.find((c) => c._id === data.conversation);
        const others = updated.filter((c) => c._id !== data.conversation);

        return target ? [target, ...others] : prev;
      });
    };

    socket.on("new-message-alert", handleNewMessageAlert);

    return () => {
      socket.off("new-message-alert", handleNewMessageAlert);
    };
  }, [socket]);

  const handleSelect = async (conv) => {
    try {
      // mark messages read in backend
      await api.put(`/messages/mark-read/${conv._id}`);

      // update local state so UI instantly updates
      setLocalConversations((prev) =>
        prev.map((c) =>
          c._id === conv._id
            ? {
                ...c,
                lastMessage: c.lastMessage
                  ? { ...c.lastMessage, read: true }
                  : c.lastMessage,
              }
            : c,
        ),
      );

      onSelect(conv);
    } catch (err) {
      console.error("Error marking messages read:", err);
      onSelect(conv);
    }
  };

  return (
    <div className="conversation-list">
      <h3 className="chat-title">Chats</h3>

      {localConversations.length === 0 ? (
        <p className="no-conv">No conversations yet</p>
      ) : (
        localConversations.map((conv) => {
          const partner = conv.participants.find((p) => p._id !== authDataId);

          const isActive = selectedChat?._id === conv._id;

          const isUnread =
            conv.unreadCount > 0 && selectedChat?._id !== conv._id;

          const isOnline = onlineUsers.has(partner?._id);

          return (
            <div
              key={conv._id}
              className={`conversation-item ${isActive ? "active" : ""}`}
              onClick={() => handleSelect(conv)}
            >
              <div className="avatar-wrapper">
                <img
                  src={partner?.avatar || "/placeholder.jpg"}
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
                        },
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
