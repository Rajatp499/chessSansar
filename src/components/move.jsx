import React from "react";


export default function Move({ moves, onUndo, onResign, onDrawReq, onAbort, onGoToMove }) {
  console.log("moves: ", moves);
  const moveListRef = React.useRef(null);

  React.useEffect(() => {
    if (moveListRef.current) {
      const scrollContainer = moveListRef.current;
      const scrollHeight = scrollContainer.scrollHeight;
      scrollContainer.scrollTop = scrollHeight;
    }
  }, [moves]);

  return (
    <div className="h-[92%] border-black border-2 w-1/3 p-2">
      <h1 className="text-center text-2xl font-bold underline mb-4">
        Moves
      </h1>
      <div ref={moveListRef} className="h-[70%] scrollbar-hidden overflow-y-scroll">
        {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => {
          const moveNumber = i + 1;
          const whiteMove = moves[i * 2];
          const blackMove = moves[i * 2 + 1];
          
            return (
            <div key={i} className="text-center border-black border-b-2 p-2 w-full m-auto flex">
              <span className="w-8 flex-none">{moveNumber}.</span>
              <div className="flex flex-1 justify-between">
              <button 
                className="hover:bg-gray-200 px-2 rounded flex-1 mx-1"
                onClick={() => onGoToMove(i * 2)}
              >
                {whiteMove}
              </button>
              {blackMove && (
                <button 
                className="hover:bg-gray-200 px-2 rounded flex-1 mx-1"
                onClick={() => onGoToMove(i * 2 + 1)}
                >
                {blackMove}
                </button>
              )}
              </div>
            </div>
            );
        })}
      </div>
      <div className="mt-4">
        {moves.length > 0 ? (
          <div className="flex gap-2 mb-4">
            <button
              onClick={onResign}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex-1"
            >
              Resign
            </button>
            <button
              onClick={onDrawReq}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-1"
            >
              Offer Draw
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              onClick={onAbort}
              className="bg-slate-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Abort
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-1"
            onClick={onUndo}
          >
            Undo
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-1"
            onClick={() => {/* Add redo handler */}}
          >
            Redo
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-1"
            onClick={() => {/* Add pause handler */}}
          >
            Pause
          </button>
        </div>
      </div>
    </div>
  );
}