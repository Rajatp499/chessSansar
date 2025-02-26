import React, { useState } from "react";
import { Link } from "react-router-dom";

import Popup from "reactjs-popup";


const Signup = () => {
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [popUp, setPopUp] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const BACKEND_API = import.meta.env.VITE_BACKEND_CHESS_API
  // Handle Input Change
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic Validation
    if (!userData.email || !userData.username || !userData.password) {
      setError("All fields are required.");
      return;
    }

    fetch(BACKEND_API + "/auth/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData)
    })
      .then((res) => {
        console.log("Signup Response status:", res.status);
        if (res.status === 201) {
          setMessage("Signup successful. Please check your email to activate your account.");
          setPopUp(true);
          return;
        }

        return res.json();
      })
      .then((data) => {
        for (let key in data) {
          // console.log(key);
          for (let val in data[key]) {
            // console.log(data[key][val]);
            setError((prev) => prev+"\n"+data[key][val]);
          }
        }
        // console.log("data:", data);
      })
      .catch((err) => {
        console.error("Signup Error:", err);
      });

    console.log("Signup Data:", userData);
    setError("");
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
            />
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={userData.username}
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
              value={userData.password}
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
            Sign Up
          </button>
        </form>

        {/* Already have an account? */}
        <p className="text-center text-gray-600 mt-4">
          Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </div>
      <Popup open={popUp} closeOnDocumentClick onClose={() => setPopUp(false)}>
        <div className="bg-slate-800 p-8  text-red-600 te rounded-lg shadow-lg w-96"> 
          {message}
        </div>
        </Popup>
    </div>
  );
};

export default Signup;
