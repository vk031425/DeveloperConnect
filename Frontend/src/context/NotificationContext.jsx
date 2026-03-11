import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { authData } = useAuth();
  const socket = useSocket();

  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch badge count from backend conversations
  useEffect(() => {
    if (!authData?.user) return;

    const fetchUnread = async () => {
      try {
        const res = await api.get("/messages/conversations");

        const lastSeen = new Date(authData.user.lastMessageSeenAt);

        let total = 0;

        res.data.forEach((conv) => {
          if (
            conv.lastMessage &&
            conv.lastMessage.sender &&
            conv.lastMessage.sender._id !== authData.user._id &&
            new Date(conv.lastMessage.createdAt) > lastSeen
          ) {
            total++;
          }
        });

        setUnreadCount(total);

      } catch (err) {
        console.error(
          "Error fetching unread messages:",
          err.response?.data || err.message
        );
      }
    };

    fetchUnread();

  }, [authData?.user]);

  // Realtime badge updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessageAlert = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new-message-alert", handleNewMessageAlert);

    return () => {
      socket.off("new-message-alert", handleNewMessageAlert);
    };

  }, [socket]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};