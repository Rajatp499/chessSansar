import { useState, useCallback } from 'react';
import { Chess, DEFAULT_POSITION } from 'chess.js';

/**
 * Custom hook for managing chess game state and operations
 * @param {string} initialFen - Initial board position in FEN notation
 * @returns {Object} Game state and methods
 */
export default function useChessGame(initialFen = DEFAULT_POSITION) {
  /****************************
   * State Management
   ****************************/
  const [game] = useState(() => ({ current: new Chess(initialFen) }));
  const [gamePosition, setGamePosition] = useState(initialFen);
  const [lastMove, setLastMove] = useState(null);
  const [checkSquare, setCheckSquare] = useState('');
  const [turn, setTurn] = useState(game.current.turn() === 'w');

  /****************************
   * Board Position Updates
   ****************************/
  const updatePosition = useCallback(() => {
    setGamePosition(game.current.fen());
    setTurn(game.current.turn() === 'w');
    
    // Update check status
    if (game.current.inCheck()) {
      const color = game.current.turn();
      const kingSquare = findKingSquare(game.current.board(), color);
      setCheckSquare(kingSquare);
    } else {
      setCheckSquare('');
    }
  }, [game]);

  /****************************
   * Move Operations
   ****************************/
  const makeMove = useCallback((from, to, promotion = 'q') => {
    if (!game.current) return false;

    try {
      const move = game.current.move({ from, to, promotion });
      if (move) {
        updatePosition();
        setLastMove({ from, to });
        return true;
      }
    } catch (e) {
      console.error("Error making move:", e);
    }
    return false;
  }, [updatePosition]);

  const undoMove = useCallback(() => {
    if (!game.current) return;
    game.current.undo();
    setLastMove(null);
    setCheckSquare('');
    updatePosition();
  }, [updatePosition]);

  /****************************
   * Game State Operations
   ****************************/
  const resetGame = useCallback(() => {
    game.current = new Chess();
    setLastMove(null);
    setCheckSquare('');
    updatePosition();
  }, [updatePosition]);

  const getMoves = useCallback((square) => {
    if (!game.current) return [];
    return game.current.moves({ square, verbose: true });
  }, []);

  const getGameStatus = useCallback(() => {
    if (!game.current) return 'invalid';
    if (game.current.isCheckmate()) return 'checkmate';
    if (game.current.isDraw()) return 'draw';
    if (game.current.isStalemate()) return 'stalemate';
    if (game.current.isThreefoldRepetition()) return 'threefold repetition';
    if (game.current.isInsufficientMaterial()) return 'insufficient material';
    return 'ongoing';
  }, []);

  /****************************
   * Helper Functions
   ****************************/
  const findKingSquare = (board, color) => {
    return board.reduce((acc, row, i) => {
      const j = row.findIndex(piece => 
        piece && piece.type === 'k' && piece.color === color
      );
      return j >= 0 ? `${String.fromCharCode(97 + j)}${8 - i}` : acc;
    }, '');
  };

  return {
    game: game.current,
    gamePosition,
    lastMove,
    checkSquare,
    turn,
    makeMove,
    getMoves,
    undoMove,
    resetGame,
    getGameStatus,
    updatePosition,
    setLastMove
  };
}