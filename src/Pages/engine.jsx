import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import Engine from "../Engine/engine.js";
import Move from "../components/move.jsx";
import SelectAI from "../components/selectAi.jsx";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import Timer from "../components/timer.jsx";
import useWindowDimensions from "../hooks/useWindowDimensions.js";

// Constants
const DEFAULT_BOT_LEVEL = 2;
const DEFAULT_GAME_FORMAT = 'rapid';
const DEFAULT_PLAYER_COLOR = 'white';

export const PlayerVsBot = () => {
  // Redux state
  const isDark = useSelector((state) => state.theme.isDark);
  
  // Game state
  const engine = useMemo(() => new Engine(), []);
  const game = useMemo(() => new Chess(), []);
  const [loading, setLoading] = useState(true);
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [botLevel, setBotLevel] = useState(DEFAULT_BOT_LEVEL);
  const [gameFormat, setGameFormat] = useState(DEFAULT_GAME_FORMAT);
  const [playerColor, setPlayerColor] = useState(DEFAULT_PLAYER_COLOR);
  const [openSelectAI, setOpenSelectAI] = useState(true);
  
  // Internal state refs
  const playerColorRef = useRef(DEFAULT_PLAYER_COLOR);

  // Responsiveness
  const { width, height } = useWindowDimensions();
  
  // Calculate optimal board size based on available viewport dimensions
  const boardWidth = useMemo(() => {
    // Calculate maximum sizes that will fit in the viewport
    const maxHeightBasedSize = Math.max(height * 0.85, 280); // Max 55% of viewport height
    const maxWidthBasedSize = Math.max(width * 0.85, 280);   // Max 45% of viewport width
    
    // Choose the smaller of the two to ensure it fits
    let optimalSize = Math.min(maxHeightBasedSize, maxWidthBasedSize);
    
    // Scale down for smaller screens
    if (width < 768) {
      optimalSize = Math.min(width * 0.8, height * 0.45);
    } else if (width < 1024) {
      optimalSize = Math.min(width * 0.5, height * 0.5);
    }
    
    // Round to nearest integer to avoid rendering issues
    return Math.floor(optimalSize);
  }, [width, height]);

  // Calculate max width and height for the move history component
  const moveHistorySize = useMemo(() => {
    // For mobile: horizontal layout with fixed height
    if (width < 768) {
      return {
        width:  '100%',
        height: Math.min(height * 0.3, 400) // Smaller height on mobile
      };
    }
    
    // For desktop: vertical layout with fixed width
    return {
      width: Math.min(width * 0.25, 260), // Keep width smaller than chess board
      height: Math.min(boardWidth * 0.9, height * 0.6) // Proportional to board but not taller than 60% of viewport
    };
  }, [width, height, boardWidth]);

  // Timer refs
  const timerRefs = {
    increment: useRef(null),
    expiryTimestampUser: useRef(null),
    expiryTimestampBot: useRef(null),
    
    // Player timer controls
    user: {
      pause: useRef(null),
      resume: useRef(null),
      restart: useRef(null),
      start: useRef(null),
      increment: useRef(null)
    },
    
    // Bot timer controls
    bot: {
      pause: useRef(null),
      resume: useRef(null),
      restart: useRef(null),
      start: useRef(null),
      increment: useRef(null)
    }
  };

  // Timer handlers
  const createTimerHandler = (refType, action) => {
    return (callback) => {
      timerRefs[refType][action].current = callback;
    };
  };
  
  // Game logic handlers
  const findBestMove = useCallback(() => {
    engine.evaluatePosition(game.fen(), botLevel);
    engine.onMessage(({ bestMove }) => {
      if (bestMove) {
        try {
          const move = game.move({
            from: bestMove.substring(0, 2),
            to: bestMove.substring(2, 4),
            promotion: bestMove.substring(4, 5)
          });
          
          if (move === null) return;
          setGamePosition(game.fen());

          // Start player's clock if it's the first move
          if (game.moveNumber() === 1) {
            timerRefs.user.start.current();
          }
          
          // Pause and increment bot's timer
          timerRefs.bot.increment.current(timerRefs.increment.current);
          timerRefs.bot.pause.current();

          // Check for game end
          if (game.isGameOver() || game.isDraw()) {
            timerRefs.user.pause.current();
            timerRefs.bot.pause.current();
            alert("AI won the game!");
            return false;
          }

          // Resume player's timer
          timerRefs.user.resume.current();
        } catch (error) {
          console.error("Error making bot move:", error);
        }
      }
    });
  }, [game, engine, botLevel]);

  const onDrop = useCallback((sourceSquare, targetSquare, piece) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1]?.toLowerCase() ?? "q"
      });
      
      if (move === null) return false;
      setGamePosition(game.fen());

      // Start bot's timer on first move
      if (game.moveNumber() === 1) {
        timerRefs.bot.start.current();
      }
      
      // Pause and increment player's timer
      timerRefs.user.pause.current();
      timerRefs.user.increment.current(timerRefs.increment.current);

      // Check for game end
      if (game.isGameOver() || game.isDraw()) {
        timerRefs.user.pause.current();
        timerRefs.bot.pause.current();
        alert("Player won the game!");
        return false;
      }

      // Resume bot's timer and find best move
      timerRefs.bot.resume.current();
      findBestMove();
      return true;
    } catch (e) {
      console.error("Error making player move:", e);
      return false;
    }
  }, [game, findBestMove]);

  const handleStartGame = useCallback(({ format, level, color, time }) => {
    setGameFormat(format);
    setBotLevel(level);
    
    // Set player color
    let actualPlayerColor = color;
    if (color === 'random') {
      actualPlayerColor = Math.random() < 0.5 ? 'white' : 'black';
    }
    
    setPlayerColor(actualPlayerColor);
    playerColorRef.current = actualPlayerColor;
    setOpenSelectAI(false);

    // Set up timers
    const [base, inc] = time.split("+").map(Number);
    timerRefs.increment.current = inc;

    const timeInSeconds = base * 60;
    
    // Set expiry timestamps for both timers
    const newBotTimestamp = new Date();
    newBotTimestamp.setSeconds(newBotTimestamp.getSeconds() + timeInSeconds);
    timerRefs.expiryTimestampBot.current = newBotTimestamp;
    
    const newPlayerTimestamp = new Date();
    newPlayerTimestamp.setSeconds(newPlayerTimestamp.getSeconds() + timeInSeconds);
    timerRefs.expiryTimestampUser.current = newPlayerTimestamp;

    setLoading(false);
  }, []);

  const handleUndo = useCallback(() => {
    // Undo both player and bot moves
    game.undo();
    game.undo(); 
    setGamePosition(game.fen());
  }, [game]);
  
  // Close select AI dialog and start game if bot plays first
  const handleCloseSelectAI = useCallback(() => {
    setOpenSelectAI(false);
    if (playerColorRef.current === 'black') {
      findBestMove();
    }
  }, [findBestMove]);

  // Theme styles
  const themeStyles = {
    container: isDark 
      ? 'bg-gray-800 text-white' 
      : 'bg-white text-gray-800',
    card: isDark 
      ? 'bg-gray-700' 
      : 'bg-white shadow-md',
    highlight: isDark
      ? 'bg-blue-600'
      : 'bg-blue-500'
  };

  return (
    <div className={`h-screen w-screen overflow-hidden transition-colors duration-300 ${themeStyles.container}`}>
      <div id="game" className={`h-full ${openSelectAI ? "blur-sm" : ""}`}>
        <div className="h-full w-full p-1 sm:p-2 md:p-4 flex flex-col md:flex-row items-center justify-center">
          {/* Container for chess board and timers */}
          <div className="flex flex-col md:flex-row mb-1 md:mb-0 md:mr-4">
            {/* Chess board */}
            <div className={`rounded-lg p-1 ${themeStyles.card}`}>
              <Chessboard
                boardWidth={boardWidth}
                boardOrientation={playerColor}
                position={gamePosition}
                onPieceDrop={onDrop}
                customBoardStyle={{
                  borderRadius: "5px",
                  boxShadow: `0 5px 15px rgba(0, 0, 0, 0.3)`,
                }}
                customDarkSquareStyle={{ backgroundColor: isDark ? '#4a5568' : '#b58863' }}
                customLightSquareStyle={{ backgroundColor: isDark ? '#718096' : '#f0d9b5' }}
              />
            </div>

            {/* Timers */}
            <div className={`flex flex-row md:flex-col justify-between p-2 mt-1 md:mt-0 md:ml-2 rounded-lg ${themeStyles.card}`}>
              {/* Bot timer */}
              <div className="p-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm md:text-base">Bot level {botLevel}</span>
                  {/* {!loading && game.turn() !== playerColor.substring(0, 1) && 
                    <span className={`py-1 px-2 rounded ${themeStyles.highlight} text-white text-xs font-bold`}>
                      TURN
                    </span>} */}
                </div>
                {!loading && (
                  <Timer
                    expiryTimestamp={timerRefs.expiryTimestampBot.current}
                    onTimeUp={() => alert('Time is up! Player won the game!')}
                    onPause={createTimerHandler('bot', 'pause')}
                    onResume={createTimerHandler('bot', 'resume')}
                    onRestart={createTimerHandler('bot', 'restart')}
                    onStart={createTimerHandler('bot', 'start')}
                    onIncrement={createTimerHandler('bot', 'increment')}
                    highlight={game.turn() !== playerColorRef.current.substring(0,1)}
                    isDark={isDark}
                  />
                )}
              </div>

              {/* Player timer */}
              <div className="p-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm md:text-base">Player</span>
                  {/* {!loading && game.turn() === playerColor.substring(0, 1) && 
                    <span className={`py-1 px-2 rounded ${themeStyles.highlight} text-white text-xs font-bold`}>
                      TURN
                    </span>} */}
                </div>
                {!loading && (
                  <Timer
                    expiryTimestamp={timerRefs.expiryTimestampUser.current}
                    onTimeUp={() => alert('Time is up! AI won the game!')}
                    onPause={createTimerHandler('user', 'pause')}
                    onResume={createTimerHandler('user', 'resume')}
                    onRestart={createTimerHandler('user', 'restart')}
                    onStart={createTimerHandler('user', 'start')}
                    onIncrement={createTimerHandler('user', 'increment')}
                    highlight={game.turn() === playerColorRef.current.substring(0,1)}
                    isDark={isDark}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Moves history - with controlled width and height */}
          <div 
            className={`${themeStyles.card} rounded-lg overflow-hidden`}
            style={{ 
              width: width < 768 ? boardWidth : moveHistorySize.width, 
              height: moveHistorySize.height
            }}
          >
            <Move 
              moves={game.history()} 
              onUndo={handleUndo}
              isDark={isDark}
              compactHeight={width < 768}
              compactView={width < 1024} // Always use compact view on smaller screens
              fixedHeight={true} // Tell Move component to use fixed height mode
            />
          </div>
        </div>
      </div>

      {/* Game setup modal */}
      {openSelectAI && (
        <SelectAI
          open={openSelectAI}
          onStartGame={handleStartGame}
          onClose={handleCloseSelectAI}
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default PlayerVsBot;