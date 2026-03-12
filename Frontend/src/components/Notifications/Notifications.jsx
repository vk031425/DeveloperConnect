import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { Link } from "react-router-dom";
import { getSocket } from "../../socket";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  //  Fetch notifications from backendghjg
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Mark all as read (and notify via socket)
  const markAsRead = async () => {
    try {
      await api.put("/notifications/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      const s = getSocket();
      if (s) s.emit("notifications-read"); // 🔔 inform backend
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const s = getSocket();
    if (!s) return;

    const handleNewNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    const handleNotificationsRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    // Listen for real-time updates
    s.on("new-notification", handleNewNotification);
    s.on("notifications-read", handleNotificationsRead);

    return () => {
      s.off("new-notification", handleNewNotification);
      s.off("notifications-read", handleNotificationsRead);
    };
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
      <Link
        to={`/profile/${n.sender?.username}`}
        onClick={() => setOpen(false)}
        style={{ color: "#222", fontWeight: "600", textDecoration: "none" }}
      >
        @{n.sender?.username}
      </Link>
    );

    switch (n.type) {
      case "follow":
        return <>{senderLink} started following you</>;
      case "like":
        return (
          <>
            {senderLink} liked your{" "}
            <Link
              to={`/post/${n.post?._id}`}
              onClick={() => setOpen(false)}
              style={{
                color: "#222",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
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
      case "message":
        return <>{senderLink} sent you a message</>;
      default:
        return "New activity";
    }
  };

  return (
    <div className="notif-container">
      {/* Bell icon */}
      <button className="notif-bell" onClick={toggleOpen}>
        🔔{" "}
        {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
      </button>

      {/* Dropdown */}
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
                  src={n.sender?.avatar || "/placeholder.jpg"}
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
