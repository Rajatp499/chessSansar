import React from 'react';
import { useNavigate } from 'react-router-dom';

const createorjoin = () => {
    const navigate = useNavigate();

    const handleCreateGame = () => {
        console.log("Create Game");
        const randomWord = Math.random().toString(36).substring(2, 18);
        navigate(`/online/${randomWord}`);
        console.log(randomWord);
    };

    const handleJoinGame = () => {
        navigate("/join");
    }

    return (
        <div className="flex justify-center items-center h-screen flex-col">
            <button onClick={handleCreateGame} className="m-2 p-3 bg-blue-700 text-white border-none rounded cursor-pointer w-40">
                Create Game
            </button>
            <button onClick={handleJoinGame} className="m-2 p-3 bg-yellow-900 text-white border-none rounded cursor-pointer w-40">
                Join Game
            </button>
        </div>  
    );
};

export default createorjoin;
