import React, { useRef, useEffect } from "react";
import useWindowDimensions from "../hooks/useWindowDimensions";

export default function Move({ 
  moves, 
  isDark = false, 
  onUndo, 
  onRedo, 
  onPause, 
  onResign, 
  onDrawReq, 
  onAbort, 
  onGoToMove,
  compactHeight = false,
  compactView = false,
  fixedHeight = false 
}) {
  const moveListRef = useRef(null);
  const { width } = useWindowDimensions();
  
  // Determine layout based on screen size or props override
  const isCompactView = compactView || width < 768;
  const isMobileView = width < 576;

  useEffect(() => {
    if (moveListRef.current) {
      const scrollContainer = moveListRef.current;
      
      // Auto-scroll to the latest move
      if (isMobileView) {
        // For mobile horizontal scrolling, scroll to the end
        scrollContainer.scrollLeft = scrollContainer.scrollWidth;
      } else {
        // For vertical scrolling, scroll to the bottom
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [moves, isMobileView]);

  const themeClasses = {
    container: isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black',
    header: isDark ? 'text-white bg-gray-700' : 'text-black bg-gray-100',
    moveNumber: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700',
    moveItem: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200',
    buttonPrimary: isDark ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-700',
    buttonDanger: isDark ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-700',
    buttonNeutral: isDark ? 'bg-slate-700 hover:bg-slate-800' : 'bg-slate-500 hover:bg-slate-700',
    scrollThumb: isDark ? 'scrollbar-thumb-gray-600' : 'scrollbar-thumb-gray-400',
    border: isDark ? 'border-gray-600' : 'border-gray-300'
  };

  // Mobile horizontal moves display
  const renderMobileView = () => (
    <div 
      ref={moveListRef}
      className={`flex overflow-x-auto py-1 px-1 scrollbar-thin ${themeClasses.scrollThumb} whitespace-nowrap`}
      style={{ maxWidth: '100%', msOverflowStyle: 'none', scrollbarWidth: 'thin' }}
    >
      {moves.length === 0 ? (
        <div className="flex items-center justify-center w-full text-gray-500">
          No moves yet
        </div>
      ) : (
        Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => {
          const moveNumber = i + 1;
          const whiteMove = moves[i * 2];
          const blackMove = moves[i * 2 + 1];
          
          return (
            <div key={i} className="inline-flex items-center mr-2 flex-shrink-0">
              <span className={`px-1 text-xs rounded min-w-[24px] text-center ${themeClasses.moveNumber}`}>
                {moveNumber}.
              </span>
              <span 
                className={`px-1 mx-1 rounded cursor-pointer text-sm ${themeClasses.moveItem}`}
                onClick={() => onGoToMove && onGoToMove(i * 2)}
              >
                {whiteMove}
              </span>
              {blackMove && (
                <span 
                  className={`px-1 mx-1 rounded cursor-pointer text-sm ${themeClasses.moveItem}`}
                  onClick={() => onGoToMove && onGoToMove(i * 2 + 1)}
                >
                  {blackMove}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  // Compact view for tablets
  const renderCompactView = () => (
    <div className="p-1">
      {moves.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No moves yet
        </div>
      ) : (
        Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => {
          const moveNumber = i + 1;
          const whiteMove = moves[i * 2];
          const blackMove = moves[i * 2 + 1];
          
          return (
            <div key={i} className="mb-1 text-sm">
              <span className={`inline-block w-6 px-1 rounded ${themeClasses.moveNumber}`}>
                {moveNumber}.
              </span>
              <span 
                className={`inline-block px-1 mx-1 rounded cursor-pointer ${themeClasses.moveItem}`}
                onClick={() => onGoToMove && onGoToMove(i * 2)}
              >
                {whiteMove}
              </span>
              {blackMove && (
                <span 
                  className={`inline-block px-1 mx-1 rounded cursor-pointer ${themeClasses.moveItem}`}
                  onClick={() => onGoToMove && onGoToMove(i * 2 + 1)}
                >
                  {blackMove}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  // Desktop table view
  const renderTableView = () => (
    <table className="w-full border-collapse">
      <thead>
        <tr className={themeClasses.header}>
          <th className="w-[20%] py-1 text-center">#</th>
          <th className="w-[40%] py-1 text-center">White</th>
          <th className="w-[40%] py-1 text-center">Black</th>
        </tr>
      </thead>
      <tbody>
        {moves.length === 0 ? (
          <tr>
            <td colSpan="3" className="text-center py-4 text-gray-500">
              No moves yet
            </td>
          </tr>
        ) : (
          Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => {
            const moveNumber = i + 1;
            const whiteMove = moves[i * 2];
            const blackMove = moves[i * 2 + 1];
            
            return (
              <tr 
                key={i}
                className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-200 hover:bg-gray-100/70'}`}
              >
                <td className="py-1 text-center">{moveNumber}.</td>
                <td 
                  className={`py-1 text-center cursor-pointer ${onGoToMove ? 'hover:font-medium' : ''}`}
                  onClick={() => onGoToMove && onGoToMove(i * 2)}
                >
                  {whiteMove}
                </td>
                <td 
                  className={`py-1 text-center cursor-pointer ${onGoToMove ? 'hover:font-medium' : ''}`}
                  onClick={() => blackMove && onGoToMove && onGoToMove(i * 2 + 1)}
                >
                  {blackMove}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  // Determine container class based on props
  const containerClass = fixedHeight 
    ? 'h-full w-full' 
    : 'h-[200px] md:h-[400px] w-full md:w-72 lg:w-80';
  
  // Adjust move list height based on props
  const moveListHeight = compactHeight ? 'h-[60px]' : 'h-[calc(100%-140px)]';

  return (
    <div className={`${containerClass} p-1 border rounded-lg shadow-md ${themeClasses.container} overflow-hidden`}>
      {/* Header */}
      <h1 className={`text-center text-md font-bold py-1 mb-1 rounded-t-lg ${themeClasses.header}`}>
        Move History
      </h1>

      {/* Moves display area - fixed height with scrolling */}
      {isMobileView ? (
        // Mobile view with horizontal scrolling
        <div className={`${moveListHeight} border rounded-lg overflow-hidden ${themeClasses.border}`}>
          {renderMobileView()}
        </div>
      ) : (
        // Tablet/Desktop view with vertical scrolling
        <div 
          ref={moveListRef} 
          className={`${moveListHeight} overflow-y-auto border rounded-lg scrollbar-thin ${themeClasses.scrollThumb} ${themeClasses.border}`}
        >
          {isCompactView ? renderCompactView() : renderTableView()}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-2">
        {/* Move control buttons */}
        <div className="flex flex-wrap gap-1">
          {onUndo && (
            <button
              className={`font-medium py-1 px-2 text-sm rounded flex-1 text-white ${themeClasses.buttonPrimary}`}
              onClick={onUndo}
            >
              Undo
            </button>
          )}
          {onRedo && (
            <button
              className={`font-medium py-1 px-2 text-sm rounded flex-1 text-white ${themeClasses.buttonPrimary}`}
              onClick={onRedo}
            >
              Redo
            </button>
          )}
          {onPause && (
            <button
              className={`font-medium py-1 px-2 text-sm rounded flex-1 text-white ${themeClasses.buttonPrimary}`}
              onClick={onPause}
            >
              Pause
            </button>
          )}
        </div>

        {/* Game control buttons */}
        {moves.length > 0 && (
          <div className="flex gap-1 mt-1">
            {onResign && (
              <button
                onClick={onResign}
                className={`font-medium py-1 px-2 text-sm rounded flex-1 text-white ${themeClasses.buttonDanger}`}
              >
                Resign
              </button>
            )}
            {onDrawReq && (
              <button
                onClick={onDrawReq}
                className={`font-medium py-1 px-2 text-sm rounded flex-1 text-white ${themeClasses.buttonPrimary}`}
              >
                Draw
              </button>
            )}
            {onAbort && (
              <button
                onClick={onAbort}
                className={`font-medium py-1 px-2 text-sm rounded flex-1 text-white ${themeClasses.buttonNeutral}`}
              >
                Abort
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}