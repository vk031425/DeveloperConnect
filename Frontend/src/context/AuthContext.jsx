import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    user: null,
    isLoggedIn: false,
    loading: true, // important for refresh handling
  });

  // Check authentication on app load / refresh
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/verify");
        setAuthData({
          user: res.data,
          isLoggedIn: true,
          loading: false,
        });
      } catch (error) {
        // Token invalid / expired / not logged in
        setAuthData({
          user: null,
          isLoggedIn: false,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);
  
  return (
    <AuthContext.Provider value={{ authData, setAuthData}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
