import React from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';



const JoinPage = () => {

    const [roomid, setRoomid] = React.useState("");
    const [games, setGames] = React.useState([{ game_id: '12345', player1: 'nishan' }]);

    const navigate = useNavigate();


    const join_socket = useRef(null);
    const games_socket = useRef(null);

    useEffect(() => {
        const URL = import.meta.env.VITE_BACKEND_CHESS_WS_API + "/chess/?token=" + localStorage.getItem("token");
        games_socket.current = new WebSocket(URL);

        games_socket.current.onopen = () => {
            console.log("WebSocket connection established");
        };
        games_socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.message.type === "only_me" || message.message.info === 'connected') {
                console.log("games : ", message.games);
                setGames(message.games);
            }
            if (message.message.type === 'all' && message.message.info === 'available') {
                console.log("game: ", message.game);
                setGames((prev) => [...prev, message.game]);
            }
            if (message.message.type === 'all' && message.message.info === 'unavailable') {
                console.log("game_id: ", message.game.game_id);
                setGames(prev => prev.filter(g => g.game_id !== message.game.game_id));
            }
            console.log("Received response:", message);
        };

        games_socket.current.onclose = () => {
            console.log("WebSocket connection closed");
        };

        games_socket.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }, []);

    const handleClick = () => {
        const BACKEND_WS_API = import.meta.env.VITE_BACKEND_CHESS_WS_API;
        join_socket.current = new WebSocket(BACKEND_WS_API + "/chess/" + roomid + "/?token=" + localStorage.getItem("token"));

        join_socket.current.onopen = () => {
            console.log("WebSocket connection established");
            join_socket.current.send(JSON.stringify({ action: "join_game" }));
        };

        join_socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.message === "joined game" || message.message === "reconnected") {
                // navigate(`/online/${roomid}`);
                console.log("Joined resonpse: ", message);

            }
            console.log("Received response:", message);
            // Handle incoming messages
        };

        join_socket.current.onclose = () => {
            console.log("WebSocket connection closed");
        };

        join_socket.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
        navigate('/online/' + roomid, { state: { isActive: true } });
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Join Game</h1>
                <form onSubmit={(e) => { e.preventDefault(); }}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gameId">
                            Game ID
                        </label>
                        <input
                            type="text"
                            id="gameId"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter Game ID"
                            value={roomid}
                            onChange={(e) => setRoomid(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            // type="submit"
                            onClick={handleClick}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Join Game
                        </button>
                    </div>
                </form>
                <br /><br />
                <h3>Available games: </h3>
                {games.map((game, index) => (
                    <div
                        key={index}
                        className="mt-2 p-3 border rounded hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => setRoomid(game.game_id)}
                    >
                        <div>
                            <span className="font-medium">Room: {game.game_id}</span>
                            <p className="text-sm text-gray-600">Host: {game.player1}</p>
                            <p className="text-sm text-gray-600">Host Color: {game.player1_color}</p>
                        </div>
                        <span className="text-sm text-green-600">Available</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JoinPage;