import React, { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Link } from "react-router-dom";
import pp from "../assets/profile.gif"
// import Popup from "reactjs-popup";
// import { useNavigate } from "react-router-dom";

const Home = () => {
  const [popUp, setPopUp] = useState(false);

  const user = {
    name: "John Doe",
    profilePic: pp, // Replace with actual user image URL
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center">
    {/* Top Bar with Title & User Profile */}
    <div className="w-full flex justify-between items-center px-10 py-4 bg-white shadow-md">
  <div className="text-4xl">Welcome to ChessSansar</div>
  
  {/* Right Section: User Profile + Buttons */}
  <div className="flex flex-col items-end space-y-2">
    {/* User Profile Section */}
    <div className="flex items-center space-x-3 bg-gray-200 px-4 py-2 rounded-lg shadow-md">
      <img src={user.profilePic} alt="User" className="w-10 h-10 rounded-full" />
      <span className="text-lg font-medium">{user.name}</span>
    </div>

    {/* Login & Signup Buttons */}
    <div className="flex space-x-3">
      <Link to='/login' className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition">
        Login
      </Link>
      <Link to='/signup' className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition">
        Signup
      </Link>
    </div>
  </div>
</div>


    {/* Main Content */}
    <div className="flex flex-col md:flex-row justify-center items-center md:space-x-8 mt-10">
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
  </div>  );
};

export default Home;
