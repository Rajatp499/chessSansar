import React from "react";

export default function Move({ moves, isDark, onUndo, onRedo, onPause, onResign, onDrawReq, onAbort, onGoToMove }) {
  const moveListRef = React.useRef(null);

  React.useEffect(() => {
    if (moveListRef.current) {
      const scrollContainer = moveListRef.current;
      const scrollHeight = scrollContainer.scrollHeight;
      scrollContainer.scrollTop = scrollHeight;
    }
  }, [moves]);

  return (
    <div className={`h-[92%] border-2 w-1/3 p-2 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'}`}>
      <h1 className={`text-center text-2xl font-bold underline mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
        Moves
      </h1>
      <div ref={moveListRef} className={`h-[70%] border-x-2 scrollbar-hidden overflow-y-scroll ${isDark ? 'border-gray-600' : 'border-gray-600'}`}>
        {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => {
          const moveNumber = i + 1;
          const whiteMove = moves[i * 2];
          const blackMove = moves[i * 2 + 1];
          
          return (
            <div 
              key={i} 
              className={`text-center border-t-2 ${i === Math.ceil(moves.length / 2) - 1 ? 'border-b-2' : ''} p-2 w-full m-auto flex
                ${isDark ? 'border-gray-600 text-white' : 'border-black text-black'}`}
            >
              <span className="w-8 flex-none">{moveNumber}.</span>
              <div className="flex flex-1 justify-between">
                <span 
                  className={`px-2 rounded flex-1 mx-1 ${onGoToMove ? `${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} cursor-pointer` : ''}`}
                  onClick={() => onGoToMove && onGoToMove(i * 2)}
                >
                  {whiteMove}
                </span>
                {blackMove && (
                  <span 
                    className={`px-2 rounded flex-1 mx-1 ${onGoToMove ? `${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} cursor-pointer` : ''}`}
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
                className={`font-bold py-2 px-4 rounded flex-1 ${isDark ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-700'} text-white`}
              >
                Resign
              </button>
            )}
            {onDrawReq && (
              <button
                onClick={onDrawReq}
                className={`font-bold py-2 px-4 rounded flex-1 ${isDark ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
              >
                Draw
              </button>
            )}
          </div>
        ) : (
          <div className="mb-4">
            {onAbort && (
              <button
                onClick={onAbort}
                className={`font-bold py-2 px-4 rounded w-full ${isDark ? 'bg-slate-700 hover:bg-red-800' : 'bg-slate-600 hover:bg-red-700'} text-white`}
              >
                Abort
              </button>
            )}
          </div>
        )}
        <div className="flex gap-2">
          {onUndo && (
            <button
              className={`font-bold py-2 px-4 rounded flex-1 ${isDark ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
              onClick={onUndo}
            >
              Undo
            </button>
          )}
          {onRedo && (
            <button
              className={`font-bold py-2 px-4 rounded flex-1 ${isDark ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
              onClick={onRedo}
            >
              Redo
            </button>
          )}
          {onPause && (
            <button
              className={`font-bold py-2 px-4 rounded flex-1 ${isDark ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
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