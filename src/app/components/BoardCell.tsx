import { BoardCellProps } from "./types";

export const BoardCell: React.FC<BoardCellProps> = ({ cell, index, position, handleMovePos, selected, setSelected }) => {

  const handleClick = () => {
    if (cell.mutable) {
      handleMovePos(index);
    }
    setSelected(cell.value);
  };

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
        {cell.value !== null && !Number.isNaN(cell.value) ? cell.value : ""}
      </div>
    );
  }
  return (
    <div
      className={`w-full h-full flex items-center justify-center h-10 w-10 text-2xl font-bold cursor-pointer
      bg-black rounded-lg 
      ${
        ((cell.users?.length || 0) > 0) && position !== index && "ring-2 ring-orange-200 border-blue-500"
      }
      ${
        position === index ? "ring-2 ring-blue-500 border-blue-500" : ""
      }
      ${
        selected != null && cell.value === selected && position != index ? " text-white bg-blue-900 " : ""
      }`}
      onClick={handleClick}
      title={cell.users && cell.users.length > 0 ? cell.users.join(", ") : undefined}
    >
      {cell.value !== null && !Number.isNaN(cell.value) ? (
      <span className={cell.correct === true ? "text-green-500" : cell.correct === false ? "text-red-500" : ""}>
        {cell.value}
      </span>
      ) : ""}
      {cell.value === null && (cell.notes?.length ?? 0) > 0 && (
       <div className="grid aspect-square h-full w-full grid-cols-3 grid-rows-3 gap-[2px] p-[2px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <div key={num} className={`flex items-center justify-center`}>
          <p className={`text-muted-foreground text-xs ${cell.notes?.includes(num) ? "" : "hidden"}`}>
            {num}
          </p>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};