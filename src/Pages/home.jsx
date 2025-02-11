import React, { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Link } from "react-router-dom";
// import Popup from "reactjs-popup";
// import { useNavigate } from "react-router-dom";

const Home = () => {
  const [popUp, setPopUp] = useState(false);
  // const navigate = useNavigate();

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="text-4xl text-center mb-10">Welcome to ChessSansar</div>

      <div
        className="flex flex-col md:flex-row justify-center items-center  md:space-x-8"
      >
        <Link to='/engine' className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
          <Chessboard
            boardWidth={300}
            position="start"
            arePiecesDraggable={false}
            customBoardStyle={{ cursor: "pointer" }}
          />
          <div className="text-center text-2xl mt-4">Play with Bot</div>
        </Link>

        <Link to="/online" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
          <Chessboard
            boardWidth={300}
            position="start"
            arePiecesDraggable={false}
            customBoardStyle={{ cursor: "pointer" }}
          />
          <div className="text-center text-2xl mt-4">Play with Friend</div>
        </Link>

        <Link to="/puzzle" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
          <Chessboard
            boardWidth={300}
            position="start"
            arePiecesDraggable={false}
            customBoardStyle={{ cursor: "pointer" }}
          />
          <div className="text-center text-2xl mt-4">Solve Puzzle</div>
        </Link>
      </div>

      <div className="text-center mt-10 text-gray-500">
        Created by Soonya
      </div>

      
    </div>
  );
};

export default Home;
