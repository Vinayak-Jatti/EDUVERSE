import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      // Connect to socket server
      const serverUrl = import.meta.env.VITE_API_BASE_URL 
        ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') 
        : "http://localhost:3000";

      const newSocket = io(serverUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'], // Prevent connection errors during hot reload
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
         // Identify this socket as the user
         newSocket.emit("join_user", user.id);
      });

      return () => {
        newSocket.close();
        setSocket(null);
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
