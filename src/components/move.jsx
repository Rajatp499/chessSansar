import React from "react";

export default function Move({ moves, onUndo, onRedo, onPause, onResign, onDrawReq, onAbort, onGoToMove }) {
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
      <div ref={moveListRef} className="h-[70%]  border-gray-600 border-x-2 scrollbar-hidden overflow-y-scroll">
        {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => {
          const moveNumber = i + 1;
          const whiteMove = moves[i * 2];
          const blackMove = moves[i * 2 + 1];
          
            return (
            <div 
              key={i} 
              className={`text-center border-black border-t-2 ${i === Math.ceil(moves.length / 2) - 1 ? 'border-b-2' : ''} p-2 w-full m-auto flex`}
            >
              <span className="w-8 flex-none">{moveNumber}.</span>
              <div className="flex flex-1 justify-between">
              <span 
                className={`px-2 rounded flex-1 mx-1 ${onGoToMove ? 'hover:bg-gray-200 cursor-pointer' : ''}`}
                onClick={() => onGoToMove && onGoToMove(i * 2)}
              >
                {whiteMove}
              </span>
              {blackMove && (
                <span 
                className={`px-2 rounded flex-1 mx-1 ${onGoToMove ? 'hover:bg-gray-200 cursor-pointer' : ''}`}
                onClick={() => onGoToMove && onGoToMove(i * 2 + 1)}
                >
                {blackMove}
                </span>
              )}
              </div>
            </div>
            );
        })}
      </div>
      <div className="mt-4">
        {moves.length > 0 ? (
          <div className="flex gap-2 mb-4">
            {onResign && (
              <button
                onClick={onResign}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex-1"
              >
                Resign
              </button>
            )}
            {onDrawReq && (
              <button
                onClick={onDrawReq}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-1"
              >
                Offer Draw
              </button>
            )}
          </div>
        ) : (
          <div className="mb-4">
            {onAbort && (
              <button
                onClick={onAbort}
                className="bg-slate-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
              >
                Abort
              </button>
            )}
          </div>
        )}
        <div className="flex gap-2">
          {onUndo && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-1"
              onClick={onUndo}
            >
              Undo
            </button>
          )}
          {onRedo && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-1"
              onClick={onRedo}
            >
              Redo
            </button>
          )}
          {onPause && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-1"
              onClick={onPause}
            >
              Pause
            </button>
          )}
        </div>
      </div>
    </div>
  );
}