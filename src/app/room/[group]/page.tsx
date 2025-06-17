'use client';

import { useEffect, useState } from "react";
import { useSocket } from "@/app/components/Socket";
import { useParams } from "next/navigation";

export default function RoomPage() {
  const [messages, setMessages] = useState<{ key: string; value: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { socket } = useSocket();
  const { group: roomId } = useParams<{ group: string }>();

  useEffect(() => {
    console.log("Room ID:", roomId);
    if (!socket || !roomId) return;

    socket.emit("joinRoom", { roomId });

    socket.on("kafka-message", (msg: { key: string; value: string }) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("kafka-message");
    };
  }, [roomId, socket]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    if (!socket) return;

    const newMessage = { key: socket.id, value: inputValue };
    socket.emit("send-message", { ...newMessage, roomId });
    setInputValue("");
  };

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>
            <strong>{msg.key}:</strong> {msg.value}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}