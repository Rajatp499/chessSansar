import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";





export default function Create() {
    const [selectedTime, setSelectedTime] = useState("5+0");
    
    const { roomid } = useParams();
    
    const socket = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {

        const BACKEND_WS_API = import.meta.env.VITE_BACKEND_CHESS_WS_API;
        socket.current = new WebSocket(BACKEND_WS_API + "/chess/" + roomid + "/?token=" + localStorage.getItem("token"));

        socket.current.onopen = () => {
            console.log("WebSocket connection established");
        };

        socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Received message:", message);
            const info = message.message.info;
            if (info === "created") {
                navigate(`/online/${roomid}`);
            }
        };

        socket.current.onclose = () => {
            console.log("WebSocket connection closed");
        };

        socket.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        console.log("useffect Socket:", socket);
    }, []);

    const handleCreateGame = () => {
        const action = "create_game";
        const [base, increment] = selectedTime.split("+").map(Number);
        if (socket.current != null) {
            socket.current.send(JSON.stringify({ action, base, increment }));
        }
    }

    return (
        <>
            <div className="backdrop-blur-sm bg-white/30 h-[100vh] w-[100vw] text-white flex justify-center items-center p-4 rounded-md">
                <div className="p-4 shadow-2xl bg-slate-900 rounded-xl h-[70vh] w-[40vw] flex flex-col justify-center items-center space-y-6 ">
                    <h2 className="text-xl text-white font-bold">Select Chess Timer</h2>

                    <div className="w-full flex flex-col space-y-4">
                        <div className="flex flex-col items-center">
                            <h3 className="text-white text-lg font-semibold">Bullet</h3>
                            <div className="flex space-x-4">
                                {["1+10", "1+5", "2+5"].map((time) => (
                                    <button
                                        key={time}
                                        className={`px-4 py-2 rounded-lg ${selectedTime === time ? "bg-blue-500" : "bg-gray-700"
                                            } text-white`}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <h3 className="text-white text-lg font-semibold">Blitz</h3>
                            <div className="flex space-x-4">
                                {["3+2", "5+0", "5+3", "5+5"].map((time) => (
                                    <button
                                        key={time}
                                        className={`px-4 py-2 rounded-lg ${selectedTime === time ? "bg-blue-500" : "bg-gray-700"
                                            } text-white`}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <h3 className="text-white text-lg font-semibold">Rapid</h3>
                            <div className="flex space-x-4">
                                {["10+0", "10+5", "15+10", "30+0"].map((time) => (
                                    <button
                                        key={time}
                                        className={`px-4 py-2 rounded-lg ${selectedTime === time ? "bg-blue-500" : "bg-gray-700"
                                            } text-white`}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg mt-4"
                        onClick={handleCreateGame}
                    >
                        Create Game
                    </button>
                </div>
            </div>
        </>
    );
}
