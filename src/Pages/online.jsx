import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import Popup from "reactjs-popup";
import { Chessboard } from "react-chessboard";
import { useTimer } from "react-timer-hook";
import Clock from "../components/clock";
import { useParams, useLocation } from "react-router-dom";
import pp from "../assets/profile.gif";
import { useSelector } from "react-redux";





export default function Online() {
  const [game, setGame] = useState(new Chess());
  const [popUp, setPopUp] = useState(true);
  const [moves, setMoves] = useState([]);
  
  const [selectedTime, setSelectedTime] = useState("50+2"); // in seconds
  
  const [player1, setPlayer1] = useState("player 1");
  const [player2, setPlayer2] = useState("player 2");
  
  const time_b = new Date();
  const time_w = new Date();
  
  const [increment, setIncrement] = useState(0);
  
  const { roomid } = useParams();
  const socket = useRef(null);
  
  const ab = useSelector((state) => state.user);
  console.log("ab",ab);



  const location = useLocation();
  useEffect(() => {

      //to get the payload from join.jsx(to disable timer popup on joining)
  const isActive = location.state?.isActive || false;
  isActive ? setPopUp(false) : setPopUp(true);
  // console.log("isActive",isActive);

    const BACKEND_WS_API = import.meta.env.VITE_BACKEND_CHESS_WS_API;
    socket.current = new WebSocket(BACKEND_WS_API + "/chess/" + roomid + "/?token=" + localStorage.getItem("token"));

    socket.current.onopen = () => {
      console.log("WebSocket connection established");
      socket.current.send(JSON.stringify({ action: "join_game" }));
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.message === "Game Created") {
        if (message.username != null) {
          setPlayer1(message.username);
        }
      }
      if (message.message === "Joined game" || message.message === "reconnected") {
        setPopUp(false);
        setPlayer1(message.game.player1);
        setPlayer2(message.game.player2);
        console.log(message)

        // console.log(message.game.player1)
        let fen = message.game.fen;
        if (fen) {
          setGame(new Chess(fen));
          // setMoves([...moves, ...game.history()]); // Update the moves

        } else {
          console.error("Invalid FEN string received:", fen);
        }
      }
      if (message.message === "move") {
        try {
          const move = message.game.move;
          console.log("recieved move:", move);
          game.move(move); // Play the next move
          setGame(new Chess(game.fen())); // Update the board
          setMoves([...moves, ...game.history()]); // Update the moves
          console.log("Moves:", moves);
        } catch (e) {
          console.log(e);
        }
      }
      console.log("Received message:", message);
      
      
      // Handle incoming messages
    };

    socket.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    console.log("useffect Socket:", socket);
  }, []);

  useEffect(() => {
    const [base, inc] = selectedTime.split("+").map(Number);
    setIncrement(inc);

    time_w.setSeconds(time_w.getSeconds() + base * 60);
    time_b.setSeconds(time_b.getSeconds() + base * 60);

    restart_b(time_b, false); // Restart Black's timer
    restart_w(time_w, false); // Restart White's timer
  }, [selectedTime]);

  const {
    seconds: seconds_b,
    minutes: minutes_b,
    isRunning: isRunning_b,
    start: start_b,
    pause: pause_b,
    resume: resume_b,
    restart: restart_b,
  } = useTimer({
    expiryTimestamp: time_b,
    onExpire: () => alert("White Wins on Time"),
    autoStart: false,
  });

  const {
    seconds: seconds_w,
    minutes: minutes_w,
    isRunning: isRunning_w,
    start: start_w,
    pause: pause_w,
    resume: resume_w,
    restart: restart_w,
  } = useTimer({
    expiryTimestamp: time_w,
    onExpire: () => alert("Black Wins on Time"),
    autoStart: false,
  });

  const handleCreateGame = () => {
    const action = "create_game";
    const [base, increment] = selectedTime.split("+").map(Number);
    if (socket.current != null) {
      socket.current.send(JSON.stringify({ action, base, increment }));
    }
  }

  const drop = (sourceSquare, targetSquare) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      // console.log(message)
      if (move === null) return;
      //For increment  and pause timer
      if (game.turn() === "b") {
        const white_inc_timer = minutes_w * 60 + seconds_w + increment;
        time_w.setSeconds(time_w.getSeconds() + white_inc_timer);
        restart_w(time_w, false);
        start_b();
      } else {
        const black_inc_timer = minutes_b * 60 + seconds_b + increment;
        time_b.setSeconds(time_b.getSeconds() + black_inc_timer);
        restart_b(time_b, false);
        start_w();
      }

      if (game.isCheckmate()) {
        alert(
          "Checkmate " + (game.turn() === "w" ? "Black" : "White") + " wins"
        );
      } else if (game.isStalemate()) alert("Stalemate");
      else if (game.isThreefoldRepetition()) alert("Threefold Repetition");
      else if (game.isDraw()) alert("Draw");
      else if (game.inCheck()) alert("Check");

      const uci_move = `${move.from}${move.to}`;
      console.log("UCI Move:", uci_move);
      socket.current.send(JSON.stringify({ action: "make_move", "move": uci_move }));
      setGame(new Chess(game.fen()));
      setMoves([...moves, ...game.history()]);
    } catch (e) {
      console.log(e);
    }
  };

  const restart_board = () => {
    setGame(new Chess());
    setMoves([]);

    const newTimeB = new Date();
    const newTimeW = new Date();

    const [base, increment] = selectedTime.split("+").map(Number);
    newTimeB.setSeconds(newTimeB.getSeconds() + base * 60);
    newTimeW.setSeconds(newTimeW.getSeconds() + base * 60);

    restart_b(newTimeB, false); // Restart Black's timer
    restart_w(newTimeW, false); // Restart White's timer
  };

  // console.log("timer:",timer)
  return (
    <>
      <div className="p-4 flex justify-evenly h-screen">
        <div className="flex h-fit p-2">
          <Chessboard
            style={{ filter: "blur(10px)" }}
            // id="standard"
            boardWidth={560}
            position={game.fen()}
            onPieceDrop={drop}
            customBoardStyle={{
              borderRadius: "5px",
              boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`,

            }}
          />
          <div className="flex flex-col justify-between">
            <div className="p-2">
              <div className="flex">
              <img src={pp} alt="User" className="w-10 h-10 rounded-full" />
                <span className="pl-4">{player2}</span>
              </div>
              <Clock
                expiryTimestamp={time_b}
                minutes={minutes_b}
                seconds={seconds_b}
                isRunning={isRunning_b}
                start={start_b}
                pause={pause_b}
                resume={resume_b}
                restart={restart_b}
              />
            </div>

            <div className="p-2">
            <div className="flex">
              <img src={pp} alt="User" className="w-10 h-10 rounded-full" />
                <span className="pl-2">{player1}</span>
              </div>
              <Clock
                expiryTimestamp={time_w}
                minutes={minutes_w}
                seconds={seconds_w}
                isRunning={isRunning_w}
                start={start_w}
                pause={pause_w}
                resume={resume_w}
                restart={restart_w}
              />
            </div>
          </div>
        </div>
        <div className="h-[92%] border-black border-2 w-1/3 p-2">
          <h1 className="text-center text-2xl font-bold underline mb-4">
            Moves
          </h1>
          <div className="h-[80%] scrollbar-hidden overflow-y-scroll">
            {moves.map((move, index) => {
              // Only process every two moves together (one for White, one for Black)
              if (index % 2 === 0) {
                return (
                  <div
                    key={index}
                    className="text-center border-black border-b-2 p-2 w-1/2 m-auto flex justify-between"
                  >
                    <span>{index / 2 + 1}. {moves[index]}</span>
                    <span>{moves[index + 1] || ""}</span>
                  </div>
                );
              }
              return null; // Skip odd indexes since they're handled with the previous one
            })}

          </div>
          <div>
            <button
              className="bg-blue-500 text-white p-2 rounded-md w-full mt-4"
              onClick={restart_board}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <Popup open={popUp} closeOnDocumentClick={false}>
        <div className="backdrop-blur-sm bg-white/30 h-[100vh] w-[100vw] text-white flex justify-center items-center p-4 rounded-md">
          <div className="p-4 shadow-2xl bg-slate-900 rounded-xl h-[70vh] w-[40vw] flex flex-col justify-center items-center space-y-6 ">
            <h2 className="text-xl text-white font-bold">Select Chess Timer</h2>

            <div className="w-full flex flex-col space-y-4">
              <div className="flex flex-col items-center">
                <h3 className="text-white text-lg font-semibold">Bullet</h3>
                <div className="flex space-x-4">
                  {["1+10", "1+5", "2+5"].map((time) => (
                    <button
                      key={time}
                      className={`px-4 py-2 rounded-lg ${selectedTime === time ? "bg-blue-500" : "bg-gray-700"
                        } text-white`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <h3 className="text-white text-lg font-semibold">Blitz</h3>
                <div className="flex space-x-4">
                  {["3+2", "5+0", "5+3", "5+5"].map((time) => (
                    <button
                      key={time}
                      className={`px-4 py-2 rounded-lg ${selectedTime === time ? "bg-blue-500" : "bg-gray-700"
                        } text-white`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <h3 className="text-white text-lg font-semibold">Rapid</h3>
                <div className="flex space-x-4">
                  {["10+0", "10+5", "15+10", "30+0"].map((time) => (
                    <button
                      key={time}
                      className={`px-4 py-2 rounded-lg ${selectedTime === time ? "bg-blue-500" : "bg-gray-700"
                        } text-white`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-lg mt-4"
              onClick={() => {
                setPopUp(false);
                handleCreateGame();
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
}
