import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosconfig.js";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // later this will call backend endpoint /api/auth/login
      // const res = await api.post("/auth/login", formData);
      const fakeUser = { name: "Vinay", email: formData.email }; // demo user
      login(fakeUser);
      alert("Login successful!");
      navigate("/feed");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="page">
      <h2>Login</h2>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
