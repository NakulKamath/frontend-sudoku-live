"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "./components/Socket";
import { useRouter } from "next/navigation";

type Record = {
  key: string;
  value: string;
};

export default function KafkaLiveList() {
  const [records, setRecords] = useState<Record[]>([]);
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket?.on("kafka-message", (msg: { key: string; value: string }) => {
      setRecords((prev) => [
        ...prev,
        { key: msg.key, value: msg.value }
      ]);
    });
  }, [socket]);

  const handleAddMessage = () => {
    if (inputValue.trim() === "") return;
    if (!socket) {
      console.error("Socket is not connected");
      return;
    }
    const newRecord = { key: socket?.id ?? "unknown", value: inputValue.trim() };
    socket.emit("send-message", { ...newRecord, group: "test-topic" });
    setInputValue("");
  };

  return (
    <div>
      <h1>Live Kafka Records</h1>
      <ul>
        {records.map((rec, idx) => (
          <li key={idx}>
            <strong>{rec.key}:</strong> {rec.value}
          </li>
        ))}
        <div style={{ marginTop: "8px" }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter message"
          />
          <button onClick={() => handleAddMessage()}>Add</button>
        </div>
      </ul>
      <button
        onClick={() => {
          if (!socket) {
            console.error("Socket is not connected");
            return;
          }
            router.push(`/room/${socket.id}`);
        }}
        style={{ marginTop: "16px" }}
      >
        Go to My Room
      </button>
    </div>
  );
}