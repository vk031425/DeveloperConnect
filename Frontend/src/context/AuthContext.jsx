import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axiosConfig";
import { initSocket, disconnectSocket, getSocket } from "../socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 🔍 Check login status on first load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // ⚡ Initialize socket ONLY ONCE per login
  useEffect(() => {
    if (!user?._id) {
      disconnectSocket();
      return;
    }

    // Start socket connection
    initSocket(user._id);

    const s = getSocket();
    if (!s) return;

    // ❗ Register user ONLY once per socket connection
    s.once("connect", () => {
      console.log("🔌 Socket connected. Registering user:", user._id);
      s.emit("register", user._id);
    });

    return () => {
      s.off("connect");
    };
  }, [user?._id]);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
