"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const useSocket = (tableCode) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!tableCode) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      // Join the table room
      socket.emit("join-table", tableCode);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit("leave-table", tableCode);
        socket.disconnect();
      }
    };
  }, [tableCode]);

  return socketRef.current;
};

export default useSocket;
