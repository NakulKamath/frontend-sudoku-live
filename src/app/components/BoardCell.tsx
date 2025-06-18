import { BoardCellProps } from "./types";

export const BoardCell: React.FC<BoardCellProps> = ({ cell, index, position, setPosition, selected, setSelected }) => {

  const handleClick = () => {
    setPosition(index);
    setSelected(cell.value);
  };

  if (index === 13) {
    cell.value = 8;
  }

  if (!cell.mutable) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center h-10 w-10 text-2xl font-bold cursor-pointer
          bg-black rounded-lg ${
            position === index ? " ring-2 ring-gray-800 border-blue-500 " : ""
          }
          ${
            selected != null && cell.value === selected && position != index ? " text-white bg-blue-900 " : ""
          }`}
        onClick={handleClick}
      >
        {cell.value !== null ? cell.value : ""}
      </div>
    );
  }
  return (
    <div
      className={`w-full h-full flex items-center justify-center h-10 w-10 text-2xl font-bold cursor-pointer
        bg-black rounded-lg ${
          position === index ? "ring-2 ring-blue-500 border-blue-500" : ""
        }
        ${
          (cell.users?.size || 0 > 0) || index === 10 && "ring-2 ring-orange-200 border-blue-500"
        }
        ${
          selected != null && cell.value === selected && position != index ? " text-white bg-blue-200/20 " : ""
        }`}
      onClick={handleClick}
    >
      {cell.value !== null ? cell.value : ""}
      {cell.notes && (
        <div className="notes">
          {Array.from(cell.notes).join(", ")}
        </div>
      )}
    </div>
  );
};