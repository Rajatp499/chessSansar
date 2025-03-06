import { useState, useCallback } from 'react';
import { Chess, DEFAULT_POSITION } from 'chess.js';

export default function useChessGame(initialFen = DEFAULT_POSITION) {
  const [game] = useState(() => ({ current: new Chess(initialFen) }));
  const [gamePosition, setGamePosition] = useState(initialFen);
  const [lastMove, setLastMove] = useState(null);
  const [checkSquare, setCheckSquare] = useState('');
  const [turn, setTurn] = useState(game.current.turn() === 'w');

  // Update position and check status
  const updatePosition = useCallback(() => {
    setGamePosition(game.current.fen());
    
    // Update turn
    setTurn(game.current.turn() === 'w');
    
    // Update check status
    if (game.current.inCheck()) {
      const color = game.current.turn();
      // Find king's square
      const kingSquare = game.current.board().reduce((acc, row, i) => {
        const j = row.findIndex(piece => 
          piece && piece.type === 'k' && piece.color === color
        );
        return j >= 0 ? `${String.fromCharCode(97 + j)}${8 - i}` : acc;
      }, '');
      setCheckSquare(kingSquare);
    } else {
      setCheckSquare('');
    }
  }, [game]);

  // Make a move
  const makeMove = useCallback((from, to, promotion = 'q') => {
    if (!game.current) return false;

    try {
      const move = game.current.move({
        from,
        to,
        promotion
      });

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

    const resetGame = useCallback(() => {
        game.current = new Chess();
        setLastMove(null);
        setCheckSquare('');
        updatePosition();
    }, [updatePosition]);

    const undoMove = useCallback(() => {
        if (!game.current) return;
        game.current.undo();
        setLastMove(null);
        setCheckSquare('');
        updatePosition();
    }, [updatePosition]);

  // Get available moves for a square
  const getMoves = useCallback((square) => {
    if (!game.current) return [];
    return game.current.moves({ square, verbose: true });
  }, []);

  // Check if game is over
  const isGameOver = useCallback(() => {
    return game.current.isGameOver();
  }, []);

  // Get game status
  const getGameStatus = useCallback(() => {
    if (game.current.isCheckmate()) return 'checkmate';
    if (game.current.isDraw()) return 'draw';
    if (game.current.isStalemate()) return 'stalemate';
    if (game.current.isThreefoldRepetition()) return 'threefold repetition';
    if (game.current.isInsufficientMaterial()) return 'insufficient material';
    return 'ongoing';
  }, []);

  return {
    game: game.current,
    resetGame,
    gamePosition,
    lastMove,
    setLastMove,
    checkSquare,
    turn,
    makeMove,
    undoMove,
    getMoves,
    isGameOver,
    getGameStatus,
    updatePosition
  };
}