import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useWebSocket = (
  url: string,
  onMessage: (data: unknown) => void
) => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    console.log("url", url);

    socket.current = io(url, {
      transports: ["websocket"], // Ensures the client uses WebSocket transport
    });

    socket.current.on("connect", () => {
      console.log("WebSocket connection opened");
      // Request the last 15 sensor data entries
      socket.current?.emit("requestSensorData");
    });

    socket.current.on("sensorData", (data) => {
      onMessage(data);
    });

    socket.current.on("newSensorData", (data) => {
      onMessage([data]);
    });

    socket.current.on("disconnect", () => {
      console.log("WebSocket connection closed");
    });

    socket.current.on("error", (error) => {
      console.error("Socket.IO error:", error);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [url, onMessage]);

  return socket.current;
};
