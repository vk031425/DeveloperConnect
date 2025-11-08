import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Notifications from "./Notifications";
import "./Navbar.css";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // 📩 Fetch unread message count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get("/messages/conversations");
        let total = 0;
        res.data.forEach((conv) => {
          if (
            conv.lastMessage &&
            !conv.lastMessage.read &&
            conv.lastMessage.sender !== user._id
          ) {
            total++;
          }
        });
        setUnreadCount(total);
      } catch (err) {
        console.error("Error fetching unread messages:", err);
      }
    };
    if (user) fetchUnread();
  }, [user]);

  return (
    <nav className="navbar">
      <h2
        className="logo"
        onClick={() => navigate("/feed")}
        style={{ cursor: "pointer" }}
      >
        Developer Connect
      </h2>

      <ul className="nav-links">
        <li><Link to="/feed">Feed</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>

        {user && (
          <>
            <li><Link to={`/profile/${user.username}`}>Profile</Link></li>

            {/* 🔔 Notifications */}
            <li className="nav-notif">
              <Notifications />
            </li>

            {/* ✉️ Messages */}
            <li className="nav-msg">
              <Link to="/messages">✉️</Link>
              {unreadCount > 0 && (
                <span className="notif-count">{unreadCount}</span>
              )}
            </li>
          </>
        )}

        {!user ? (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        ) : (
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
