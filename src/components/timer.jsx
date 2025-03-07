import React, { useState, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';

/**
 * Timer Component
 * 
 * A chess clock timer component with theme support and visual indicators
 * 
 * @param {Date} expiryTimestamp - When the timer should expire
 * @param {Function} onTimeUp - Callback when timer reaches zero
 * @param {Function} onPause - Callback for pause function
 * @param {Function} onResume - Callback for resume function
 * @param {Function} onRestart - Callback for restart function
 * @param {Function} onStart - Callback for start function
 * @param {Function} onIncrement - Callback for increment function
 * @param {boolean} highlight - Whether to highlight this timer as active
 * @param {boolean} isDark - Whether dark mode is enabled
 */
export default function Timer({ 
  expiryTimestamp, 
  onTimeUp, 
  onPause, 
  onResume, 
  onRestart, 
  onStart, 
  onIncrement, 
  highlight = false, 
  isDark = false 
}) {
  // Track whether to always show seconds
  const [alwaysShowSeconds, setAlwaysShowSeconds] = useState(true);
  
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      console.warn('Time is up');
      if (onTimeUp) onTimeUp();
    },
    autoStart: false,
  });

  // Expose control functions to parent component
  useEffect(() => {
    if (onPause) onPause(pause);
    if (onResume) onResume(resume);
    if (onRestart) onRestart(restart);
    if (onStart) onStart(start);
    if (onIncrement) onIncrement((secondsToAdd) => {
      console.log("total time remaining: ", totalSeconds, "   seconds to add: ", secondsToAdd);
      const newT = new Date();
      newT.setSeconds(newT.getSeconds() + totalSeconds + secondsToAdd);
      restart(newT);
    });
  }, [onPause, onResume, onRestart, onStart, onIncrement, pause, resume, restart, start, totalSeconds]);

  // Format display values
  const displayHours = hours > 0 ? `${hours}:` : '';
  const displayMinutes = minutes < 10 && hours > 0 ? `0${minutes}` : minutes.toString();
  const displaySeconds = seconds < 10 ? `0${seconds}` : seconds.toString();
  
  // Determine when to show seconds based on remaining time
  const showMilliseconds = totalSeconds < 10;
  const showSeconds = alwaysShowSeconds || totalSeconds < 60;
  
  // Theme styles
  const themeStyles = {
    container: isDark 
      ? 'bg-gray-800 border-gray-600' 
      : 'bg-white border-gray-300',
    text: isDark
      ? 'text-white'
      : 'text-gray-800',
    borderHighlight: highlight
      ? 'border-red-500 border-2'
      : isDark ? 'border-gray-600' : 'border-gray-300',
    leftPanel: isDark
      ? 'bg-gray-700'
      : 'bg-gray-100',
    rightPanel: isDark
      ? 'bg-gray-800'
      : 'bg-white',
    dangerText: totalSeconds < 60
      ? 'text-red-500 font-bold'
      : '',
  };

  return (
    <div 
      className="flex items-center justify-center rounded-md overflow-hidden relative"
      onClick={() => setAlwaysShowSeconds(!alwaysShowSeconds)} // Toggle seconds display on click
    >
      {/* Highlight border that doesn't affect layout */}
      {highlight && (
        <div className="absolute inset-0 border-2 border-red-500 rounded-md pointer-events-none z-10"></div>
      )}
      
      <div 
        className={`flex w-full h-12 shadow-sm transition-colors duration-200 ${themeStyles.container}`}
      >
        {/* Minutes display */}
        <div 
          className={`flex-1 flex justify-center items-center ${themeStyles.leftPanel} ${themeStyles.text} font-mono text-xl`}
        >
          {displayHours}{displayMinutes}
        </div>

        {/* Seconds display - shown when time is low or when showSeconds is true */}
        {showMilliseconds ? (
          <>
            <div className={`w-1 ${themeStyles.container}`}></div>
            <div 
              className={`flex-1 flex justify-center items-center ${themeStyles.rightPanel} ${themeStyles.text} ${themeStyles.dangerText} font-mono text-xl`}
            >
              {displaySeconds}
            </div>
          </>
        ) : (
          showSeconds && (
            <>
              <div className={`w-1 ${themeStyles.container}`}></div>
              <div 
                className={`flex-1 flex justify-center items-center ${themeStyles.rightPanel} ${themeStyles.text} ${themeStyles.dangerText} font-mono text-xl`}
              >
                {displaySeconds}
              </div>
            </>
          )
        )}
        
        {/* Status indicator */}
        {isRunning && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full m-1 z-20"></div>
        )}
      </div>
    </div>
  );
}
