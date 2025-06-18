'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type BoardCell = {
  mutable: boolean;
  value: number | null;
  correct?: boolean | null;
  notes?: Set<number>; 
}
type Board = BoardCell[];

export interface BoardContextType {
  board: Board;
  position: number | null;
  setPosition: (pos: number | null) => void;
  setBoard: (board: Board) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [board, setBoard] = useState<Board>([]);
  const [position, setPosition] = useState<number | null>(null);

  return (
    <BoardContext.Provider value={{ board, setBoard, position, setPosition }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};