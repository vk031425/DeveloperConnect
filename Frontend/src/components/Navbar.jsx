import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">DeveloperConnect</div>
      <ul className="nav-links">
        <li><Link to="/feed">Feed</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/profile/username">Profile</Link></li>
        <li><Link to="/login">Logout</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
