/****************************
 * User State Handlers
 ****************************/

/**
 * Handle initial connection and set user data
 * @param {Object} message - WebSocket message containing user data
 * @param {Function} setUser - Function to update user state
 */
const handleConnected = (message, setUser) => {
  setUser(message.message.player.user);
};

/**
 * Update user color based on player assignment
 * @param {string} p1 - Player 1 username
 * @param {string} p2 - Player 2 username
 * @param {string} p1Col - Player 1 color
 * @param {string} p2Col - Player 2 color
 * @param {string} userName - Current user's name
 * @param {Function} setUserColor - Function to update user's color
 */
const updateUserState = (p1, p2, p1Col, p2Col, userName, setUserColor) => {
  setUserColor(p1 === userName ? p1Col.substr(0, 1) : p2Col.substr(0, 1));
};

/****************************
 * Game State Handlers
 ****************************/

/**
 * Handle game join or reconnection events
 * Updates player information and turn state
 */
const handleJoinedOrReconnected = (message, userName, setTurn, setPlayer1, setPlayer2, setUserColor) => {
  // Update player colors
  updateUserState(
    message.game.player1,
    message.game.player2,
    message.game.player1_color,
    message.game.player2_color,
    userName,
    setUserColor
  );

  // Set player information
  setPlayer1(message.game.player1);
  setPlayer2(message.game.player2);

  // Update turn state
  const current_turn = message.game.current_turn;
  const isUserTurn = (message.game.player1 === userName && current_turn === 'player1') ||
                    (message.game.player2 === userName && current_turn === 'player2');
  setTurn(isUserTurn);
};

/**
 * Handle game reconnection with existing moves
 * Replays all moves in correct order
 */
const handleReconnectedWithMoves = (message, resetGame, makeMove) => {
  try {
    // Sort moves by timestamp
    const sortedMoves = message.game.moves.sort((a, b) => 
      new Date(a.played_at) - new Date(b.played_at)
    );

    // Reset and replay moves
    resetGame();
    sortedMoves.forEach(moveObj => {
      const [from, to] = [
        moveObj.move.substring(0, 2),
        moveObj.move.substring(2, 4)
      ];
      const promotion = moveObj.move.substring(4, 5).toLowerCase() || 'q';
      makeMove(from, to, promotion);
    });
  } catch (e) {
    console.error("Error in reconnection:", e);
  }
};

/****************************
 * Move Handlers
 ****************************/

/**
 * Handle move messages and update game state
 * Only applies moves from opponent
 */
const handleMove = (message, userName, setTurn, makeMove) => {
  // Update turn state
  const current_turn = message.game.current_turn;
  const isUserTurn = (message.game.player1 === userName && current_turn === 'player1') ||
                    (message.game.player2 === userName && current_turn === 'player2');
  setTurn(isUserTurn);

  // Apply opponent's move
  if (message.message.player.user !== userName) {
    const move = message.game.move;
    try {
      makeMove(
        move.substring(0, 2),    // from
        move.substring(2, 4),    // to
        move.substring(4, 5).toLowerCase() || 'q'  // promotion
      );
    } catch (e) {
      console.error("Error making opponent move:", e);
    }
  }
};

/* Handles resigned game */
const handleGameEnded = (message) => {
  const game = message.game;
  const winner = game.winner === 'player1' ? game.player1 : game.player2;
  const color = game.winner === 'player1' ? game.player1_color: game.player2_color;

  return {
    status: message.game.status,
    winner,
    color, 
    over_type: message.game.over_type
  };
};

/****************************
 * Main Message Handler
 ****************************/

/**
 * Main WebSocket message handler
 * Routes messages to appropriate handlers based on type and info
 */
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
  setUserColor,
  setGameOver,
  setGameResult
) => {
  const { info, type } = message.message;

  // Handle invalid move
  if (type === 'only_me' && info === 'invalid') {
    undoMove();
    return;
  }

  // Filter messages
  if (type !== "both" && info !== "connected") return;

  // Route message to appropriate handler
  switch (info) {
    case "connected":
      handleConnected(message, setUser);
      break;
    case "joined":
    case "reconnected":
      handleJoinedOrReconnected(message, userName, setTurn, setPlayer1, setPlayer2, setUserColor);
      if (info === "reconnected") {
        handleReconnectedWithMoves(message, resetGame, makeMove);
        if (message.game.status === 'ended') {
          setGameOver(true);
          const result = handleGameEnded(message);
          setGameResult(result);
        }
      }
      break;
    case "moved":
      handleMove(message, userName, setTurn, makeMove);
      if (message.game.status === 'ended') {
        setGameOver(true);
        const result = handleGameEnded(message);
        setGameResult(result);
      }
      break;
    case "resigned":
      const result = handleGameEnded(message);
      setGameOver(true);
      setGameResult(result);
      break;
    default:
      console.log("Unhandled message info:", info);
  }
};