import { Chess } from 'chess.js';

const handleConnected = (message, setUser) => {
  setUser(message.message.player.user);
  console.log("Connected user:", message.message.player.user);
};

const updateUserState = (p1, p2, p1Col, p2Col, userName, setUserColor) => {
  if (p1 === userName) {
    setUserColor(p1Col.substr(0, 1));
  } else {
    setUserColor(p2Col.substr(0, 1));
  }
};

const handleJoinedOrReconnected = (message, userName, setTurn, setPlayer1, setPlayer2, setUserColor) => {
  updateUserState(
    message.game.player1,
    message.game.player2,
    message.game.player1_color,
    message.game.player2_color,
    userName,
    setUserColor
  );

  setPlayer1(message.game.player1);
  setPlayer2(message.game.player2);

  const current_turn = message.game.current_turn;
  setTurn(
    (message.game.player1 === userName && current_turn === 'player1') ||
    (message.game.player2 === userName && current_turn === 'player2')
  );
};

const handleReconnectedWithMoves = (message, game, setGamePosition) => {
  try {
    const r_moves = message.game.moves;
    game.current = new Chess();
    
    const sortedMoves = r_moves.sort((a, b) => 
      new Date(a.played_at) - new Date(b.played_at)
    );

    sortedMoves.forEach(moveObj => {
      game.current.move({
        from: moveObj.move.substring(0, 2),
        to: moveObj.move.substring(2, 4),
        promotion: moveObj.move.substring(4, 5).toLowerCase() || "q"
      });
    });

    setGamePosition(game.current.fen());
  } catch (e) {
    console.log("Error in reconnection:", e);
  }
};

const handleMove = (message, userName, game, setGamePosition, setTurn, setLastMove) => {
  const current_turn = message.game.current_turn;
  setTurn(
    (message.game.player1 === userName && current_turn === 'player1') ||
    (message.game.player2 === userName && current_turn === 'player2')
  );

  if (message.message.player.user !== userName) {
    const r_move = message.game.move;
    const fromSquare = r_move.substring(0, 2);
    const toSquare = r_move.substring(2, 4);

    try {
      const move = game.current.move({
        from: fromSquare,
        to: toSquare,
        promotion: r_move.substring(4, 5).toLowerCase() || "q"
      });

      if (move) {
        setGamePosition(game.current.fen());
        setLastMove({ from: fromSquare, to: toSquare });
      }
    } catch (e) {
      console.log("Error making opponent move:", e);
    }
  }
};

const handleInvalidMove = (game, setGamePosition) => {
  try {
    console.log("invalide move:: ");
    if (game.current) {
      game.current.undo();
      setGamePosition(game.current.fen());
    }
  } catch (e) {
    console.log("Error undoing invalid move:", e);
  }
};

export const handleWebSocketMessage = (
  message,
  game,
  setGamePosition,
  setTurn,
  userName,
  setUser,
  setPlayer1,
  setPlayer2,
  setUserColor,
  setLastMove
) => {
  const info = message.message.info;
  const type = message.message.type;

  // handle invalid move
  if (type === 'only_me' && info === 'invalid') {
    handleInvalidMove(game, setGamePosition);
    return;
  }

  // Only process messages for both players
  if (type !== "both" && info !== "connected") {
    return;
  }

  switch (info) {
    case "connected":
      handleConnected(message, setUser);
      break;

    case "joined":
      handleJoinedOrReconnected(message, userName, setTurn, setPlayer1, setPlayer2, setUserColor);
      break;

    case "reconnected":
      handleJoinedOrReconnected(message, userName, setTurn, setPlayer1, setPlayer2, setUserColor);
      handleReconnectedWithMoves(message, game, setGamePosition);
      break;

    case "moved":
      handleMove(message, userName, game, setGamePosition, setTurn, setLastMove);
      break;

    case "resigned":
      console.log('Game ended:', message);
      break;

    default:
      console.log("Unhandled message info:", info);
  }
};