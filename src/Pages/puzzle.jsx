import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useSelector } from "react-redux";
import fen_puzzles from "../utils/fen_puzzles";
import { FaChevronRight, FaTrophy, FaLightbulb, FaRedo, FaArrowRight } from "react-icons/fa";
import useWindowDimensions from "../hooks/useWindowDimensions";

// Create a hook file if it doesn't exist
const useWindowDimensionsHook = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const PuzzlePage = () => {
  const isDark = useSelector((state) => state.theme?.isDark) || false;
  const [puzzles, setPuzzles] = useState(fen_puzzles);
  const [index, setIndex] = useState(0);
  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [wrongMove, setWrongMove] = useState(null);
  const [correctMove, setCorrectMove] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [customSquareStyles, setCustomSquareStyles] = useState({});
  const [moveHighlightStyle, setMoveHighlightStyle] = useState({});
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [legalMoves, setLegalMoves] = useState({});
  const [moveInProgress, setMoveInProgress] = useState(false);
  
  // Get window dimensions for responsive board
  const { width, height } = useWindowDimensionsHook();
  
  // Calculate board width based on screen size
  const boardWidth = useMemo(() => {
    const maxWidth = (height * 0.8);
    
    if (width < 480) return Math.min(340, width - 40); // Small mobile
    if (width < 768) return Math.min(450, width * 0.85); // Mobile
    if (width < 1024) return Math.min(500, width * 0.5); // Tablet
    return Math.min(1024, maxWidth); // Desktop
  }, [width, height]);

  // Initialize the puzzle
  useEffect(() => {
    if (puzzles.length > 0) {
      const newGame = new Chess(puzzles[index].fen);
      setGame(newGame);
      // Set the orientation based on whose turn it is in the puzzle
      const orientation = newGame.turn() === 'w' ? 'white' : 'black';
      setBoardOrientation(orientation);
      
      // Reset all state variables
      setMoves([]);
      setCurrentMoveIndex(0);
      setShowSolution(false);
      setWrongMove(null);
      setCorrectMove(null);
      setIsSolved(false);
      setCustomSquareStyles({});
      setMoveHighlightStyle({});
      setSelectedPiece(null);
      setLegalMoves({});
      setMoveInProgress(false);
    }
  }, [index, puzzles]);

  // Highlight the correct move when "Show Solution" is clicked
  useEffect(() => {
    if (showSolution && puzzles.length > 0) {
      const solutions = puzzles[index].solution.split(" ");
      const firstMove = solutions[0];
      
      // Parse the algebraic notation to get from/to squares
      try {
        const tempGame = new Chess(puzzles[index].fen);
        const moveObj = tempGame.move(firstMove);
        
        if (moveObj) {
          const from = moveObj.from;
          const to = moveObj.to;
          
          // Create a style for the correct move
          setCorrectMove({ from, to });
          setCustomSquareStyles({
            [from]: { 
              backgroundColor: isDark 
                ? 'rgba(34, 197, 94, 0.4)' // Green for dark mode
                : 'rgba(34, 197, 94, 0.25)', // Lighter green for light mode
              boxShadow: isDark 
                ? 'inset 0 0 0 1px rgba(34, 197, 94, 0.8)' // Green border for dark mode
                : 'inset 0 0 0 1px rgba(34, 197, 94, 0.6)', // Green border for light mode
              animation: 'pulse 1.5s infinite'
            },
            [to]: { 
              backgroundColor: isDark 
                ? 'rgba(34, 197, 94, 0.4)' // Green for dark mode
                : 'rgba(34, 197, 94, 0.25)', // Lighter green for light mode
              boxShadow: isDark 
                ? 'inset 0 0 0 1px rgba(34, 197, 94, 0.8)' // Green border for dark mode
                : 'inset 0 0 0 1px rgba(34, 197, 94, 0.6)', // Green border for light mode
              animation: 'pulse 1.5s infinite'
            }
          });
        }
      } catch (error) {
        console.error("Error parsing solution move:", error);
      }
    }
  }, [showSolution, puzzles, index, isDark]);

  // Function to get legal moves for a square
  const getLegalMovesForSquare = useCallback((square) => {
    const legalMovesMap = {};
    
    try {
      // Get all legal moves for the piece at this square
      const moves = game.moves({
        square: square,
        verbose: true
      });
      
      // Add visual indicators for each legal move
      moves.forEach(move => {
        legalMovesMap[move.to] = {
          background: isDark 
            ? 'radial-gradient(circle, rgba(38, 38, 38, 0.2) 85%, rgba(147, 197, 253, 0.7) 85%)' // Dark blue for dark mode
            : 'radial-gradient(circle, rgba(238,174,202,0.3) 25%, rgba(148,187,233,0.4) 85%)', // Lighter blue for light mode
          borderRadius: '50%',
          cursor: 'pointer'
        };
        
        // If there's a capture possible, highlight it differently
        if (move.captured) {
          legalMovesMap[move.to] = {
            background: isDark 
              ? 'radial-gradient(circle, rgba(38, 38, 38, 0.2) 85%, rgba(248, 113, 113, 0.7) 85%)' // Red for dark mode
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 85%, rgba(239, 68, 68, 0.6) 85%)', // Red for light mode
            borderRadius: '50%',
            cursor: 'pointer'
          };
        }
      });
      
      // Highlight the selected piece
      legalMovesMap[square] = {
        backgroundColor: isDark 
          ? 'rgba(59, 130, 246, 0.3)' // Blue with transparency for dark mode
          : 'rgba(59, 130, 246, 0.2)', // Lighter blue for light mode
        boxShadow: isDark 
          ? 'inset 0 0 0 2px #3b82f6' // Blue border for dark mode
          : 'inset 0 0 0 2px #3b82f6', // Same blue border for light mode
        borderRadius: '8px'
      };
      
      return legalMovesMap;
    } catch (error) {
      console.error("Error getting legal moves:", error);
      return {};
    }
  }, [game, isDark]);

  // Handle square click to either select a piece or make a move
  const onSquareClick = useCallback((square) => {
    // Don't allow actions during animations or when puzzle is solved
    if (isSolved || moveInProgress) return;
    
    // If a piece is already selected
    if (selectedPiece) {
      // Check if clicked square is a valid move destination
      if (legalMoves[square]) {
        // Execute the move
        makeMove(selectedPiece, square);
      } else {
        // Clicked on an invalid square, check if it's a new piece selection
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          // New piece selection
          setSelectedPiece(square);
          setLegalMoves(getLegalMovesForSquare(square));
        } else {
          // Clear selection
          setSelectedPiece(null);
          setLegalMoves({});
        }
      }
    } else {
      // No piece selected yet, check if clicking on a valid piece
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedPiece(square);
        setLegalMoves(getLegalMovesForSquare(square));
      }
    }
  }, [game, selectedPiece, legalMoves, getLegalMovesForSquare, isSolved, moveInProgress]);

  // Handle piece drag begin
  const onPieceDragBegin = useCallback((piece, square) => {
    // Don't show legal moves when the puzzle is solved or move is in progress
    if (isSolved || moveInProgress) return;
    
    const pieceColor = piece[0] === 'w' ? 'w' : 'b';
    
    // Only show legal moves for pieces of the current turn
    if (pieceColor === game.turn()) {
      setSelectedPiece(square);
      setLegalMoves(getLegalMovesForSquare(square));
    }
  }, [game, getLegalMovesForSquare, isSolved, moveInProgress]);

  // Clear selections when drag ends
  const onPieceDragEnd = useCallback(() => {
    setSelectedPiece(null);
    setLegalMoves({});
  }, []);

  // Execute a move with either drag or click
  const makeMove = useCallback((sourceSquare, targetSquare) => {
    try {
      // Set move in progress to prevent multiple moves
      setMoveInProgress(true);
      
      // Clear previous highlights and selections
      setCustomSquareStyles({});
      setWrongMove(null);
      setSelectedPiece(null);
      setLegalMoves({});
      
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move === null) {
        setMoveInProgress(false);
        return false;
      }

      const solutions = puzzles[index].solution.split(" ");
      const expectedMove = solutions[currentMoveIndex];

      // Check if the move matches the expected solution
      if (move.san === expectedMove) {
        // Highlight the correct move
        setMoveHighlightStyle({
          [sourceSquare]: { 
            backgroundColor: isDark 
              ? 'rgba(34, 197, 94, 0.4)' // Green for dark mode
              : 'rgba(34, 197, 94, 0.25)', // Lighter green for light mode
            boxShadow: isDark 
              ? 'inset 0 0 0 1px rgba(34, 197, 94, 0.8)' // Green border for dark mode
              : 'inset 0 0 0 1px rgba(34, 197, 94, 0.6)' // Green border for light mode
          },
          [targetSquare]: { 
            backgroundColor: isDark 
              ? 'rgba(34, 197, 94, 0.4)' // Green for dark mode
              : 'rgba(34, 197, 94, 0.25)', // Lighter green for light mode
            boxShadow: isDark 
              ? 'inset 0 0 0 1px rgba(34, 197, 94, 0.8)' // Green border for dark mode
              : 'inset 0 0 0 1px rgba(34, 197, 94, 0.6)' // Green border for light mode
          }
        });
        
        // Create a new game instance with the updated position
        const updatedGame = new Chess(game.fen());
        setGame(updatedGame);
        setMoves([...moves, move.san]);

        const nextMoveIndex = currentMoveIndex + 1;

        if (nextMoveIndex < solutions.length) {
          // Bot's turn to make a move
          setCurrentMoveIndex(nextMoveIndex);
          setTimeout(() => {
            const nextMove = solutions[nextMoveIndex];
            
            try {
              const botMoveObj = updatedGame.move(nextMove);
              if (botMoveObj) {
                // Highlight the bot's move
                setMoveHighlightStyle({
                  [botMoveObj.from]: { 
                    backgroundColor: isDark 
                      ? 'rgba(59, 130, 246, 0.3)' // Blue for dark mode
                      : 'rgba(59, 130, 246, 0.2)', // Lighter blue for light mode
                    boxShadow: isDark 
                      ? 'inset 0 0 0 1px rgba(59, 130, 246, 0.8)' // Blue border for dark mode
                      : 'inset 0 0 0 1px rgba(59, 130, 246, 0.6)' // Blue border for light mode
                  },
                  [botMoveObj.to]: { 
                    backgroundColor: isDark 
                      ? 'rgba(59, 130, 246, 0.3)' // Blue for dark mode
                      : 'rgba(59, 130, 246, 0.2)', // Lighter blue for light mode
                    boxShadow: isDark 
                      ? 'inset 0 0 0 1px rgba(59, 130, 246, 0.8)' // Blue border for dark mode
                      : 'inset 0 0 0 1px rgba(59, 130, 246, 0.6)' // Blue border for light mode
                  }
                });
                
                setGame(new Chess(updatedGame.fen()));
                setMoves(prevMoves => [...prevMoves, botMoveObj.san]);
                setCurrentMoveIndex(nextMoveIndex + 1);
              }
            } catch (error) {
              console.error("Bot move error:", error);
            } finally {
              setMoveInProgress(false);
            }
          }, 700);
        } else {
          // Puzzle solved - highlight next puzzle button instead of showing alert
          setIsSolved(true);
          setMoveInProgress(false);
        }
        return true;
      } else {
        // Incorrect move - highlight in red and revert
        setWrongMove({ from: sourceSquare, to: targetSquare });
        setCustomSquareStyles({
          [sourceSquare]: { 
            backgroundColor: isDark 
              ? 'rgba(239, 68, 68, 0.4)' // Red for dark mode 
              : 'rgba(239, 68, 68, 0.25)', // Lighter red for light mode
            boxShadow: isDark 
              ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.8)' // Red border for dark mode
              : 'inset 0 0 0 1px rgba(239, 68, 68, 0.6)' // Red border for light mode
          },
          [targetSquare]: { 
            backgroundColor: isDark 
              ? 'rgba(239, 68, 68, 0.4)' // Red for dark mode 
              : 'rgba(239, 68, 68, 0.25)', // Lighter red for light mode
            boxShadow: isDark 
              ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.8)' // Red border for dark mode
              : 'inset 0 0 0 1px rgba(239, 68, 68, 0.6)' // Red border for light mode
          }
        });
        
        // Revert the move after a short delay, but keep the same board orientation
        setTimeout(() => {
          // Completely reset the game to the initial puzzle position
          const newGame = new Chess(puzzles[index].fen);
          setGame(newGame);
          setCustomSquareStyles({});
          setWrongMove(null);
          setMoves([]);
          setCurrentMoveIndex(0); // Reset to beginning of solution
          setMoveInProgress(false);
        }, 1000);
        
        return true;
      }
    } catch (error) {
      console.error(error);
      setMoveInProgress(false);
      return false;
    }
  }, [game, puzzles, index, currentMoveIndex, moves, isDark]);

  // Handle piece drop (drag and drop)
  const drop = useCallback((sourceSquare, targetSquare) => {
    return makeMove(sourceSquare, targetSquare);
  }, [makeMove]);

  // Handle "Show Solution" button click
  const handleShowSolution = useCallback(() => {
    setShowSolution(true);
  }, []);

  // Handle "Next Puzzle" button click
  const handleNextPuzzle = useCallback(() => {
    if (index + 1 < puzzles.length) {
      setIndex(index + 1);
    } else {
      // Just display a message in the UI instead of an alert
      setIsSolved(true);
    }
  }, [index, puzzles.length]);

  // Handle "Reset Puzzle" button click
  const handleRestartPuzzle = useCallback(() => {
    const newGame = new Chess(puzzles[index].fen);
    setGame(newGame);
    setMoves([]);
    setCurrentMoveIndex(0);
    setShowSolution(false);
    setWrongMove(null);
    setCorrectMove(null);
    setIsSolved(false);
    setCustomSquareStyles({});
    setMoveHighlightStyle({});
    setSelectedPiece(null);
    setLegalMoves({});
    setMoveInProgress(false);
  }, [index, puzzles]);

  // Get difficulty rating color
  const getDifficultyColor = useCallback((id) => {
    const colors = ["gray", "green", "blue", "purple", "orange", "red"];
    return colors[id % colors.length]; // Cycle through colors based on puzzle ID
  }, []);

  // Get current status message
  const getStatusMessage = useCallback(() => {
    if (isSolved) return "Puzzle solved!";
    if (wrongMove) return "Incorrect move. Try again.";
    if (showSolution) return "Here's the solution.";
    return "Find the best move!";
  }, [isSolved, wrongMove, showSolution]);

  // Check if this is the last puzzle
  const isLastPuzzle = index === puzzles.length - 1;

  // Combine all square styles: custom, move highlight, and legal moves
  const combinedSquareStyles = {
    ...customSquareStyles,
    ...moveHighlightStyle,
    ...legalMoves
  };

  return (
    <div className={`min-h-screen ${isDark 
      ? 'bg-gray-900 text-white' 
      : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto p-2 sm:p-4">
        {/* Puzzle header */}
        <div className={`mb-3 sm:mb-6 p-3 sm:p-4 rounded-lg ${
          isDark 
            ? 'bg-gray-800 shadow-md shadow-black/30' 
            : 'bg-white shadow-md shadow-gray-300/50'}`}>
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold">Chess Puzzle</h1>
            <div className={`px-2 sm:px-3 py-1 rounded-full text-white text-sm sm:text-base font-semibold bg-${getDifficultyColor(puzzles[index].id)}-500 shadow-sm`}>
              Puzzle #{puzzles[index].id}
            </div>
          </div>
          
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className={`px-2 py-1 rounded ${
              isDark 
                ? 'bg-gray-700 shadow-inner' 
                : 'bg-blue-50 shadow-sm'} flex items-center`}>
              {boardOrientation === "white" ? 
                <span className="w-3 h-3 rounded-full bg-white border border-gray-400 mr-2"></span> : 
                <span className="w-3 h-3 rounded-full bg-black mr-2"></span>
              }
              <span className="text-sm sm:text-base">Playing as {boardOrientation}</span>
            </div>
            
            <div className={`ml-auto sm:ml-4 ${
              isSolved 
                ? 'text-green-500' 
                : wrongMove 
                  ? 'text-red-500' 
                  : isDark ? 'text-blue-400' : 'text-blue-600'
              } text-sm sm:text-base font-medium`}>
              {getStatusMessage()}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Chess board */}
          <div className={`flex-1 ${
            isDark 
              ? 'bg-gray-800 shadow-lg shadow-black/30' 
              : 'bg-white shadow-lg shadow-gray-200/70'
            } p-2 sm:p-4 rounded-lg mx-auto border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <Chessboard
              position={game.fen()}
              boardWidth={boardWidth}
              onPieceDrop={drop}
              onSquareClick={onSquareClick}
              onPieceDragBegin={onPieceDragBegin}
              onPieceDragEnd={onPieceDragEnd}
              customSquareStyles={combinedSquareStyles}
              boardStyle={{
                borderRadius: "5px",
                boxShadow: isDark
                  ? `0 4px 12px rgba(0, 0, 0, 0.4)`
                  : `0 4px 12px rgba(0, 0, 0, 0.1)`,
              }}
              customDarkSquareStyle={isDark 
                ? { backgroundColor: '#475569' } // slate-600
                : { backgroundColor: '#b58863' } // standard brown
              }
              customLightSquareStyle={isDark 
                ? { backgroundColor: '#64748b' } // slate-500
                : { backgroundColor: '#f0d9b5' } // standard light brown
              }
              boardOrientation={boardOrientation}
              animationDuration={300}
            />
          </div>
          
          {/* Sidebar */}
          <div className={`w-full lg:w-1/3 ${
            isDark 
              ? 'bg-gray-800 shadow-lg shadow-black/30' 
              : 'bg-white shadow-md shadow-gray-200/70'
            } rounded-lg p-3 sm:p-4 flex flex-col border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
            {/* Move history */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 flex items-center">
                <FaChevronRight className={`mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} /> 
                Moves
              </h2>
              <div className={`h-48 sm:h-64 overflow-y-auto p-2 rounded-lg ${
                isDark 
                  ? 'bg-gray-700 shadow-inner' 
                  : 'bg-gray-50 shadow-inner'
                }`}>
                {moves.length > 0 ? (
                  <div className="space-y-1">
                    {moves.map((move, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2 rounded flex items-center ${
                          idx % 2 === 0 
                            ? isDark ? 'bg-gray-800' : 'bg-white' 
                            : ''
                        }`}
                      >
                        <span className={`w-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {Math.floor(idx/2) + 1}.
                        </span>
                        <span className={`flex-1 ${
                          isDark 
                            ? idx % 2 === 0 ? 'text-white' : 'text-yellow-400' 
                            : idx % 2 === 0 ? 'text-gray-800' : 'text-amber-600'
                          }`}>
                          {move}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center p-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Make your first move to start
                  </div>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="space-y-3">
              <button 
                onClick={handleShowSolution} 
                className={`w-full flex items-center justify-center p-2 sm:p-3 rounded-lg ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/30' 
                    : 'bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20'
                } text-white transition-colors ${(showSolution || isSolved) && 'opacity-50 cursor-not-allowed'}`}
                disabled={showSolution || isSolved || moveInProgress}
              >
                <FaLightbulb className="mr-2" />
                Show Solution
              </button>
              
              <button 
                onClick={handleRestartPuzzle} 
                className={`w-full flex items-center justify-center p-2 sm:p-3 rounded-lg ${
                  isDark 
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-900/30' 
                    : 'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20'
                } text-white transition-colors ${moveInProgress && 'opacity-50 cursor-not-allowed'}`}
                disabled={moveInProgress}
              >
                <FaRedo className="mr-2" />
                Reset Puzzle
              </button>
              
              <button 
                onClick={handleNextPuzzle} 
                className={`w-full flex items-center justify-center p-2 sm:p-3 rounded-lg 
                  ${isSolved ? 'animate-pulse' : ''}
                  ${isDark 
                    ? isSolved 
                      ? 'bg-green-500 hover:bg-green-600 shadow-md shadow-green-900/30' 
                      : 'bg-green-600 hover:bg-green-700 shadow-md shadow-green-900/20' 
                    : isSolved 
                      ? 'bg-green-500 hover:bg-green-600 shadow-md shadow-green-500/30' 
                      : 'bg-green-600 hover:bg-green-700 shadow-md shadow-green-500/20'
                  } 
                  text-white transition-colors relative ${moveInProgress && 'opacity-50 cursor-not-allowed'}`}
                disabled={moveInProgress}
              >
                <FaArrowRight className="mr-2" />
                {isLastPuzzle && isSolved ? 'All Puzzles Completed!' : 'Next Puzzle'}
                {isSolved && !isLastPuzzle && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </span>
                )}
              </button>
            </div>
            
            {/* Success message when puzzle is solved */}
            {isSolved && (
              <div className={`mt-4 sm:mt-6 p-3 rounded-lg ${
                isDark 
                  ? 'bg-green-800/30 border-l-4 border-green-500' 
                  : 'bg-green-50 border-l-4 border-green-500'
                }`}>
                <h3 className={`font-semibold mb-1 flex items-center ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  <FaTrophy className="mr-2" /> Success!
                </h3>
                <p className={`${
                  isDark ? 'text-green-300' : 'text-green-700'
                } text-sm sm:text-base`}>
                  {isLastPuzzle ? 
                    "Congratulations! You've completed all puzzles." : 
                    "Great job! Click 'Next Puzzle' to continue."}
                </p>
              </div>
            )}
            
            {/* Puzzle info */}
            {showSolution && (
              <div className={`mt-4 sm:mt-6 p-3 rounded-lg ${
                isDark 
                  ? 'bg-blue-900/20 border border-blue-800/30' 
                  : 'bg-blue-50 border border-blue-100'
                }`}>
                <h3 className={`font-semibold mb-2 flex items-center ${
                  isDark ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  <FaTrophy className="mr-2 text-yellow-500" /> Solution
                </h3>
                <p className={`text-base sm:text-lg font-chess ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{puzzles[index].solution}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzlePage;

