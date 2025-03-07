import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaChessKing, FaUser, FaCircle, FaClock, FaHourglassHalf } from 'react-icons/fa';
import TimeAgo from 'timeago-react';



 // Add formatTime helper function
 const formatTime = (minutes) => {
    if (minutes >= 60) {
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
};


/**
 * JoinPage Component
 * Handles joining existing chess games and displays available games
 */
const JoinPage = () => {
    /****************************
     * State & Hooks
     ****************************/
    const [error, setError] = useState("");
    const isDark = useSelector((state) => state.theme.isDark);
    const [roomid, setRoomid] = useState("");
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.user.name);
    

    // WebSocket refs
    const join_socket = useRef(null);
    const games_socket = useRef(null);

    // reset error when some games are select from game list
    useEffect(() => {
        setError('');
    }, [selectedGame]);

    /****************************
     * WebSocket Setup - Games List
     ****************************/
    useEffect(() => {
        const URL = `${import.meta.env.VITE_BACKEND_CHESS_WS_API}/chess/?token=${localStorage.getItem("token")}`;
        games_socket.current = new WebSocket(URL);

        // WebSocket event handlers
        games_socket.current.onopen = () => {
            console.log("Games WebSocket connected");
        };

        games_socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Recieved Game list: message: ", message);
            handleGamesWebSocketMessage(message);
        };

        games_socket.current.onclose = () => {
            console.log("Games WebSocket closed");
        };

        games_socket.current.onerror = (error) => {
            console.error("Games WebSocket error:", error);
        };

        return () => games_socket.current.close();
    }, []);

    /****************************
     * Message Handlers
     ****************************/
    const handleGamesWebSocketMessage = (message) => {
        const { type, info } = message.message;

        // Handle initial games list
        if (type === "only_me" || info === 'connected') {
            setGames(filterGames(message.games));
        }
        // Handle new available game
        else if (type === 'all' && info === 'available') {
            setGames(prev => filterGames([...prev, message.game]));
        }
        // Handle game becoming unavailable
        else if (type === 'all' && info === 'unavailable') {
            setGames(prev => prev.filter(g => g.game_id !== message.game.game_id));
        }
    };

    /****************************
     * Game Join Handler
     ****************************/
    const handleJoinGame = () => {
        if (!roomid) {
            setError('Please input valid game ID');
            return;
        }

        const BACKEND_WS_API = import.meta.env.VITE_BACKEND_CHESS_WS_API;
        const URL = `${BACKEND_WS_API}/chess/${roomid}/?token=${localStorage.getItem("token")}`;
        
        join_socket.current = new WebSocket(URL);

        join_socket.current.onopen = () => {
            console.log("Join WebSocket connected");
            join_socket.current.send(JSON.stringify({ action: "join_game" }));
        };

        join_socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.message.info === "joined" || message.message.info === "reconnected") {
                console.log("joined or reconnected: join_socket:: ", message);
                navigate(`/online/${roomid}`, { state: { isActive: true } });
                join_socket.current.close();
            }
            if (message.message.info === 'invalid') {
                setError(message.message.error);
            }
            console.log("join_socket message recieved: ", message);
        };

        join_socket.current.onclose = () => console.log("Join WebSocket closed");
        join_socket.current.onerror = (error) => console.error("Join WebSocket error:", error);
    };

    /****************************
     * Helper Functions
     ****************************/
    const getGameStatusInfo = (game) => {
        if (game.player2) {
            if (game.player1 === currentUser || game.player2 === currentUser) {
                return {
                    status: 'reconnect',
                    color: 'text-yellow-600',
                    text: 'Reconnect'
                };
            }
        }
        return {
            status: 'available',
            color: 'text-green-600',
            text: 'Available'
        };
    };

    const filterGames = (games) => {
        return games.filter(game => {
            if (!game.player2) return true; // Show all available games
            // Show reconnect games only if current user is player1 or player2
            // console.log(`filter games:: p1: ${game.player1}  p2: ${game.player2}   current_user: ${currentUser}`)
            return game.player1 === currentUser || game.player2 === currentUser;
        });
    };

    /****************************
     * Render Component
     ****************************/
    return (
        <div className={`min-h-screen flex items-center justify-center p-4 
            ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className={`p-8 rounded-lg shadow-xl w-full mx-12 my-6 
                ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                
                {/* Header Section */}
                <div className="flex items-center justify-center mb-8">
                    <FaChessKing className={`text-4xl mr-3 
                        ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h1 className="text-3xl font-bold">Join Game</h1>
                </div>

                {/* Selected Game Info */}
                {selectedGame && (
                    <div className={`mb-8 p-4 rounded-lg border-2 
                        ${isDark ? 'border-blue-500 bg-gray-700' : 'border-blue-400 bg-blue-50'}`}>
                        <h3 className="text-lg font-semibold mb-2">Selected Game</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Format:</span> {selectedGame.format}</p>
                            <p><span className="font-medium">Time Control:</span> {formatTime(selectedGame.clock.base)} + {selectedGame.clock.increment}s</p>
                            <p><span className="font-medium">Created by:</span> {selectedGame.player1}</p>
                        </div>
                    </div>
                )}

                {/* How to Join Section */}
                <div className={`mb-8 p-4 rounded-lg 
                    ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className="text-lg font-semibold mb-2">How to Join</h3>
                    <ol className={`list-decimal list-inside space-y-2 text-sm
                        ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>Click on an available game from the list below</li>
                        <li>The game ID will be automatically filled</li>
                        <li>Or manually type the game ID</li>
                        <li>Click the "Join Game" button to start playing</li>
                    </ol>
                </div>
                
                {/* Show error if invalid game ID is submitted */}
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                {/* Game ID Form */}
                <form onSubmit={(e) => e.preventDefault()} className="mb-8">
                    <div className="mb-4">
                        <label className={`block text-sm font-bold mb-2 
                            ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            htmlFor="gameId">
                            Game ID
                        </label>
                        <input
                            type="text"
                            id="gameId"
                            value={roomid}
                            onChange={(e) => setRoomid(e.target.value)}
                            placeholder="Enter Game ID"
                            className={`w-full px-4 py-3 rounded-lg transition-colors
                                ${isDark 
                                    ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500'
                                    : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'}
                                border-2 focus:outline-none`}
                        />
                    </div>
                    <button
                        onClick={handleJoinGame}
                        className={`w-full py-3 px-4 rounded-lg font-bold transition-all
                            transform hover:scale-105 duration-200
                            ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} 
                            text-white shadow-lg hover:shadow-xl`}
                    >
                        Join Game
                    </button>
                </form>

                {/* Available Games List */}
                <GamesList 
                    games={games} 
                    isDark={isDark} 
                    setRoomid={setRoomid}
                    selectedGameId={selectedGame?.game_id}
                    onGameSelect={(game) => {
                        setSelectedGame(game);
                        setRoomid(game.game_id);
                    }}
                    getGameStatusInfo={getGameStatusInfo}
                />
            </div>
        </div>
    );
};

/**
 * GamesList Component
 * Displays list of available games
 */
const GamesList = ({ 
    games, 
    isDark, 
    selectedGameId, 
    onGameSelect, 
    getGameStatusInfo 
}) => {
    // Sort games by start time (newest first)
    const sortedGames = [...games].sort((a, b) => {
        return new Date(b.clock.started) - new Date(a.clock.started);
    });

    return (
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Available Games ({games.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedGames.map((game, index) => (
                    <GameCard 
                        key={index}
                        game={game}
                        isDark={isDark}
                        isSelected={game.game_id === selectedGameId}
                        onClick={() => onGameSelect(game)}
                        statusInfo={getGameStatusInfo(game)}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * GameCard Component
 * Individual game card in the list
 */
const GameCard = ({ game, isDark, isSelected, onClick, statusInfo }) => {
    
    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-lg cursor-pointer transition-all
                transform hover:scale-101 duration-200 relative
                ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}
                ${isSelected ? isDark 
                    ? 'ring-2 ring-blue-500 ring-opacity-100' 
                    : 'ring-2 ring-blue-400 ring-opacity-100'
                    : ''}`}
        >
            <div className="flex flex-col space-y-3">
                {/* Header with players and status */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center">
                        <FaUser className="mr-2" />
                        <span className="font-medium">
                            {game.player1}
                            {game.player2 && ` vs ${game.player2}`}
                        </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${statusInfo.color} ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        {statusInfo.text}
                    </span>
                </div>

                {/* Game details */}
                <div className={`text-sm grid grid-cols-2 gap-2
                    ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {/* Left column */}
                    <div className="space-y-1">
                        <div className="flex items-center">
                            <FaClock className="mr-2" />
                            {formatTime(game.clock.base)} + {game.clock.increment}s
                        </div>
                        <div className="flex items-center">
                            <FaCircle className={`mr-2 ${
                                game.player1_color === 'white' ? 'text-gray-300' : 'text-gray-900'
                            }`} />
                            {game.player2 ? 
                                `${game.player1_color} vs ${game.player2_color}` :
                                `Playing as ${game.player1_color}`
                            }
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-end">
                            <span className="font-medium">{game.format}</span>
                        </div>
                        <div className="flex items-center justify-end">
                            <FaHourglassHalf className="mr-2" />
                            <TimeAgo
                                datetime={game.clock.started}
                                opts={{ minInterval: 10 }}
                                className={isDark ? 'text-gray-400' : 'text-gray-600'}
                            />
                        </div>
                    </div>
                </div>

                {/* Game ID */}
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    ID: {game.game_id}
                </div>

                {/* Selection indicator */}
                {isSelected && (
                    <div className={`absolute -right-1 -top-1 w-4 h-4 rounded-full
                        ${isDark ? 'bg-blue-500' : 'bg-blue-400'}`}>
                        <div className="w-2 h-2 bg-white rounded-full m-1" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoinPage;