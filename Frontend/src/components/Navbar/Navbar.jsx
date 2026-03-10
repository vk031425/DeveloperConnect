import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Notifications from "../Notifications";
import "./Navbar.css";
import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { getSocket } from "../../socket";

const Navbar = () => {
  const { authData } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  console.log("Navbar authData:", authData);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    navigate("/login");
  };

  // //Fetch unread message count
  // useEffect(() => {
  //   const fetchUnread = async () => {
  //     try {
  //       const res = await api.get("/messages/conversations");
  //       let total = 0;
  //       res.data.forEach((conv) => {
  //         if (
  //           conv.lastMessage &&
  //           !conv.lastMessage.read &&
  //           conv.lastMessage.sender._id !== authData._id
  //         ) {
  //           total++;
  //         }
  //       });
  //       setUnreadCount(total);
  //     } catch (err) {
  //       console.error("Error fetching unread messages:", err);
  //     }
  //   };
  //   if (authData.user) fetchUnread();
  // }, [authData.user]);

  // // 🧠 Real-time updates via socket
  // useEffect(() => {
  //   const s = getSocket();
  //   if (!s) return;

  //   s.on("new-message-alert", () => {
  //     setUnreadCount((prev) => prev + 1);
  //   });

  //   return () => {
  //     s.off("new-message-alert");
  //   };
  // }, []);

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
        <li>
          <Link to="/feed">Feed</Link>
        </li>

        {authData.user && (
          <>
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
