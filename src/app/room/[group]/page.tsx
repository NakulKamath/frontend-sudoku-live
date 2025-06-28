'use client';

import { useEffect, useState } from "react";
import { useSocket } from "@/app/components/SocketContext";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Board from "@/app/components/Board";
import { BoardCellType } from "@/app/components/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RoomPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ id: string; key: string; value: string[] }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { socket } = useSocket();
  const { group: roomId } = useParams<{ group: string }>();
  const searchParams = useSearchParams();
  const difficulty = searchParams.get("difficulty");
  const [board, setBoard] = useState<BoardCellType[]>([]);
  const [mistakes, setMistakes] = useState<number[]>([]);

  useEffect(() => {
    console.log("Room ID:", roomId);
    if (!socket || !roomId) return;

    socket.emit("check-room", { roomId }, (response: { exists: boolean }) => {
      if (!response.exists && roomId !== socket.id) {
        router.push("/");
        toast.error("This game session has ended or does not exist.");
      } else {
        socket.emit("join-room", { roomId, difficulty });
      }
    });

    socket.on("win", () => {
      toast.success("Congratulations! You solved the Sudoku puzzle!", {description: "You will be redirected in 5 seconds."});
      setTimeout(() => {
        router.push("/");
      }, 5000);
      if (socket.id === roomId) {
        socket.emit("reset-room", { roomId });
      }
    });

    socket.on("lose", () => {
      toast.error("You lost the game. Better luck next time!", {description: "You will be redirected in 5 seconds."});
      setTimeout(() => {
        router.push("/");
      }, 5000);
      if (socket.id === roomId) {
        socket.emit("reset-room", { roomId });
      }
    });

    socket.on("kafka-message", (msg: { key: string; value: string }) => {
      const [id, name, type] = msg.key.split("/");
      console.log("Received message:", msg, "ID:", id, "Name:", name, "Type:", type);
      if (type === "msg") {
        setMessages(prevMessages => {
          const lastMsg = prevMessages[prevMessages.length - 1];
          if (lastMsg && lastMsg.id === id) {
            return [
              ...prevMessages.slice(0, -1),
              { ...lastMsg, value: [...lastMsg.value, msg.value] }
            ];
          } else {
            return [
              ...prevMessages,
              { id, key: name, value: [msg.value] }
            ];
          }
        });
      } else if (type === "move") {
        const [index, value, correct] = msg.value.split("/");
        console.log("Move event:", index, value, correct);
        setBoard(prevBoard => {
          const newBoard = [...prevBoard];
          const cell = newBoard[parseInt(index)];
          if (cell) {
            cell.value = parseInt(value);
            cell.correct = correct === "1";
          }
          if (correct !== "1") {
            setMistakes(prevMistakes => {
              const newMistakes = [...prevMistakes];
              newMistakes[0] = (newMistakes[0] || 0) + 1;
              return newMistakes;
            });
          }
          return newBoard;
        });
      } else if (type === "addNote") {
        const [index, note] = msg.value.split("/");
        setBoard(prevBoard => {
          const newBoard = [...prevBoard];
          const cell = newBoard[parseInt(index)];
          if (cell && cell.mutable && cell.notes) {
            cell.notes.push(parseInt(note));
          }
          return newBoard;
        });
      } else if (type === "removeNote") {
        const [index, note] = msg.value.split("/");
        setBoard(prevBoard => {
          const newBoard = [...prevBoard];
          const cell = newBoard[parseInt(index)];
          if (cell && cell.mutable && cell.notes) {
            cell.notes = cell.notes.filter(notes => notes !== parseInt(note));
          }
          return newBoard;
        });
      } else if (type === "pos") {
        if (id === socket.id) {
          return;
        }
        const [ oldPos, newPos ] = msg.value.split("/").map(Number);
        setBoard(prevBoard => {
          const newBoard = [...prevBoard];
          const name = msg.key.split("/")[1];
          if (!isNaN(oldPos) && newBoard[oldPos] && newBoard[oldPos].users) {
            newBoard[oldPos].users = newBoard[oldPos].users.filter(user => user !== name);
          }
          if (!isNaN(newPos) && newBoard[newPos]) {
            if (!newBoard[newPos].users) newBoard[newPos].users = [];
            if (!newBoard[newPos].users.includes(name)) {
              newBoard[newPos].users.push(name);
            }
          }
          return newBoard;
        });
      } else if (type === "clear") {
        setBoard(prevBoard => {
          const newBoard = [...prevBoard];
          const cell = newBoard[parseInt(msg.value)];
          if (cell && cell.mutable) {
            cell.value = null;
            cell.notes = [];
          }
          return newBoard;
        });
      }
    });

    socket.on("board-state", (boardState: BoardCellType[]) => {
      setBoard(boardState);
    });
    socket.on("mistakes", (mistakes: number[]) => {
      setMistakes(mistakes);
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
    <>
    <div className="flex flex-col md:flex-row max-w-[100dvw] h-full flex-col items-center justify-center border-4 p-[1dvh] bg-[#020817] border-[#2e3e5a] rounded-3xl">
      <Board board={board} setBoard={setBoard} mistakes={mistakes}/>
      <div className="w-full lg:max-w-md h-[max(25dvh,calc(100vh-1.4*100vw))] lg:h-[93dvh] rounded-lg border-4 border-[#2e3e5a]">
        <div className="flex flex-col h-full">
          <div
            className="flex-1 overflow-y-auto p-2 space-y-2"
            ref={el => {
              if (el) {
                el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
              }
            }}
          >
            {messages.map((msg, idx) => (
              <div key={idx} className="bg-[#1a2233] rounded px-3 py-2 text-sm break-words">
                <span className="font-semibold">{msg.key}: </span>
                {msg.value.map((message, i) => (
                  <div key={i}>
                    <span>{message}</span>
                    {i < msg.value.length - 1 && (
                      <hr className="my-1 border-t border-gray-600 opacity-30" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center p-2 border-t border-[#2e3e5a]">
            <input
              type="text"
              className="flex-1 rounded-l px-3 py-2 bg-[#0e1627] text-white outline-none"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}