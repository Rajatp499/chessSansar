import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Chessboard } from "react-chessboard";

const CreateOrJoin = () => {
    const navigate = useNavigate();
    const isDark = useSelector((state) => state.theme.isDark);
    
    /****************************
     * Authentication Check
     ****************************/
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', {
                state: { 
                    message: "Please login to play online chess",
                    redirectTo: '/connect'  // Redirect back to this page after login
                }
            });
        }
    }, [navigate]);

    /****************************
     * Navigation Handlers
     ****************************/
    const handleCreateGame = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const randomWord = Math.random().toString(36).substring(2, 18);
        navigate(`/create/${randomWord}`);
    };

    const handleJoinGame = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        navigate("/join");
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 
            ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
            
            {/* Title Section */}
            <h1 className={`text-3xl md:text-4xl font-bold mb-8 
                ${isDark ? 'text-white' : 'text-gray-800'} 
                font-chess tracking-wider text-center`}>
                Play Online Chess
            </h1>

            {/* Chess Board Preview */}
            <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                <Chessboard 
                    boardWidth={Math.min(400, window.innerWidth - 40)}
                    position="start"
                    arePiecesDraggable={false}
                    customBoardStyle={{
                        borderRadius: "8px",
                        boxShadow: isDark 
                            ? "0 4px 6px -1px rgba(255, 255, 255, 0.1)"
                            : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}
                />
            </div>

            {/* Buttons Container */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-4">
                <button 
                    onClick={handleCreateGame}
                    className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105
                        ${isDark 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'} 
                        shadow-lg hover:shadow-xl`}
                >
                    Create Game
                </button>
                
                <button 
                    onClick={handleJoinGame}
                    className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105
                        ${isDark 
                            ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                            : 'bg-amber-500 hover:bg-amber-600 text-white'}
                        shadow-lg hover:shadow-xl`}
                >
                    Join Game
                </button>
            </div>

            {/* Instructions */}
            <div className={`mt-8 text-center max-w-md px-4 
                ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <p className="text-sm">
                    Create a new game and invite friends or join an existing game with a code.
                </p>
            </div>
        </div>
    );
};

export default CreateOrJoin;
