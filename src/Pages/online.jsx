import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Chess } from 'chess.js';
import GameBoard from "../components/online/GameBoard";
import PlayerInfo from "../components/online/PlayerInfo";
import GameOverModal from "../components/online/GameOverModal";
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
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [moveSquares, setMoveSquares] = useState({});
  const [boardWidth, setBoardWidth] = useState(560);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

        // handle other messages
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
          setGameOver,
          setGameResult
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
      setWindowWidth(screenWidth);
      
      // More responsive board sizing based on screen dimensions
      if (screenWidth < 576) { // Small mobile
        setBoardWidth(Math.min(screenWidth * 0.9, screenHeight * 0.5));
      } else if (screenWidth < 768) { // Mobile
        setBoardWidth(Math.min(screenWidth * 0.85, screenHeight * 0.6));
      } else if (screenWidth < 992) { // Tablet
        setBoardWidth(Math.min(screenWidth * 0.55, screenHeight * 0.7));
      } else if (screenWidth < 1440) { // Standard Desktop
        // Increased board size for desktop - more screen real estate
        setBoardWidth(Math.min(screenWidth * 0.5, 700));
      } else { // Large Desktop
        // Even larger for big screens
        setBoardWidth(Math.min(screenWidth * 0.45, 850));
      }
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

  // Check if we should use desktop layout
  const isDesktopView = windowWidth >= 992;

  /****************************
   * Render Component
   ****************************/
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      
      {/* GameOverModal */}
      {gameOver && gameResult && (
        <GameOverModal result={gameResult} isDark={isDark} />
      )}

      <div className="p-2 sm:p-4 flex flex-col h-screen">
        {/* Main Game Container - Different layout based on screen size */}
        {isDesktopView ? (
          // Desktop Layout - Improved with board on left, controls on right
          <div className="flex flex-row justify-center items-start h-full w-full gap-4 transition-all duration-300">
            {/* Left Section - Chess Board with Players - Now larger */}
            <div className="flex-grow flex flex-col items-center justify-center transition-all duration-300 max-w-[65%]">
              {/* Game area with player info on the sides */}
              <div className="relative flex items-center justify-center w-full">
                {/* Top player (rotated vertically on the left) */}
                <div className={`hidden lg:block absolute left-0 transform -translate-x-full -translate-y-1/4 ${userColor === 'white' ? 'order-first' : 'order-last'}`}>
                  <div className="transform rotate-90 origin-top-right translate-y-full">
                    <PlayerInfo 
                      player={userColor === 'white' ? player2 : player1}
                      isCurrentTurn={!turn && ((userColor === 'white' && player2) || (userColor === 'black' && player1))}
                      isDark={isDark}
                      image={pp}
                      playerColor={userColor === 'white' ? 'b' : 'w'}
                    />
                  </div>
                </div>
                
                {/* Chess Board */}
                <div className="relative">
                  {/* Small screen player info (top) - only visible on smaller desktop */}
                  <div className="lg:hidden w-full mb-2">
                    <PlayerInfo 
                      player={userColor === 'white' ? player2 : player1}
                      isCurrentTurn={!turn && ((userColor === 'white' && player2) || (userColor === 'black' && player1))}
                      isDark={isDark}
                      image={pp}
                      isMobile={true}
                      playerColor={userColor === 'white' ? 'b' : 'w'}
                    />
                  </div>
                  
                  <GameBoard
                    userColor={userColor}
                    boardWidth={boardWidth}
                    gamePosition={gamePosition}
                    isDark={isDark}
                    drop={!gameOver ? drop : () => false}
                    handleSquareClick={!gameOver ? handleSquareClick : () => false}
                    getMoveOptions={!gameOver ? handleSquareClick : () => false}
                    moveSquares={moveSquares}
                    checkSquare={checkSquare}
                    lastMove={lastMove}
                    selectedPiece={selectedPiece}
                    setSelectedPiece={setSelectedPiece}
                    setMoveSquares={setMoveSquares}
                    gameOver={gameOver}
                  />
                  
                  {/* Small screen player info (bottom) - only visible on smaller desktop */}
                  <div className="lg:hidden w-full mt-2">
                    <PlayerInfo 
                      player={userColor === 'white' ? player1 : player2}
                      isCurrentTurn={turn}
                      isDark={isDark}
                      image={pp}
                      isMobile={true}
                      playerColor={userColor === 'white' ? 'w' : 'b'}
                    />
                  </div>
                </div>
                
                {/* Bottom player (rotated vertically on the right) */}
                <div className={`hidden lg:block absolute right-0 transform translate-x-full translate-y-1/4 ${userColor === 'white' ? 'order-last' : 'order-first'}`}>
                  <div className="transform -rotate-90 origin-bottom-left -translate-y-full">
                    <PlayerInfo 
                      player={userColor === 'white' ? player1 : player2}
                      isCurrentTurn={turn}
                      isDark={isDark}
                      image={pp}
                      playerColor={userColor === 'white' ? 'w' : 'b'}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Section - Controls and Game Info */}
            <div className="flex flex-col gap-4 w-1/3 h-full max-w-sm transition-all duration-300">
              {/* Move History - Now on the right side */}
              <div className="flex-1">
                {game && (
                  <Move 
                    moves={game.history()}
                    onAbort={handleAbort} 
                    onResign={!gameOver ? handleResign : undefined} 
                    onDrawReq={!gameOver ? handleDrawReq : undefined} 
                    onGoToMove={handleGoToMove}
                    isDark={isDark}
                    onPause={!gameOver ? handlePause : undefined}
                    compactHeight={false}
                    compactView={false}
                    fixedHeight={true}
                  />
                )}
              </div>
              
              {/* Game Info - Now below the move history */}
              <div className={`h-1/4 min-h-[200px] rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className="font-bold text-lg mb-3">Game Info</h3>
                <div className="space-y-2">
                  <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                    <p className="text-sm font-medium">Game ID: {roomid}</p>
                  </div>
                  <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                    <p className="text-sm font-medium">Status: {gameOver ? 'Game Over' : 'In Progress'}</p>
                  </div>
                  {/* Additional game info can be added here */}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Mobile/Tablet Layout (Original)
          <div className="flex flex-col lg:flex-row h-full w-full">
            {/* Left Column - Chess Board and Player Info */}
            <div className="flex flex-col items-center lg:items-start lg:flex-1 mb-4 lg:mb-0">
              {/* Top Player Info - Visible on all screen sizes */}
              <div className="w-full max-w-lg mb-2 px-2">
                <PlayerInfo 
                  player={player1 === user ? player2 : player1}
                  isCurrentTurn={!turn}
                  isDark={isDark}
                  image={pp}
                  isMobile={true}
                  playerColor={userColor === 'white' ? 'b' : 'w'}
                />
              </div>
              
              {/* Chess Board - Centered and responsive */}
              <div className="flex justify-center w-full">
                <GameBoard
                  userColor={userColor}
                  boardWidth={boardWidth}
                  gamePosition={gamePosition}
                  isDark={isDark}
                  drop={!gameOver ? drop : () => false}
                  handleSquareClick={!gameOver ? handleSquareClick : () => false}
                  getMoveOptions={!gameOver ? handleSquareClick : () => false}
                  moveSquares={moveSquares}
                  checkSquare={checkSquare}
                  lastMove={lastMove}
                  selectedPiece={selectedPiece}
                  setSelectedPiece={setSelectedPiece}
                  setMoveSquares={setMoveSquares}
                  gameOver={gameOver}
                />
              </div>
              
              {/* Bottom Player Info - Visible on all screen sizes */}
              <div className="w-full max-w-lg mt-2 px-2">
                <PlayerInfo 
                  player={user}
                  isCurrentTurn={turn}
                  isDark={isDark}
                  image={pp}
                  isMobile={true}
                  playerColor={userColor === 'white' ? 'w' : 'b'}
                />
              </div>
            </div>

            {/* Right Column - Move History */}
            <div className="lg:w-72 xl:w-80 h-56 sm:h-64 lg:h-full pb-2 px-2">
              {/* Move History Component */}
              {game && (
                <Move 
                  moves={game.history()}
                  onAbort={handleAbort} 
                  onResign={!gameOver ? handleResign : undefined} 
                  onDrawReq={!gameOver ? handleDrawReq : undefined} 
                  onGoToMove={handleGoToMove}
                  isDark={isDark}
                  onPause={!gameOver ? handlePause : undefined}
                  compactHeight={true}
                  compactView={true}
                  fixedHeight={true}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}