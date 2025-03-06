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

  /****************************
   * Game State Management
   ****************************/
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
    getGameStatus
  } = useChessGame();

  /****************************
   * Player State Management
   ****************************/
  const [user, setUser] = useState(null);
  const [turn, setTurn] = useState(false);  
  const [userName] = useState(localStorage.getItem("username"));
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [userColor, setUserColor] = useState("white");

  /****************************
   * UI State Management
   ****************************/
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [moveSquares, setMoveSquares] = useState({});
  const [boardWidth, setBoardWidth] = useState(560);

  /****************************
   * Move Handlers
   ****************************/
  // Handle square click and highlight valid moves
  const handleSquareClick = useCallback((square) => {
    if (!turn) return;

    // If a piece is selected and the clicked square is a valid move
    if (selectedPiece && moveSquares[square]) {
      const moveResult = drop(selectedPiece, square);
      if (moveResult) {
        setSelectedPiece(null);
        setMoveSquares({});
        return;
      }
    }

    // Show valid moves for selected piece
    setSelectedPiece(square);
    const moves = getMoves(square);
    const newMoveSquares = {};
    moves.forEach((move) => {
      newMoveSquares[move.to] = {
        background: isDark ? 'rgba(255, 255, 0, 0.4)' : 'rgba(255, 255, 0, 0.2)',
      };
    });
    setMoveSquares(newMoveSquares);
  }, [turn, selectedPiece, moveSquares, getMoves, isDark]);

  // Handle piece movement
  const drop = useCallback((sourceSquare, targetSquare) => {
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
  }, [turn, makeMove]);

  /****************************
   * Move History Navigation
   ****************************/
  const handleGoToMove = useCallback((moveIndex) => {
    if (!game) return;
    
    try {
      const tempGame = new Chess();
      const moves = game.history({ verbose: true }).slice(0, moveIndex + 1);
      
      moves.forEach(move => {
        tempGame.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion
        });
      });
      
      updatePosition(tempGame.fen());
    } catch (error) {
      console.error('Error navigating to move:', error);
    }
  }, [game, updatePosition]);

  /****************************
   * WebSocket Configuration
   ****************************/
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

  const socket = useWebSocket({
    url: `${import.meta.env.VITE_BACKEND_CHESS_WS_API}/chess/${roomid}/?token=${localStorage.getItem("token")}`,
    ...websocketCallbacks
  });

  /****************************
   * Window Event Handlers
   ****************************/
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const maxWidth = Math.min(screenWidth * 0.5, screenHeight * 0.8);
      setBoardWidth(maxWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle page refresh/unload
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

  /****************************
   * Game Action Handlers
   ****************************/
  const handleGameAction = (action) => {
    try {
      socket.current?.send(JSON.stringify({ action }));
    } catch (error) {
      console.error(`Error with ${action}:`, error);
    }
  };

  const handleResign = () => handleGameAction("resign_game");
  const handleAbort = () => handleGameAction("abort_game");
  const handleDrawReq = () => handleGameAction("draw_request");
  const handlePause = () => handleGameAction("pause_request");

  /****************************
   * Render Component
   ****************************/
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="p-4 flex justify-evenly h-screen">
        {/* Game Board Section */}
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
          
          {/* Player Info Section */}
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

        {/* Move History Section */}
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