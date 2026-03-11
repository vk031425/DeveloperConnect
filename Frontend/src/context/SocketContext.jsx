import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { initSocket, getSocket, disconnectSocket } from "../socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { authData } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!authData?.user?._id) return;

    initSocket(authData.user._id);

    const s = getSocket();
    setSocket(s);

    return () => {
      disconnectSocket();
      setSocket(null);
    };
  }, [authData?.user?._id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};