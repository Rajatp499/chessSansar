import React from 'react';

export default function PlayerInfo({ player, isCurrentTurn, isDark, image, isMobile = false, playerColor }) {
  return (
    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} w-full transition-all duration-300`}>
      <div className={`flex ${isMobile ? 'flex-row justify-between items-center' : 'flex-col items-center'} gap-2`}>
        <div className="flex items-center gap-2">
          {/* User avatar with color indicator */}
          <div className="relative">
            <img src={image} alt="User" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
            {playerColor && (
              <div 
                className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${
                  isDark ? 'border-gray-700' : 'border-white'
                } ${
                  playerColor === 'w' || playerColor === 'white' 
                    ? 'bg-white' 
                    : 'bg-gray-900'
                }`}
                title={playerColor === 'w' || playerColor === 'white' ? 'White' : 'Black'}
              />
            )}
          </div>
          
          <div>
            <span className="font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
              {player || 'Waiting...'}
            </span>
            {playerColor && (
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Playing as {playerColor === 'w' || playerColor === 'white' ? 'White' : 'Black'}
              </div>
            )}
          </div>
        </div>
        
        {isCurrentTurn && (
          <div className={`px-2 py-1 rounded text-xs sm:text-sm font-bold ${
            isDark ? 'bg-green-700 text-white' : 'bg-green-300 text-green-800'
          }`}>
            TURN
          </div>
        )}
      </div>
    </div>
  );
}