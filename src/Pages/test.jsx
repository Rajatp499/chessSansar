import React, { useState } from "react";
import { Chess } from "chess.js";

const ChessEngine = () => {
  const [game, setGame] = useState(new Chess());

  // Function to handle user input move
  const makeMove = (move) => {
    const newGame = new Chess(game.fen());

    // Try to make the user's move
    const userMove = newGame.move(move);
    if (!userMove) {
      console.log("Invalid Move!");
      return;
    }

    // If the game is not over, make AI move
    if (!newGame.isGameOver()) {
      const possibleMoves = newGame.moves(); // Get all legal moves
      console.log("Possible Moves: ", possibleMoves);
      const aiMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]; // Pick a random move
      newGame.move(aiMove);
    }

    setGame(new Chess(newGame.fen())); // Update game state
  };

  return (
    <div>
      <h2>Enter a move (e.g., e2e4)</h2>
      <input
        type="text"
        placeholder="Enter move"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            makeMove(e.target.value);
            e.target.value = "";
          }
        }}
      />
      <p>Current Position: {game.fen()}</p>
    </div>
  );
};

export default ChessEngine;
