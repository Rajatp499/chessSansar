import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useParams } from "react-router-dom";
import pp from "../assets/profile.gif";


export default function Online() {
  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState([]);
  const [turn, setTurn] = useState(false);
  
  const [user, setUser] = useState("start");
  const [userColor, setUserColor] = useState("");
  const [player1, setPlayer1] = useState("player 1");
  const [player2, setPlayer2] = useState("player 2");
  const { roomid } = useParams();
  const socket = useRef(null);
  let userName = "";

  const updateUserState = (p1, p2, p1Col, p2Col) => {
    if (p1 == userName) {
      setUserColor(p1Col.substr(0,1));
      console.log(`user: ${user}`);
      console.log("userName:",userName)
      console.log(`User Color: ${p1}: ${p1Col}`);
    } else {
      setUserColor(p2Col.substr(0,1));
      console.log(`user: ${user}`);
      console.log("userName:",userName)
      console.log(`User Color: ${p2}: ${p2Col}`);
    }
  }

  const websocketopencallback = () => {
    console.log("WebSocket connection established");
    socket.current.send(JSON.stringify({ action: "join_game" }));
  };

  const websocketmessagecallback = (event) => {
    const message = JSON.parse(event.data);
    const info = message.message.info;

    if (info === "connected") {
      setUser(message.message.player.user);
      userName  =  message.message.player.user;
      console.log(message.message.player.user);
    }

    console.log("Received message:", message);

    // only process messages that are for both players
    const type = message.message.type;
    if (type != "both") {
      return;
    }

    if (info === "joined") {
      updateUserState(
        message.game.player1, message.game.player2, message.game.player1_color, message.game.player2_color
      )
      setPlayer1(message.game.player1);
      setPlayer2(message.game.player2);

      const current_turn = message.game.current_turn;
      console.log("joined, changing turn: username: ", userName);
      setTurn(false);
      if (message.game.player1 == userName && current_turn == 'player1') setTurn(true);
      if (message.game.player2 == userName && current_turn == 'player2') setTurn(true);

      console.log("Turn:", current_turn);
    }

    if (info === "reconnected") {
      updateUserState(
        message.game.player1, message.game.player2, message.game.player1_color, message.game.player2_color
      )
      setPlayer1(message.game.player1);
      setPlayer2(message.game.player2);

      // change the turn state to reflect the current player turn
      const current_turn = message.game.current_turn;
      setTurn(false);
      if (message.game.player1 == userName && current_turn == 'player1') setTurn(true);
      if (message.game.player2 == userName && current_turn == 'player2') setTurn(true);

      setGame(new Chess(message.game.fen));
    }

    if (info === "moved") {

      // change the turn state to reflect the current player turn
      const current_turn = message.game.current_turn;
      setTurn(false);
      if (message.game.player1 == userName && current_turn == 'player1') setTurn(true);
      if (message.game.player2 == userName && current_turn == 'player2') setTurn(true);


      if (message.message.user !== user) {  // move made by opponent
        setGame(new Chess(message.game.fen));
      }
    }

  };

  const websocketclosecallback = () => {
    console.log("WebSocket connection closed");
  };

  const websocketerrorcallback = () => {
    console.error("WebSocket error:", error);
  };

  useEffect(() => {

    const BACKEND_WS_API = import.meta.env.VITE_BACKEND_CHESS_WS_API;
    socket.current = new WebSocket(BACKEND_WS_API + "/chess/" + roomid + "/?token=" + localStorage.getItem("token"));

    socket.current.onopen = websocketopencallback;
    socket.current.onmessage = websocketmessagecallback;
    socket.current.onclose = websocketclosecallback;
    socket.current.onerror = websocketerrorcallback;
  }, []);



  const drop = (sourceSquare, targetSquare) => {
    try {
      if (game.turn() !== userColor) {
        console.log("Not your turn");
        return;
      }
      
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
  
      if (move === null) return;
  
      setGame(new Chess(game.fen()));
      const uci_move = `${move.from}${move.to}${move.promotion ? move.promotion : ""}`;
      socket.current.send(JSON.stringify({ action: "make_move", "move": uci_move }));
    } catch (error) {
      console.error("Error:", error);
    }
  };


  // console.log("timer:",timer)
  return (
    <>
      {/* <h1>Turn: {turn ? 'true' : 'false'}</h1> */}
      <div className="p-4 flex justify-evenly h-screen">
        <div className="flex h-fit p-2">
          {userColor}
          <Chessboard
            boardOrientation={userColor === 'b' ? 'black': 'white'}
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
                <span className={ turn ? "pl-4" : 'pl-4 bg-green-300'}>{player1 == user ? player2: player1}</span>
              </div>
            </div>

            <div className="p-2">
            <div className="flex">
              <img src={pp} alt="User" className="w-10 h-10 rounded-full" />
              <span className={ turn ? "pl-2 bg-green-300" : "pl-2"}>{user}</span>
              </div>
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
          </div>
        </div>
      </div>

      
    </>
  );
}
