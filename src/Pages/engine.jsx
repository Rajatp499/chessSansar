import React, { useEffect, useMemo, useState, useRef } from "react";
import Engine from "../Engine/engine.js";
import Move from "../components/move.jsx";
import SelectAI from "../components/selectAi.jsx";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

import Timer from "../components/timer.jsx";


export const PlayerVsBot = () => {
  let player_color = 'white';
  const engine = useMemo(() => new Engine(), []);
  const game = useMemo(() => new Chess(), []);

  const [loading, setLoading] = useState(true);
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [botLevel, setBotLevel] = useState(2);
  const [gameFormat, setGameFormat] = useState('rapid');
  const [playerColor, setPlayerColor] = useState('white');
  const [openSelectAI, setOpenSelectAI] = useState(true);

  // timer ---------------------------------------
  const increment = useRef(null);
  const expiryTimestampUser = useRef(null);
  const expiryTimestampBot = useRef(null);
  
  // ai
  const pauseRefUser = useRef(null);
  const resumeRefUser = useRef(null);
  const restartRefUser = useRef(null);
  const startRefUser = useRef(null);
  const incrementRefUser = useRef(null);

  // player
  const pauseRefBot = useRef(null);
  const resumeRefBot = useRef(null);
  const restartRefBot = useRef(null);
  const startRefBot = useRef(null);
  const incrementRefBot = useRef(null);

  const handlePauseUser = (pause) => {
    pauseRefUser.current = pause;
  };

  const handleResumeUser = (resume) => {
    resumeRefUser.current = resume;
  };

  const handleRestartUser = (restart) => {
    restartRefUser.current = restart;
  };

  const handleStartUser = (start) => {
    startRefUser.current = start;
  };

  const handleIncrementUser = (increment) => {
    incrementRefUser.current = increment;
  };

  const handlePauseBot = (pause) => {
    pauseRefBot.current = pause;
  };

  const handleResumeBot = (resume) => {
    resumeRefBot.current = resume;
  };

  const handleRestartBot = (restart) => {
    restartRefBot.current = restart;
  };

  const handleStartBot = (start) => {
    startRefBot.current = start;
  };

  const handleIncrementBot = (increment) => {
    incrementRefBot.current = increment;
  };
  // ---------------------------------------------------------

  function findBestMove() {
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

          // if first move by player then start the clock of player
          if (game.moveNumber() === 1) {
            startRefUser.current();
          }
          
          // if valid move the pause and increment the timer of ai
          incrementRefBot.current(increment.current);
          pauseRefBot.current();

          if (game.isGameOver() || game.isDraw()) {
            pauseRefUser.current();
            pauseRefBot.current();
            alert("AI won the game!!!");
            return false;
          }

          // if game is not ended then resume the timer of player
          resumeRefUser.current();

        } catch (error) {
          console.log("error: ", error);
        }
      }
    });
  }

  function onDrop(sourceSquare, targetSquare, piece) {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? "q"
      });
      if (move === null) return false;
      setGamePosition(game.fen());

      // if first move by player start the timer of bot
      if (game.moveNumber() === 1) {
        startRefBot.current(); 
      }
      // after making valid move pause and increment the timer for player
      pauseRefUser.current();
      incrementRefUser.current(increment.current);

      if (game.isGameOver() || game.isDraw()) {
        pauseRefUser.current();
        pauseRefBot.current();
        alert("Player won the game!!!");
        return false;
      }

      // if game is not ended then resume the timer of bot
      resumeRefBot.current();

      findBestMove();
      return true;
    } catch (e) {
      console.log("error: ", e);
      return false;
    }
  }

  // it is called after Selecting the option for game like bot level, color, etc
  const handleStartGame = ({ format, level, color, time }) => {
    setGameFormat(format);
    setBotLevel(level);
    if (color === 'random') {
      const randomColor = Math.random() < 0.5 ? 'white' : 'black';
      setPlayerColor(randomColor);
      player_color = randomColor;
    } else {
      player_color = color;
      setPlayerColor(color);
    }
    setOpenSelectAI(false);

    const [base, inc] = time.split("+").map(Number);
    console.log("time: ", time, "  base: ", base, "   inc: ", inc);
    
    increment.current = inc;

    const time_in_second = base * 60;
    const newETSbot = new Date();
    newETSbot.setSeconds(newETSbot.getSeconds() + time_in_second);
    expiryTimestampBot.current = newETSbot;
    
    const newETSplayer = new Date();
    newETSplayer.setSeconds(newETSplayer.getSeconds() + time_in_second);
    expiryTimestampUser.current = newETSplayer;

    setLoading(false);
  };

  return (
    <div>
      <div id="game" className={openSelectAI ? "blur-sm" : ""}>
        <div className="p-4 flex justify-evenly h-screen">
          <div className="flex h-fit p-2">
            <Chessboard
              style={{ filter: "blur(10px)" }}
              boardWidth={560}
              boardOrientation={playerColor}
              position={gamePosition}
              onPieceDrop={onDrop}
              customBoardStyle={{
                borderRadius: "5px",
                boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`,
              }}
            />
            <div className="flex flex-col justify-between">
              <div className="p-2">
                <div className="flex">
                  <span className="pl-4">Bot level-{botLevel}</span>
                </div>
                {!loading && (
                  <Timer
                    expiryTimestamp={expiryTimestampBot.current}
                    onTimeUp={() => alert('Time is up! Player won the game!!!')}
                    onPause={handlePauseBot}
                    onResume={handleResumeBot}
                    onRestart={handleRestartBot}
                    onStart={handleStartBot}
                    onIncrement={handleIncrementBot}
                    highlight={game.turn() != player_color.substring(0,1)}
                  />
                )}
              </div>
              <div className="p-2">
                <div className="flex">
                  <span className={game.turn() == playerColor.substring(0, 1) ? "bg-red-500 pl-2" : "pl-2"}>player</span>
                </div>
                {!loading && (
                  <Timer
                    expiryTimestamp={expiryTimestampUser.current}
                    onTimeUp={() => alert('Time is up! AI Won the game!!!')}
                    onPause={handlePauseUser}
                    onResume={handleResumeUser}
                    onRestart={handleRestartUser}
                    onStart={handleStartUser}
                    onIncrement={handleIncrementUser}
                    highlight={game.turn() == player_color.substring(0,1)}
                  />
                )}
              </div>
            </div>
          </div>
          <Move moves={game.history()} onUndo={() => { game.undo(); game.undo(); setGamePosition(game.fen()); }} />
        </div>
      </div>
      {openSelectAI && (
        <SelectAI
          open={openSelectAI}
          onStartGame={handleStartGame}
          onClose={() => {
            setOpenSelectAI(false);
            console.log("player_color: ", player_color, " playerColor: ", playerColor);
            if (player_color == 'black') {
              findBestMove();
            }
          }}
        />
      )}
    </div>
  );
}
export default PlayerVsBot;