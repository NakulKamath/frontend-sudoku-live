export type BoardCellType = {
  mutable: boolean;
  value: number | null;
  correct?: boolean | null;
  notes?: number[];
  users?: string[];
};

export interface BoardCellProps {
  cell: BoardCellType;
  index: number;
  position: number | null;
  handleMovePos: (a: number) => void;
  selected: number | null;
  setSelected: React.Dispatch<React.SetStateAction<number | null>>;
}

export interface BoardProps {
  board: BoardCellType[];
  setBoard: React.Dispatch<React.SetStateAction<BoardCellType[]>>;
  mistakes: number[];
}