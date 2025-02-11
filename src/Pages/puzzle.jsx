import React from "react";
import { Chessboard } from "react-chessboard";
import { useState } from "react";
import { Chess } from "chess.js";
import fen_puzzles from "../utils/fen_puzzles";

const puzzle = () => {
  function getTurnFromFEN(fen) {
    const turn = fen.split(" ")[1];
    return turn; // The second field contains the turn
  }
  const [index, setIndex] = useState(0);
  const [game, setGame] = useState(new Chess(fen_puzzles[index].fen));
  const [moves, setMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0); //To keep track of the current move
  // const [boardOrientation, setBoardOrientation] = useState(" ")

  const drop = (sourceSquare, targetSquare) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move === null) return;

      // Get the solution moves as an array
      const solutions = fen_puzzles[index].solution.split(" ");

      // console.log(move.san, solutions[currentMoveIndex]);
      if (move.san === solutions[currentMoveIndex]) {
        console.log("✅ Correct Move");
        // Update game state
        setGame(new Chess(game.fen()));
        setMoves([...moves, ...game.history()]);

        const nextMoveIndex = currentMoveIndex + 1;

        if (nextMoveIndex < solutions.length) {
          setCurrentMoveIndex(nextMoveIndex); // Move to the next step

          setTimeout(() => {
            const nextMove = solutions[nextMoveIndex]; // Use the updated index directly
            setCurrentMoveIndex(currentMoveIndex + 2); // Update the current move index
            game.move(nextMove); // Play the next move
            setGame(new Chess(game.fen())); // Update the board
            setMoves([...moves, ...game.history()]); // Update the moves
          }, 500); // 1-second delay for better UX
        } else {
          console.log("🎉 Puzzle Solved!");
          setMoves([]); // Clear the moves

          //Try to load the next puzzle
          // console.log(fen_puzzles.length);
          if (index + 1 < fen_puzzles.length) {
            // Update index asynchronously, but use the updated value immediately after setting it
            setIndex((prevIndex) => {
              const newIndex = prevIndex + 1;
              console.log(newIndex); // This will print the updated index
              const fen = fen_puzzles[newIndex].fen;
              setGame(new Chess(fen)); // Set the new game state
              return newIndex;
            });
          } else {
            console.log("No more puzzles");
          }

          setCurrentMoveIndex(0); // Reset move index for the next puzzle
        }
      } else {
        console.log("❌ Incorrect Move");

        // Reset the puzzle
        setGame(new Chess(fen_puzzles[index].fen));
        setCurrentMoveIndex(0); // Reset move index
        setMoves([]); // Clear the moves
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="p-4 flex justify-evenly h-screen">
        <div className="flex h-fit p-2">
          <Chessboard
            position={game.fen()}
            boardWidth={560}
            onPieceDrop={drop}
            boardStyle={{
              borderRadius: "5px",
              boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`,
            }}
            boardOrientation={getTurnFromFEN(fen_puzzles[index].fen) === 'w'? "white":"black"}
            // boardOrientation="black"
            // draggable={draggable}
          />
        </div>
        <div className="h-[92%] border-black border-2 w-1/3 p-2">
          <h1 className="text-center text-2xl font-bold underline mb-4">
            {getTurnFromFEN(fen_puzzles[index].fen) === "w" ? "white" :"black"} to move
          </h1>
          <div className="h-[80%] scrollbar-hidden overflow-y-scroll">
            {moves.map((move, index) => (
              <div
                key={index}
                className="text-center border-black border-b-2 p-2 w-1/2 m-auto"
              >
                {index + 1}. {move}
              </div>
            ))}
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default puzzle;
