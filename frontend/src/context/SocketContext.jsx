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
         // Identify this socket as the user - matching backend event name
         newSocket.emit("joinPersonal", user.id);
      });

      newSocket.on("connect_error", (err) => {
         // Silently handle or use a specialized error reporter
      });

      return () => {
        newSocket.off("connect");
        newSocket.off("connect_error");
        newSocket.close();
        setSocket(null);
      };


    }
  }, [user?.id]);


  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
