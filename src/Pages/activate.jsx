import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const [error, setError] = useState("");

    const BACKEND_API = import.meta.env.VITE_BACKEND_CHESS_API;
    console.log("Backend API:", BACKEND_API);

    const { uid, token } = useParams();

    useEffect(() => {
        const loginData = {
            uid: uid,
            token: token,
        };

        fetch(BACKEND_API + "/auth/users/activation/", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        })
            .then((res) => {
                if (res.status === 204) {
                    navigate("/login");
                } else {
                    setError("Activation failed. Please try again.");
                }
            })
            .catch((err) => {
                console.error("Login Error:", err);
            });

    }, [uid, token]);

    return (
        <div className="h-screen flex justify-center items-center bg-gray-100">
            Activating....
        </div>
    );
};

export default Login;
