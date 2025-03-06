import React from 'react';
import { Chessboard } from "react-chessboard";

export default function GameBoard({ 
  userColor, 
  boardWidth, 
  gamePosition, 
  isDark,
  drop,
  handleSquareClick,
  getMoveOptions,
  moveSquares,
  checkSquare,
  lastMove,
  setSelectedPiece,
  setMoveSquares 
}) {
  return (
    <Chessboard
      boardOrientation={userColor === 'b' ? 'black' : 'white'}
      boardWidth={boardWidth}
      animationDuration={100}
      position={gamePosition}
      onPieceDrop={drop}
      onSquareClick={handleSquareClick}
      onPieceDragBegin={(piece, square) => getMoveOptions(square)}
      onPieceDragEnd={() => {
        setSelectedPiece(null);
        setMoveSquares({});
      }}
      customSquareStyles={{
        ...moveSquares,
        ...(checkSquare ? {
          [checkSquare]: { background: 'rgba(255, 0, 0, 0.7)' }
        } : {}),
        ...(lastMove ? {
          [lastMove.from]: {
            background: isDark ? 'rgba(181, 137, 0, 0.6)' : 'rgba(255, 255, 0, 0.4)'
          },
          [lastMove.to]: {
            background: isDark ? 'rgba(181, 137, 0, 0.6)' : 'rgba(255, 255, 0, 0.4)'
          }
        } : {})
      }}
      customBoardStyle={{
        borderRadius: "5px",
        boxShadow: isDark 
          ? `0 5px 15px rgba(255, 255, 255, 0.2)`
          : `0 5px 15px rgba(0, 0, 0, 0.5)`,
      }}
    />
  );
}