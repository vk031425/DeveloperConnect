import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Notifications from "../Notifications/Notifications";
import "./Navbar.css";
import { useState } from "react";
import api from "../../api/axiosConfig";
import { disconnectSocket } from "../../socket";
import { useNotifications } from "../../context/NotificationContext";

const Navbar = () => {
  const { authData, setAuthData } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, setUnreadCount } = useNotifications();

  const handleLogout = async () => {
    await api.post("/auth/logout");
    setAuthData({ user: null, isLoggedIn: false, loading: false });
    disconnectSocket();
    navigate("/login");
  };

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
        {authData.user && (
          <>
            <li>
              <Link to="/feed">Feed</Link>
            </li>
            <li>
              <Link to={`/profile/${authData.user.username}`}>Profile</Link>
            </li>
            <li className="nav-notif">
              <Notifications />
            </li>
            <li className="nav-msg">
              <Link to="/messages" onClick={() => setUnreadCount(0)}>
                ✉️
              </Link>
              {unreadCount > 0 && (
                <span className="notif-count">{unreadCount}</span>
              )}
            </li>
          </>
        )}

        {!authData.user ? (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
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
