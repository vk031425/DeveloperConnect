import { useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", form);
      setAuthData({
        user: res.data.user,
        isLoggedIn: true,
      });
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="username"
            placeholder="Choose a unique username"
            value={form.username}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          {error && <p className="register-error">{error}</p>}
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
