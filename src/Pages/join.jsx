import React from 'react';
import { useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';



const JoinPage = () => {

    const[ roomid, setRoomid ] = React.useState("");
    const navigate = useNavigate();

    const socket = useRef(null);
    // useEffect(() => {


    //   }, [roomid]);


    const handleClick = () => { 
        const BACKEND_WS_API = import.meta.env.VITE_BACKEND_CHESS_WS_API;
        socket.current = new WebSocket(BACKEND_WS_API + "/chess/" + roomid + "/?token=" + localStorage.getItem("token"));

        socket.current.onopen = () => {
          console.log("WebSocket connection established");
          socket.current.send(JSON.stringify({ action: "join_game" }));
        };
    
        socket.current.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.message === "joined game" || message.message === "reconnected") {
            // navigate(`/online/${roomid}`);
            console.log("Joined resonpse: ", message);

          }
          console.log("Received response:", message);
          // Handle incoming messages
        };
    
        socket.current.onclose = () => {
          console.log("WebSocket connection closed");
        };
    
        socket.current.onerror = (error) => {
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
            </div>
        </div>
    );
};

export default JoinPage;