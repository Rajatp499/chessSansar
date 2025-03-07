import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Link } from "react-router-dom";
import pp from "../assets/profile.gif"
import { useSelector, useDispatch } from "react-redux";
import { setUser, clearUser } from "../Store/Slices/userSlice";
import { toggleTheme } from "../Store/Slices/themeSlice";


const Home = () => {
  const user = useSelector((state) => state.user);
  const isDark = useSelector((state) => state.theme.isDark);
  const dispatch = useDispatch();

  useEffect(() => {
    const URL = import.meta.env.VITE_BACKEND_CHESS_API + "/auth/users/me/";
    fetch(URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("User Data:", data);
        if (data.username) {
          dispatch(setUser({ name: data.username }));
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(clearUser());
    window.location.reload();
  };


  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gray-100'} flex flex-col`}>
      {/* Top Bar with Title & User Profile */}
      <div className={`w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-10 py-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center gap-6">
          <img
            src="/assets/logo.png"
            alt="Logo"
            className="h-14 w-14 sm:h-16 sm:w-16 transform hover:scale-110 transition-transform duration-300 shadow-lg rounded-full"
          />
          <div className={`
              text-3xl sm:text-5xl 
              ${isDark ? 'text-white' : 'text-gray-800'} 
              font-chess mb-4 sm:mb-0 
              font-bold 
              tracking-wider
              hover:text-blue-600
              transition-colors duration-300
              drop-shadow-lg
            `}>
            ChessSansar
          </div>
        </div>

        {/* Right Section: User Profile + Buttons */}
        <div className="flex flex-col items-center sm:items-end space-y-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg shadow ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <div className={`flex items-center space-x-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} px-4 py-2 rounded-lg shadow-md`}>
              <img src={user.profilepic} alt="User" className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border-2 border-gray-500" />
              <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{user.name}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            {localStorage.getItem("token") ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all transform hover:scale-105"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to='/login' className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all transform hover:scale-105">
                  Login
                </Link>
                <Link to='/signup' className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all transform hover:scale-105">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl cursor-pointer">
          {['engine', 'connect', 'puzzle'].map((route, index) => (
            <Link key={route} to={`/${route}`} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl shadow-lg hover:shadow-xl transition-all duration-150 transform hover:scale-105 p-4`}>
              <Chessboard
                boardWidth={300}
                position="start"
                arePiecesDraggable={false}
                customBoardStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  cursor: 'pointer'
                }}
              />
              <div className={`text-center text-2xl mt-4 ${isDark ? 'text-white' : 'text-gray-800'} font-chess cursor-pointer`}>
                {route === 'engine' ? 'Play with Bot' : route === 'connect' ? 'Play with Friend' : 'Solve Puzzle'}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Created by Soonya
      </div>
    </div>
  );
};

export default Home;
