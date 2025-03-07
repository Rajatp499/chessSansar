import React, { useState } from 'react';

const SelectAI = ({ open, onClose, onStartGame, isDark }) => {
    const [gameFormat, setGameFormat] = useState('classical');
    const [botLevel, setBotLevel] = useState(1);
    const [playerColor, setPlayerColor] = useState('white');
    const [timeControl, setTimeControl] = useState({
        classical: '30+10',
        rapid: '10+5',
        blitz: '5+5',
    });

    const handleSubmit = () => {
        onStartGame({
            format: gameFormat,
            level: botLevel,
            color: playerColor,
            time: timeControl[gameFormat],
        });
        onClose();
    };

    const timeOptions = {
        classical: ['30+10', '45+20', '60+90'],
        rapid: ['10+5', '15+10', '20+5'],
        blitz: ['3+2', '5+5', '7+5'],
    };

    if (!open) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center ${isDark ? 'bg-black bg-opacity-75' : 'bg-black bg-opacity-50'}`}>
            <div className={`p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                <h2 className="text-xl font-bold mb-4">Game Settings</h2>
                <div className="mb-4">
                    <label className="block mb-2">Game Format</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={gameFormat}
                        onChange={(e) => setGameFormat(e.target.value)}
                    >
                        <option value="classical">Classical</option>
                        <option value="rapid">Rapid</option>
                        <option value="blitz">Blitz</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Bot Level</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={botLevel}
                        onChange={(e) => setBotLevel(e.target.value)}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
                            <option key={level} value={level}>
                                Level {level}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Choose Your Color</label>
                    <div className="flex space-x-4">
                        <label>
                            <input
                                type="radio"
                                value="white"
                                checked={playerColor === 'white'}
                                onChange={(e) => setPlayerColor(e.target.value)}
                            />
                            White
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="black"
                                checked={playerColor === 'black'}
                                onChange={(e) => setPlayerColor(e.target.value)}
                            />
                            Black
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="random"
                                checked={playerColor === 'random'}
                                onChange={(e) => setPlayerColor(e.target.value)}
                            />
                            Random
                        </label>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Time Control</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={timeControl[gameFormat]}
                        onChange={(e) => setTimeControl({ ...timeControl, [gameFormat]: e.target.value })}
                    >
                        {timeOptions[gameFormat].map((time) => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        className={`px-4 py-2 rounded ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-300'}`}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${isDark ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'}`}
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