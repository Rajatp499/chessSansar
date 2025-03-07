import React, { useState } from 'react';

/**
 * SelectAI Component
 * 
 * A modal dialog for configuring chess game settings against an AI opponent
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is visible
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onStartGame - Function to call with game settings when game starts
 * @param {boolean} props.isDark - Whether dark mode is enabled
 */
const SelectAI = ({ open, onClose, onStartGame, isDark }) => {
    // Game settings state
    const [gameFormat, setGameFormat] = useState('rapid');
    const [botLevel, setBotLevel] = useState(1);
    const [playerColor, setPlayerColor] = useState('white');
    const [timeControl, setTimeControl] = useState({
        classical: '30+10',
        rapid: '10+5',
        blitz: '5+5',
        bullet: '1+0',
    });

    // Available time controls for each format
    const timeOptions = {
        classical: ['30+10', '45+20', '60+90'],
        rapid: ['10+5', '15+10', '20+5'],
        blitz: ['3+2', '5+5', '7+5'],
        bullet: ['1+2', '1+0', '1+5'],
    };

    /**
     * Handle form submission and start the game
     */
    const handleSubmit = () => {
        onStartGame({
            format: gameFormat,
            level: parseInt(botLevel, 10),
            color: playerColor,
            time: timeControl[gameFormat],
        });
        onClose();
    };

    // If the modal is not open, don't render anything
    if (!open) return null;

    // Theme-specific styles
    const themeStyles = {
        overlay: isDark 
            ? 'bg-black bg-opacity-75' 
            : 'bg-black bg-opacity-50',
        modal: isDark 
            ? 'bg-gray-800 text-white border border-gray-700' 
            : 'bg-white text-gray-800 border border-gray-200',
        input: isDark 
            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
            : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500',
        select: isDark 
            ? 'bg-gray-700 border-gray-600 text-white' 
            : 'bg-white border-gray-300 text-gray-800',
        option: isDark 
            ? 'bg-gray-700 text-white' 
            : 'bg-white text-gray-800',
        cancelBtn: isDark 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        confirmBtn: isDark 
            ? 'bg-blue-700 hover:bg-blue-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white',
        label: isDark 
            ? 'text-gray-200' 
            : 'text-gray-700',
        heading: isDark 
            ? 'text-white border-b border-gray-700' 
            : 'text-gray-900 border-b border-gray-200',
        radioGroup: isDark 
            ? 'text-gray-200' 
            : 'text-gray-800',
        radioControl: isDark 
            ? 'text-blue-500' 
            : 'text-blue-600'
    };

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${themeStyles.overlay}`}>
            <div 
                className={`p-6 rounded-lg shadow-xl max-w-md mx-auto ${themeStyles.modal} transition-all duration-200`}
                style={{ width: 'min(95%, 420px)' }}
            >
                <h2 className={`text-xl font-bold mb-6 pb-2 ${themeStyles.heading}`}>Game Settings</h2>
                
                {/* Game Format Selection */}
                <div className="mb-5">
                    <label className={`block mb-2 font-medium ${themeStyles.label}`}>
                        Game Format
                    </label>
                    <select
                        className={`w-full p-2.5 border rounded-lg transition-colors ${themeStyles.select}`}
                        value={gameFormat}
                        onChange={(e) => setGameFormat(e.target.value)}
                    >
                        <option value="classical" className={themeStyles.option}>Classical</option>
                        <option value="rapid" className={themeStyles.option}>Rapid</option>
                        <option value="blitz" className={themeStyles.option}>Blitz</option>
                        <option value="bullet" className={themeStyles.option}>Bullet</option>
                    </select>
                </div>

                {/* Bot Level Selection */}
                <div className="mb-5">
                    <label className={`block mb-2 font-medium ${themeStyles.label}`}>
                        Bot Level
                    </label>
                    <select
                        className={`w-full p-2.5 border rounded-lg transition-colors ${themeStyles.select}`}
                        value={botLevel}
                        onChange={(e) => setBotLevel(e.target.value)}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
                            <option key={level} value={level} className={themeStyles.option}>
                                Level {level}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Player Color Selection */}
                <div className="mb-5">
                    <label className={`block mb-2 font-medium ${themeStyles.label}`}>
                        Choose Your Color
                    </label>
                    <div className={`flex flex-wrap gap-5 ${themeStyles.radioGroup}`}>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className={`form-radio ${themeStyles.radioControl}`}
                                value="white"
                                checked={playerColor === 'white'}
                                onChange={(e) => setPlayerColor(e.target.value)}
                            />
                            <span className="ml-2">White</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className={`form-radio ${themeStyles.radioControl}`}
                                value="black"
                                checked={playerColor === 'black'}
                                onChange={(e) => setPlayerColor(e.target.value)}
                            />
                            <span className="ml-2">Black</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className={`form-radio ${themeStyles.radioControl}`}
                                value="random"
                                checked={playerColor === 'random'}
                                onChange={(e) => setPlayerColor(e.target.value)}
                            />
                            <span className="ml-2">Random</span>
                        </label>
                    </div>
                </div>

                {/* Time Control Selection */}
                <div className="mb-5">
                    <label className={`block mb-2 font-medium ${themeStyles.label}`}>
                        Time Control
                    </label>
                    <select
                        className={`w-full p-2.5 border rounded-lg transition-colors ${themeStyles.select}`}
                        value={timeControl[gameFormat]}
                        onChange={(e) => setTimeControl({ ...timeControl, [gameFormat]: e.target.value })}
                    >
                        {timeOptions[gameFormat].map((time) => (
                            <option key={time} value={time} className={themeStyles.option}>
                                {time} (minutes+increment)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${themeStyles.cancelBtn}`}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${themeStyles.confirmBtn}`}
                        onClick={handleSubmit}
                    >
                        Start Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectAI;