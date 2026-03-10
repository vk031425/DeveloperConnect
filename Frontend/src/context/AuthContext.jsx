import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axiosConfig";
import { initSocket, disconnectSocket } from "../socket";

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

  //Initialize socket ONLY ONCE per login
  useEffect(() => {
    if (!authData?.user?._id) {
      disconnectSocket();
      return;
    }
    // Start socket connection — this itself registers user
    initSocket(authData.user._id);
  }, [authData?.user?._id]);

  return (
    <AuthContext.Provider value={{ authData, setAuthData}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
