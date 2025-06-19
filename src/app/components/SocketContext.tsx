'use client';

import { io } from "socket.io-client";
import { useEffect, useState, ReactNode, createContext, useContext } from "react";

interface SocketContextType {
  socket: ReturnType<typeof io> | null;
}

const SocketContext = createContext<SocketContextType>({} as SocketContextType)

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({children} : {children : ReactNode }) => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    }
    );
    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    }
    );
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};