import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Link } from "react-router-dom";
import socket from "../socket";
import "../styles/Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  // 🧠 Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // ✅ Mark as read and refresh
  const markAsRead = async () => {
    try {
      const res = await api.put("/notifications/read");
      setNotifications(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // ⚡ Listen for real-time notifications
    socket.on("new-notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => socket.off("new-notification");
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 🧠 When bell is clicked
  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (!open) await markAsRead(); // mark as read only when opening
  };

  // 🧩 Render message text based on type
  const renderMessage = (n) => {
    const senderLink = (
      <Link to={`/profile/${n.sender?.username}`} onClick={() => setOpen(false)}>
        @{n.sender?.username}
      </Link>
    );

    switch (n.type) {
      case "follow":
        return (
          <>
            {senderLink} started following you
          </>
        );
      case "like":
        return (
          <>
            {senderLink} liked your{" "}
            <Link to={`/post/${n.post?._id}`} onClick={() => setOpen(false)}>
              post
            </Link>
          </>
        );
      case "comment":
        return (
          <>
            {senderLink} commented on your{" "}
            <Link to={`/post/${n.post?._id}`} onClick={() => setOpen(false)}>
              post
            </Link>
          </>
        );
      default:
        return "New activity";
    }
  };

  return (
    <div className="notif-container">
      {/* 🔔 Bell icon */}
      <button className="notif-bell" onClick={toggleOpen}>
        🔔{" "}
        {unreadCount > 0 && (
          <span className="notif-count">{unreadCount}</span>
        )}
      </button>

      {/* 📬 Dropdown */}
      {open && (
        <div className="notif-dropdown">
          <h4>Notifications</h4>

          {notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`notif-item ${n.read ? "" : "unread"}`}
              >
                <img
                  src={n.sender?.avatar || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className="notif-avatar"
                />
                <div className="notif-text">
                  <p>{renderMessage(n)}</p>
                  <span className="notif-time">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
