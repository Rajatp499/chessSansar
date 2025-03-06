import React from 'react';
import { Chessboard } from "react-chessboard";

/**
 * GameBoard component for displaying the chess board and handling interactions
 */
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
  selectedPiece,  // Add this prop
  setSelectedPiece,
  setMoveSquares,
  gameOver = false
}) {
  // Define color themes
  const colors = {
    dark: {
      selectedPiece: 'rgba(180, 180, 205, 0.8)',
      lastMove: 'rgba(181, 137, 0, 0.6)',        // Gold
      availableMove: 'rgba(144, 238, 144, 0.5)', // Light green
      check: 'rgba(255, 0, 0, 0.7)'              // Red
    },
    light: {
      selectedPiece: 'rgba(180, 180, 205, 0.5)',
      lastMove: 'rgba(255, 255, 0, 0.4)',        // Yellow
      availableMove: 'rgba(144, 238, 144, 0.3)', // Lighter green
      check: 'rgba(255, 0, 0, 0.5)'              // Lighter red
    }
  };

  // Get current theme colors
  const theme = isDark ? colors.dark : colors.light;

  // Combine all square styles
  const customSquareStyles = {
    // Available moves
    ...moveSquares,

    // Selected piece
    ...(selectedPiece ? {
      [selectedPiece]: {
        background: theme.selectedPiece,
        borderRadius: '8px'
      }
    } : {}),

    // Check square
    ...(checkSquare ? {
      [checkSquare]: {
        background: theme.check,
        borderRadius: '50%'
      }
    } : {}),

    // Last move
    ...(lastMove ? {
      [lastMove.from]: {
        background: theme.lastMove,
        borderRadius: '4px'
      },
      [lastMove.to]: {
        background: theme.lastMove,
        borderRadius: '4px'
      }
    } : {})
  };

  // Update moveSquares style
  Object.keys(moveSquares).forEach(square => {
    customSquareStyles[square] = {
      background: theme.availableMove,
      borderRadius: '4px'
    };
  });

  return (
    <div className="relative">
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
        customSquareStyles={customSquareStyles}
        customBoardStyle={{
          borderRadius: "5px",
          boxShadow: isDark
            ? `0 5px 15px rgba(255, 255, 255, 0.2)`
            : `0 5px 15px rgba(0, 0, 0, 0.5)`,
        }}
      />
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="text-white text-2xl font-bold">
            Game Over
          </div>
        </div>
      )}
    </div>
  );
}