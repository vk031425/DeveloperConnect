import { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { initSocket, getSocket, disconnectSocket } from "../socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { authData } = useAuth();

  useEffect(() => {
    if (authData?.user?._id) {
      initSocket(authData.user._id);
    }

    return () => {
      disconnectSocket();
    };
  }, [authData?.user?._id]);

  return (
    <SocketContext.Provider value={getSocket()}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};