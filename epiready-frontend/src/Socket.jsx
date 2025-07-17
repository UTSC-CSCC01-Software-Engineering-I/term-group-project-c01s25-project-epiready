import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useGlobal } from "./LoggedIn";
import { dotenv } from 'dotenv';
;

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { loggedIn } = useGlobal();
  const token = sessionStorage.getItem("token");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!loggedIn || !token) {
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }
    const newSocket = io(`${process.env.VITE_BACKEND_URL}/`, {
      auth: { token }
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
    // eslint-disable-next-line
  }, [loggedIn, token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};