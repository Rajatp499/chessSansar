import React from 'react';

export default function PlayerInfo({ player, isCurrentTurn, isDark, image }) {
  return (
    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="flex flex-col items-center gap-3">
        <img src={image} alt="User" className="w-10 h-10 rounded-full" />
        <span className={`px-3 py-1 rounded ${isCurrentTurn 
          ? isDark 
            ? 'bg-green-700' 
            : 'bg-green-300' 
          : ''}`}>
          {player}
        </span>
      </div>
    </div>
  );
}