'use client';
import React from "react";
import { BoardCell } from "@/app/components/BoardCell";
import { BoardProps } from "./types";
import { Button } from "@/app/components/ui/button";
import { Delete, Link, NotebookPen } from "lucide-react";
import { useSocket } from "./SocketContext";
import { useParams } from "next/navigation";
import NameDialog from "@/app/components/NameDialog";
import { toast } from "sonner";

const Board: React.FC<BoardProps> = ({ board, setBoard, mistakes }) => {
  const [position, setPosition] = React.useState<number | null>(null);
  const [notes, setNotes] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<number | null>(null);
  const { socket } = useSocket();
  const { group: roomId } = useParams<{ group: string }>();

  console.log(board);
  const toggleNotes = () => {
    setNotes(!notes);
  };

  const handleMovePos = (newPos: number | null) => {
    console.log("Moving to position:", newPos);
    if (position === newPos) return;
    socket?.emit("send-event", { roomId, event : {type : 'movePosition', prev : position, index : newPos}, name : localStorage.getItem("name") || "Anonymous" });
    setPosition(newPos);
    setSelected(null);
  };

  const handleMove = (num : number) => {
    if (position === null) return;
    if (board[position].correct) {
      toast.info("Trying to lose? No sabotage allowed!");
      return;
    }
    if (!notes) {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        const cell = newBoard[position];
        if (cell.mutable) {
          cell.value = num;
          socket?.emit("send-event", { roomId, event : {type : 'updateCell', index : position, value : num}, name : localStorage.getItem("name") || "Anonymous" });
        }
        return newBoard;
      });
      setSelected(num);
    } else {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        const cell = newBoard[position];
        if (cell.mutable && cell.notes) {
          if (cell.notes.includes(num)) {
            cell.notes = cell.notes.filter((n: number) => n !== num);
            socket?.emit("send-event", { roomId, event : {type : 'removeNote', index : position, note : num}, name : localStorage.getItem("name") || "Anonymous" });
          } else {
            cell.notes = [...cell.notes, num];
            socket?.emit("send-event", { roomId, event : {type : 'addNote', index : position, note : num}, name : localStorage.getItem("name") || "Anonymous" });
          }
      }
        return newBoard;
      });
      setSelected(null);
    }
  }

  const handleDelete = () => {
    if (position === null) return;
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      const cell = newBoard[position];
      if (cell.mutable) {
        cell.value = null;
        cell.notes = [];
        socket?.emit("send-event", { roomId, event : {type : 'clear', index : position}, name : localStorage.getItem("name") || "Anonymous" });
      }
      return newBoard;
    });
    setSelected(null);
  };

  return (
    <div className="flex flex-col items-center justify-center md:h-fit md:w-full gap-2">
      <div className="grid grid-cols-9 p-2 bg-[#020817] rounded-lg mx-auto border-4 border-[#2e3e5a] sm:w-md lg:w-xl ">
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
          <BoardCell cell={cell} index={idx} position={position} handleMovePos={handleMovePos} selected={selected} setSelected={setSelected}/>
        </div>
        ))}
        <div className="flex flex-col items-center justify-center col-span-9 p-2">
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
            <div className="flex items-center justify-center bg-[#1a2233] text-white rounded-md p-2 min-w-[64px]">
              Mistakes: {mistakes[0]} / {mistakes[1]}
            </div>
            <Button
              className={`bg-[#1a2233] text-white rounded-md p-2 focus:outline-none ${notes ? "bg-blue-500" : ""} transition-colors duration-300`}
              onClick={toggleNotes}
            >
              <NotebookPen className="h-10 w-10" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between mb-2">
        <NameDialog handleMovePos={handleMovePos}/>
        <Button
          className="ml-4 bg-[#1a2233] text-white rounded-md p-2 hover:bg-[#2e3e5a] focus:outline-none"
          onClick={() => {
            const url = window.location.origin + window.location.pathname;
            navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
          }}
        >
          <Link className="h-10 w-10" />
          Copy Link
        </Button>
      </div>
    </div>
  );
};

export default Board;