import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import GameBoard from "../components/online/GameBoard";
import PlayerInfo from "../components/online/PlayerInfo";
import Move from "../components/move";
import useWebSocket from "../hooks/useWebSocket";
import { Chess } from 'chess.js';
import { handleWebSocketMessage } from "../utils/websocketHandlers";
import pp from "../assets/profile.gif";

export default function Online() {
  const isDark = useSelector((state) => state.theme.isDark);
  const { roomid } = useParams();

  // Game state
  const [game] = useState(() => ({ current: new Chess() }));
  const [gamePosition, setGamePosition] = useState("start");
  const [turn, setTurn] = useState(true);
  const [user, setUser] = useState(null);
  const [userName] = useState(localStorage.getItem("username"));
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [userColor, setUserColor] = useState("white");
  const [lastMove, setLastMove] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [moveSquares, setMoveSquares] = useState({});
  const [checkSquare, setCheckSquare] = useState("");
  const [boardWidth] = useState(560);

  // Square click handler
  const handleSquareClick = (square) => {
    if (!turn) return;

    // If we already have a selected piece and clicking a valid move square
    if (selectedPiece && moveSquares[square]) {
      const moveResult = drop(selectedPiece, square);
      if (moveResult) {
        setSelectedPiece(null);
        setMoveSquares({});
        return;
      }
    }

    // Show possible moves for the clicked piece
    setSelectedPiece(square);
    const moves = game.current.moves({ square, verbose: true });
    const newMoveSquares = {};
    moves.forEach((move) => {
      newMoveSquares[move.to] = {
        background: isDark ? 'rgba(255, 255, 0, 0.4)' : 'rgba(255, 255, 0, 0.2)',
      };
    });
    setMoveSquares(newMoveSquares);
  };

  // Get move options
  const getMoveOptions = (square) => {
    if (!turn) return;
    handleSquareClick(square);
  };

  // Drop handler
  const drop = (sourceSquare, targetSquare) => {
    if (!turn) return false;
    try {
      const move = game.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move) {
        setGamePosition(game.current.fen());
        setLastMove({ from: sourceSquare, to: targetSquare });
        socket.current.send(JSON.stringify({
          action: "make_move",
          move: sourceSquare + targetSquare
        }));
        return true;
      }
    } catch (e) {
      console.error("Error making move:", e);
    }
    return false;
  };

  // Move history navigation
  const handleGoToMove = (moveIndex) => {
    const newGame = new Chess();
    const moves = game.current.history({ verbose: true }).slice(0, moveIndex + 1);
    moves.forEach(move => {
      newGame.move(move);
    });
    setGamePosition(newGame.fen());
  };

  // WebSocket callbacks with join_game action
  const websocketCallbacks = {
    onMessage: (event) => {
      const message = JSON.parse(event.data);
      console.log("WS message received: ", message);
      handleWebSocketMessage(
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
      );
    },
    onOpen: () => {
      console.log("WebSocket connection established");
      // Send join_game action when connection is established
      socket.current?.send(JSON.stringify({ action: "join_game" }));
    },
    onClose: (event) => console.log("WebSocket connection closed:", event.reason),
    onError: (error) => console.error("WebSocket error:", error)
  };

  // Add useEffect for page refresh handling
  useEffect(() => {
    // Store game state before page unload
    const handleBeforeUnload = () => {
      localStorage.setItem('gameRoom', roomid);
    };

    // Rejoin game on page load
    const handleLoad = () => {
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ action: "join_game" }));
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, [roomid]);

  // Initialize WebSocket connection
  const socket = useWebSocket({
    url: `${import.meta.env.VITE_BACKEND_CHESS_WS_API}/chess/${roomid}/?token=${localStorage.getItem("token")}`,
    ...websocketCallbacks
  });

  // Game action handlers
  const handleResign = () => socket.current.send(JSON.stringify({ action: "resign_game" }));
  const handleAbort = () => socket.current.send(JSON.stringify({ action: "abort_game" }));
  const handleDrawReq = () => socket.current.send(JSON.stringify({ action: "draw_request" }));
  const handlePause = () => socket.current.send(JSON.stringify({ action: "pause_request" }));

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="p-4 flex justify-evenly h-screen">
        <div className="flex h-fit p-2 flex-wrap">
          <div className="flex">
            <GameBoard
              userColor={userColor}
              boardWidth={boardWidth}
              gamePosition={gamePosition}
              isDark={isDark}
              drop={drop}
              handleSquareClick={handleSquareClick}
              getMoveOptions={getMoveOptions}
              moveSquares={moveSquares}
              checkSquare={checkSquare}
              lastMove={lastMove}
              setSelectedPiece={setSelectedPiece}
              setMoveSquares={setMoveSquares}
            />
          </div>
          
          <div className="flex flex-col justify-between ml-4">
            <PlayerInfo 
              player={player1 === user ? player2 : player1}
              isCurrentTurn={!turn}
              isDark={isDark}
              image={pp}
            />
            <PlayerInfo 
              player={user}
              isCurrentTurn={turn}
              isDark={isDark}
              image={pp}
            />
          </div>
        </div>

        {game.current && (
          <Move 
            moves={game.current.history()} 
            onResign={handleResign} 
            onAbort={handleAbort} 
            onDrawReq={handleDrawReq} 
            onGoToMove={handleGoToMove}
            isDark={isDark}
            onPause={handlePause}
          />
        )}
      </div>
    </div>
  );
}