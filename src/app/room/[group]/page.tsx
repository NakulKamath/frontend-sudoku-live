'use client';

import { useEffect, useState } from "react";
import { useSocket } from "@/app/components/SocketContext";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Board from "@/app/components/Board";
import { BoardCellType } from "@/app/components/types";
import { useRouter } from "next/navigation";


export default function RoomPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ key: string; value: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { socket } = useSocket();
  const { group: roomId } = useParams<{ group: string }>();
  const searchParams = useSearchParams();
  const difficulty = searchParams.get("difficulty");
  const [board, setBoard] = useState<BoardCellType[]>([]);

  useEffect(() => {
    console.log("Room ID:", roomId);
    if (!socket || !roomId) return;

    if (!socket.connected) {
      router.push("/");
      return;
    }

    socket.emit("join-room", { roomId, difficulty });

    socket.on("kafka-message", (msg: { key: string; value: string }) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("board-state", (boardState: BoardCellType[]) => {
      setBoard(boardState);
    });
    return () => {
      socket.off("kafka-message");
    };
  }, [socket, roomId, difficulty, setBoard, router]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    if (!socket) return;

    const newMessage = { value: inputValue, name: localStorage.getItem("name") || "Anonymous" };
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
      <Board board={board} setBoard={setBoard} />
    </div>
  );
}