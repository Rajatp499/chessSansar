const handleConnected = (message, setUser) => {
  setUser(message.message.player.user);
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

const handleReconnectedWithMoves = (message, resetGame, makeMove) => {
  try {
    const r_moves = message.game.moves;
    
    const sortedMoves = r_moves.sort((a, b) => 
      new Date(a.played_at) - new Date(b.played_at)
    );

    resetGame();
    sortedMoves.forEach(moveObj => {
        const from =  moveObj.move.substring(0, 2);
        const to = moveObj.move.substring(2, 4);
        const promotion = moveObj.move.substring(4, 5).toLowerCase() || 'q';
        makeMove(from, to, promotion);
    });
  } catch (e) {
    console.error("Error in reconnection:", e);
  }
};

const handleMove = (message, userName, setTurn, makeMove) => {
  const current_turn = message.game.current_turn;
  setTurn(
    (message.game.player1 === userName && current_turn === 'player1') ||
    (message.game.player2 === userName && current_turn === 'player2')
  );

  if (message.message.player.user !== userName) {
    const r_move = message.game.move;
    const from = r_move.substring(0, 2);
    const to = r_move.substring(2, 4);
    const promotion = r_move.substring(4, 5).toLowerCase() || 'q';

    try {
        makeMove(from, to, promotion);
    } catch (e) {
      console.error("Error making opponent move:", e);
    }
  }
};

export const handleWebSocketMessage = (
  message,
  resetGame,
  makeMove,
  undoMove,
  setTurn,
  userName,
  setUser,
  setPlayer1,
  setPlayer2,
  setUserColor
) => {
  const info = message.message.info;
  const type = message.message.type;

  if (type === 'only_me' && info === 'invalid') {
    undoMove();
    return;
  }

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
      handleReconnectedWithMoves(message, resetGame, makeMove);
      break;

    case "moved":
      handleMove(message, userName, setTurn, makeMove);
      break;

    case "resigned":
      console.log('Game ended:', message);
      break;

    default:
      console.log("Unhandled message info:", info);
  }
};