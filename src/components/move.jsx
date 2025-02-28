export default function Move({ moves, onUndo }) {
  return (
    <div className="h-[92%] border-black border-2 w-1/3 p-2">
      <h1 className="text-center text-2xl font-bold underline mb-4">
        Moves
      </h1>
      <div  className="h-[80%] scrollbar-hidden overflow-y-scroll">
        {moves.map((move, index) => {
          // Only process every two moves together (one for White, one for Black)
          if (index % 2 === 0) {
            return (
              <div
                key={index}
                className="text-center border-black border-b-2 p-2 w-1/2 m-auto flex justify-between"
              >
                <span>{index / 2 + 1}. {moves[index]}</span>
                <span>{moves[index + 1] || ""}</span>
              </div>
            );
          }
          return null; // Skip odd indexes since they're handled with the previous one
        })}

      </div>
      <div>
        <button
          className="bg-blue-500 text-white p-2 rounded-md w-full mt-4"
          onClick={onUndo}
        >
          Undo
        </button>
      </div>
    </div>
  );
}