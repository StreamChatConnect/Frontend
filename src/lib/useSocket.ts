import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  message,
  ServerToClientEvents,
} from "@/shared-lib/types";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const [streamMessages, setStreamMessages] = useState<message[]>([]);
  const messagesRef = useRef<message[]>([]);

  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:6842");
    }

    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected:", socket!.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("Disconnected");
    });

    socket.on("streamMessage", (msg) => {
      messagesRef.current = [...messagesRef.current, msg];
      setStreamMessages([...messagesRef.current]);
    });

    socket.on("streamMessages", (msg) => {
      messagesRef.current = msg;
      setStreamMessages(msg);
    });

    return () => {
      socket?.off("streamMessage");
    };
  }, []);

  return { socket, connected, streamMessages };
};
