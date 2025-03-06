import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Chess } from 'chess.js';
import GameBoard from "../components/online/GameBoard";
import PlayerInfo from "../components/online/PlayerInfo";
import Move from "../components/move";
import useWebSocket from "../hooks/useWebSocket";
import { handleWebSocketMessage } from "../utils/websocketHandlers";
import pp from "../assets/profile.gif";
import useChessGame from "../hooks/useChessGame";

export default function Online() {
  const isDark = useSelector((state) => state.theme.isDark);
  const { roomid } = useParams();

  // Game state from hook
  const {
    game,
    resetGame,
    gamePosition,
    lastMove,
    setLastMove,
    checkSquare,
    makeMove,
    undoMove,
    getMoves,
    updatePosition,
    isGameOver,
    getGameStatus
  } = useChessGame();

  // Player and UI state
  const [user, setUser] = useState(null);
  const [turn, setTurn] = useState(false);  
  const [userName] = useState(localStorage.getItem("username"));
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [userColor, setUserColor] = useState("white");
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [moveSquares, setMoveSquares] = useState({});
  const [boardWidth] = useState(560);

  // Square click handler
  const handleSquareClick = (square) => {
    if (!turn) return;

    if (selectedPiece && moveSquares[square]) {
      const moveResult = drop(selectedPiece, square);
      if (moveResult) {
        setSelectedPiece(null);
        setMoveSquares({});
        return;
      }
    }

    setSelectedPiece(square);
    const moves = getMoves(square);
    const newMoveSquares = {};
    moves.forEach((move) => {
      newMoveSquares[move.to] = {
        background: isDark ? 'rgba(255, 255, 0, 0.4)' : 'rgba(255, 255, 0, 0.2)',
      };
    });
    setMoveSquares(newMoveSquares);
  };

  // Drop handler
  const drop = (sourceSquare, targetSquare) => {
    if (!turn) return false;
    
    const moveSuccess = makeMove(sourceSquare, targetSquare);
    if (moveSuccess) {
      socket.current.send(JSON.stringify({
        action: "make_move",
        move: sourceSquare + targetSquare
      }));
      return true;
    }
    return false;
  };

  // Add handleGoToMove function
  const handleGoToMove = useCallback((moveIndex) => {
    if (!game) return;
    
    try {
      // Create a new game instance
      const tempGame = new Chess();
      
      // Get moves up to the selected index
      const moves = game.history({ verbose: true }).slice(0, moveIndex + 1);
      
      // Apply moves
      moves.forEach(move => {
        tempGame.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion
        });
      });
      
      // Update position
      updatePosition(tempGame.fen());
    } catch (error) {
      console.error('Error navigating to move:', error);
    }
  }, [game, updatePosition]);

  // WebSocket callbacks with error handling
  const websocketCallbacks = {
    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WS message received: ", message);
        handleWebSocketMessage(
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
          setLastMove
        );
      } catch (error) {
        console.error("Error handling websocket message:", error);
      }
    },
    onOpen: () => {
      console.log("WebSocket connection established");
      socket.current?.send(JSON.stringify({ action: "join_game" }));
    },
    onClose: (event) => console.log("WebSocket connection closed:", event.reason),
    onError: (error) => console.error("WebSocket error:", error)
  };

  // Page refresh handling
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('gameRoom', roomid);
    };

    const handleLoad = () => {
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ action: "join_game" }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, [roomid]);

  // Initialize WebSocket
  const socket = useWebSocket({
    url: `${import.meta.env.VITE_BACKEND_CHESS_WS_API}/chess/${roomid}/?token=${localStorage.getItem("token")}`,
    ...websocketCallbacks
  });

  // Game action handlers with error handling
  const handleResign = () => {
    try {
      socket.current?.send(JSON.stringify({ action: "resign_game" }));
    } catch (error) {
      console.error("Error resigning game:", error);
    }
  };

  const handleAbort = () => {
    try {
      socket.current?.send(JSON.stringify({ action: "abort_game" }));
    } catch (error) {
      console.error("Error aborting game:", error);
    }
  };

  const handleDrawReq = () => {
    try {
      socket.current?.send(JSON.stringify({ action: "draw_request" }));
    } catch (error) {
      console.error("Error requesting draw:", error);
    }
  };

  const handlePause = () => {
    try {
      socket.current?.send(JSON.stringify({ action: "pause_request" }));
    } catch (error) {
      console.error("Error pausing game:", error);
    }
  };

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
              getMoveOptions={handleSquareClick}
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

        {game && (
          <Move 
            moves={game.history()} 
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