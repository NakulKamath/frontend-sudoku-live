'use client';
import React, { useEffect } from "react";
import { BoardCell } from "@/app/components/BoardCell";
import { BoardProps } from "./types";
import { Button } from "@/app/components/ui/button";
import { Delete, NotebookPen } from "lucide-react";
import { useSocket } from "./SocketContext";
import { useParams } from "next/navigation";

const Board: React.FC<BoardProps> = ({ board, setBoard }) => {
  const [position, setPosition] = React.useState<number | null>(null);
  const [notes, setNotes] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<number | null>(null);
  const { socket } = useSocket();
  const { group: roomId } = useParams<{ group: string }>();

  console.log(board);
  const toggleNotes = () => {
    setNotes(!notes);
  };

  useEffect(() => {
    if (position === null || !socket) return;
    socket?.emit("send-event", {
      roomId,
      event: { type: 'movePosition', index: position },
      name: localStorage.getItem("name") || "Anonymous"
    });
  }, [position, socket, roomId]);

  const handleMove = (num : number) => {
    if (position === null) return;
    if (!notes) {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        const cell = newBoard[position];
        if (cell.mutable) {
          cell.value = num;
        }
        return newBoard;
      });
    } else {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        const cell = newBoard[position];
        if (cell.mutable && cell.notes) {
          if (cell.notes.get(num)) {
            cell.notes.set(num, false);
            socket?.emit("send-event", { roomId, event : {type : 'removeNote', index : position, note : num}, name : localStorage.getItem("name") || "Anonymous" });
          } else {
            cell.notes.set(num, true);
            socket?.emit("send-event", { roomId, event : {type : 'addNote', index : position, note : num}, name : localStorage.getItem("name") || "Anonymous" });
          }
      }
        return newBoard;
      });
    }
    setSelected(null);
  }

  const handleDelete = () => {
    if (position === null) return;
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      const cell = newBoard[position];
      if (cell.mutable) {
        cell.value = null;
        cell.notes = new Map<number, boolean>(Array.from({ length: 9 }, (_, i) => [i + 1, false]));
      }
      return newBoard;
    });
    setSelected(null);
  };

  return (
    <>
    <div className="grid grid-cols-9 p-2 bg-[#020817] rounded-t-lg mx-auto border-4 border-b-0 border-[#2e3e5a] aspect-square md:max-w-[60dvh]">
      {(board ?? []).map((cell, idx) => (
        <div
          key={`${Math.floor(idx/9)}-${idx%9}`}
          className={`flex items-center justify-center border border-r-0 border-b-0 p-1 border-[#2e3e5a] aspect-square 
            ${Math.floor(idx/9) % 3 === 0 && "border-t-2 border-t-border-thick "}
            ${idx%9 % 3 === 0 && "border-l-2 border-l-border-thick "}
            ${idx%9 === 8 && "border-r-2 border-r-border-thick "}
            ${Math.floor(idx/9) === 8 && "border-b-2 border-b-border-thick "}
          `}
        >
          <BoardCell cell={cell} index={idx} position={position} setPosition={setPosition} selected={selected} setSelected={setSelected}/>
        </div>
      ))}
    </div>
    <div className="flex flex-col md:max-w-[60dvh] mx-auto bg-[#020817] border-4 border-t-0 border-[#2e3e5a] rounded-b-lg flex items-center justify-between px-2 pb-2">
        <div className="grid grid-cols-9 gap-2 w-full h-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              className="flex items-center justify-center bg-[#1a2233] text-white rounded-md p-2 aspect-square w-full h-full hover:bg-[#2e3e5a] focus:outline-none"
              onClick={() => {handleMove(num)}}
              variant={selected === num ? "secondary" : "default"}
            >
              {num}
            </Button>
          ))}
        </div>
        <div className="flex justify-between gap-2 w-full mt-2">
          <Button 
            className="bg-[#1a2233] text-white rounded-md p-2 hover:bg-[#2e3e5a] focus:outline-none"
            onClick={handleDelete}
          >
            <Delete className="h-10 w-10" />
          </Button>
          <Button
            className="bg-[#1a2233] text-white rounded-md p-2 hover:bg-[#2e3e5a] focus:outline-none"
            onClick={toggleNotes}
          >
            <NotebookPen className="h-10 w-10" />
          </Button>
        </div>
    </div>
    </>
  );
};

export default Board;