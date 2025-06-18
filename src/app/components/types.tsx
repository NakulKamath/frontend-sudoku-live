export type BoardCellType = {
  mutable: boolean;
  value: number | null;
  correct?: boolean | null;
  notes?: Map<number, boolean>;
  users?: Set<string>;
};

export interface BoardCellProps {
  cell: BoardCellType;
  index: number;
  position: number | null;
  setPosition: React.Dispatch<React.SetStateAction<number | null>>;
  selected: number | null;
  setSelected: React.Dispatch<React.SetStateAction<number | null>>;
}

export interface BoardProps {
  board: BoardCellType[];
  setBoard: React.Dispatch<React.SetStateAction<BoardCellType[]>>;
}