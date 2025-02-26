import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [loginData, setloginData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const [error, setError] = useState("");

  const BACKEND_API = import.meta.env.VITE_BACKEND_CHESS_API;
  console.log("Backend API:", BACKEND_API);

  // Handle Input Change
  const handleChange = (e) => {
    setloginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic Validation
    if (!loginData.username || !loginData.password) {
      setError("All fields are required.");
      return;
    }
    fetch(BACKEND_API + "/auth/token/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((res) => res.json())
      .then((data) => {
        let token = data.auth_token;
        localStorage.setItem("token", token);
        console.log("User login token:", token);
        navigate("/");
      })
      .catch((err) => {
        console.error("Login Error:", err);
      });

    setError("");
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username Field */}
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>

        {/* Already have an account? */}
        <p className="text-center text-gray-600 mt-4">
          Don't have an account? <Link to="/signup" className="text-blue-500">Sign UP</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
