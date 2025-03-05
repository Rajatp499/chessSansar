import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useParams } from "react-router-dom";
import pp from "../assets/profile.gif";

import Move from "../components/move";

import { useSelector } from "react-redux";



export default function Online() {
  const isDark = useSelector((state) => state.theme.isDark);

  const game = useRef(null);
  const [gamePosition, setGamePosition] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  // const [game, setGame] = useState(new Chess());
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
      setUserColor(p1Col.substr(0, 1));
      console.log(`user: ${user}`);
      console.log("userName:", userName)
      console.log(`User Color: ${p1}: ${p1Col}`);
    } else {
      setUserColor(p2Col.substr(0, 1));
      console.log(`user: ${user}`);
      console.log("userName:", userName)
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
      userName = message.message.player.user;
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

      try {
        const r_moves = message.game.moves;
        console.log("received moves: ", r_moves);

        // create new chess and make move made till now
        game.current = new Chess();
        const sortedMoves = r_moves.sort((a, b) => new Date(a.played_at) - new Date(b.played_at));
        sortedMoves.forEach(moveObj => {
          console.log("move obj: ", moveObj);
          game.current.move({
            from: moveObj.move.substring(0, 2),
            to: moveObj.move.substring(2, 4),
            promotion: moveObj.move.substring(4, 5).toLowerCase() || "q"
          });
        });
        // game.current.load(message.game.fen);
        setGamePosition(game.current.fen());
      } catch (e) {
        console.log("error:: reconnected :: ", e)
      }
    }

    if (info === "moved") {

      // change the turn state to reflect the current player turn
      const current_turn = message.game.current_turn;
      setTurn(false);
      if (message.game.player1 == userName && current_turn == 'player1') setTurn(true);
      if (message.game.player2 == userName && current_turn == 'player2') setTurn(true);

      if (message.message.player.user !== userName) {  // move made by opponent
        // setGame(new Chess(message.game.fen));
        const r_move = message.game.move; // moved recieved for online
        console.log("user: ", userName, "   received_user: ", message.message.player.user);

        try {
          const move = game.current.move({
            from: r_move.substring(0, 2),
            to: r_move.substr(2, 4),
            promotion: r_move.substr(4, 5).toLowerCase() ?? "q"
          });
          if (move === null) return false;
          setGamePosition(game.current.fen());
        } catch (e) {
          console.log("error while making opponent move: ", e);
        }
      }
    }

    if (info === 'resigned') {
      console.log('game ended: message: ', message);
    }

    if (info === "invalid") {
      // if move is invalid, undo the move
      try {
        if (game.current) {
          game.current.undo();
          setGamePosition(game.current.fen());
        }
      } catch (e) {
        console.log("error while undoing invalid move: ", e);
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

    game.current = new Chess();

    const BACKEND_WS_API = import.meta.env.VITE_BACKEND_CHESS_WS_API;
    socket.current = new WebSocket(BACKEND_WS_API + "/chess/" + roomid + "/?token=" + localStorage.getItem("token"));

    socket.current.onopen = websocketopencallback;
    socket.current.onmessage = websocketmessagecallback;
    socket.current.onclose = websocketclosecallback;
    socket.current.onerror = websocketerrorcallback;

    return () => {
      if (socket.current)
        socket.current.close();
    }
  }, [roomid]);



  const drop = (sourceSquare, targetSquare, piece) => {
    try {
      if (!game.current) return false;   // game is not initalized
      if (game.current.turn() !== userColor) {
        console.log("Not your turn");
        return;
      }

      const move = game.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1]?.toLowerCase() ?? "q"
      });
      if (move === null) return false;
      setGamePosition(game.current.fen());

      const uci_move = `${move.from}${move.to}${move.promotion ? move.promotion : ""}`;
      console.log("uci_move: ", uci_move);
      socket.current.send(JSON.stringify({ action: "make_move", "move": uci_move }));
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  const handleUndo = () => {
    console.log("Undo Clicked!!");
  };
  const handleRedo = () => {
    console.log("Redo Clicked!!");
  };
  const handlePause = () => {
    console.log("Pause Clicked!!");
  };

  const handleResign = () => {
    console.log("Resign Clicked");
    if (socket.current) {
      socket.current.send(JSON.stringify({ action: "resign_game" }))
    }
  };

  const handleDrawReq = () => {
    console.log("Draw Req clicked");
    if (socket.current) {
      socket.current.send(JSON.stringify({ action: "draw_request" }))
    }
  };

  const handleAbort = () => {
    console.log("Abort clicked");
    if (socket.current) {
      socket.current.send(JSON.stringify({ action: "abort_game" }))
    }
  };

  const handleGoToMove = (index) => {
    console.log("gotomove: index: ", index);
    const step = index === 0 ? 0 : index + 1;
    const gameCopy = new Chess();
    const history = game.current.history();

    for (let i = 0; i < step; i++) {
      gameCopy.move(history[i]);
    }
    setGamePosition(gameCopy.fen());
  }

  const [boardWidth, setBoardWidth] = useState(720);

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const maxWidth = Math.min(screenWidth * 0.5, screenHeight * 0.8);
      setBoardWidth(maxWidth);
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [moveSquares, setMoveSquares] = useState({});

  const getMoveOptions = (square) => {
    const moves = game.current.moves({
      square,
      verbose: true
    });
    if (moves.length === 0) {
      return;
    }

    const newSquares = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background:
          game.current.get(move.to) 
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setMoveSquares(newSquares);
  };

  // Add this at the start of the component
  const [checkSquare, setCheckSquare] = useState('');

  // Update checkSquare whenever game position changes
  useEffect(() => {
    if (game.current) {
      if (game.current.inCheck()) {
        const color = game.current.turn();
        const kingSquare = game.current.board().reduce((acc, row, i) => {
          const j = row.findIndex(piece => piece && piece.type === 'k' && piece.color === color);
          return j >= 0 ? `${String.fromCharCode(97 + j)}${8 - i}` : acc;
        }, '');
        setCheckSquare(kingSquare);
      } else {
        setCheckSquare('');
      }
    }
  }, [gamePosition]);

  const [selectedPiece, setSelectedPiece] = useState(null);

  const handleSquareClick = (square) => {
    if (!game.current || game.current.turn() !== userColor) return;

    if (!selectedPiece) {
      // First click - select the piece if it's the player's piece
      const piece = game.current.get(square);
      if (piece && piece.color === userColor) {
        setSelectedPiece(square);
        getMoveOptions(square);
      }
    } else {
      // Second click - attempt to make the move
      if (square !== selectedPiece) {
        const move = drop(selectedPiece, square, '');
        if (!move) {
          // If move is invalid, just update selected piece if it's a valid piece
          const piece = game.current.get(square);
          if (piece && piece.color === userColor) {
            setSelectedPiece(square);
            getMoveOptions(square);
          } else {
            setSelectedPiece(null);
            setMoveSquares({});
          }
        } else {
          setSelectedPiece(null);
          setMoveSquares({});
        }
      } else {
        // Clicking the same square deselects the piece
        setSelectedPiece(null);
        setMoveSquares({});
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="p-4 flex justify-evenly h-screen">
        <div className="flex h-fit p-2 flex-wrap">
          <div className="flex">
            <Chessboard
              boardOrientation={userColor === 'b' ? 'black' : 'white'}
              boardWidth={boardWidth}
              animationDuration={100}
              position={gamePosition}
              onPieceDrop={drop}
              onSquareClick={handleSquareClick}
              onPieceDragBegin={(piece, square) => getMoveOptions(square)}
              onPieceDragEnd={() => {
                setSelectedPiece(null);
                setMoveSquares({});
              }}
              customSquareStyles={{
                ...moveSquares,
                ...(checkSquare ? {
                  [checkSquare]: {
                    background: 'rgba(255, 0, 0, 0.7)'
                  }
                } : {})
              }}
              customBoardStyle={{
                borderRadius: "5px",
                boxShadow: isDark 
                  ? `0 5px 15px rgba(255, 255, 255, 0.2)`
                  : `0 5px 15px rgba(0, 0, 0, 0.5)`,
              }}
            />
          </div>
          
          {/* Rest of the component remains the same */}
          <div className="flex flex-col justify-between ml-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex flex-col items-center gap-3">
                <img src={pp} alt="User" className="w-10 h-10 rounded-full" />
                <span className={`px-3 py-1 rounded ${turn 
                  ? '' 
                  : isDark 
                    ? 'bg-green-700' 
                    : 'bg-green-300'}`}>
                  {player1 == user ? player2 : player1}
                </span>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex flex-col items-center gap-3">
                <span className={`px-3 py-1 rounded ${turn 
                  ? isDark 
                    ? 'bg-green-700' 
                    : 'bg-green-300' 
                  : ''}`}>
                  {user}
                </span>
                <img src={pp} alt="User" className="w-10 h-10 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {game.current && (
          <Move 
            moves={game.current.history()} 
            onResign={handleResign} 
            onAbort={handleAbort} 
            onDrawReq={handleDrawReq} 
            onGoToMove={handleGoToMove}
            onUndo={handleUndo} 
            onRedo={handleRedo}
            onPause={handlePause}
            isDark={isDark}
          />
        )}
      </div>
    </div>
  );
}