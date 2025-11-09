import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axiosConfig";
import { initSocket, disconnectSocket } from "../socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check for logged-in user at startup
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

  // ✅ Handle socket connection whenever user changes
  useEffect(() => {
    if (user?._id) {
      initSocket(user._id);
    } else {
      disconnectSocket();
    }
  }, [user]);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    disconnectSocket(); // ✅ Immediately disconnect
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
