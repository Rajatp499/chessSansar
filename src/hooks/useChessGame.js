import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';

export default function useChessGame(initialFen) {
  const [game, setGame] = useState(new Chess(initialFen));
  const [gamePosition, setGamePosition] = useState(initialFen);
  const [lastMove, setLastMove] = useState(null);
  const [checkSquare, setCheckSquare] = useState('');

  const updatePosition = useCallback(() => {
    setGamePosition(game.fen());
    if (game.inCheck()) {
      const color = game.turn();
      const kingSquare = game.board().reduce((acc, row, i) => {
        const j = row.findIndex(piece => piece && piece.type === 'k' && piece.color === color);
        return j >= 0 ? `${String.fromCharCode(97 + j)}${8 - i}` : acc;
      }, '');
      setCheckSquare(kingSquare);
    } else {
      setCheckSquare('');
    }
  }, [game]);

  return {
    game,
    gamePosition,
    lastMove,
    checkSquare,
    setLastMove,
    updatePosition
  };
}