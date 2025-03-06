import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Add this import

/**
 * Login Component
 * Handles user authentication and login functionality
 */
const Login = () => {
  /****************************
   * Hooks & State Management
   ****************************/
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useSelector((state) => state.theme.isDark);
  
  // Form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check for pre-filled credentials
    if (location.state?.username) {
      setLoginData(prev => ({
        ...prev,
        username: location.state.username
      }));
    }
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location]);

  /****************************
   * Event Handlers
   ****************************/
  /**
   * Updates form state when input values change
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  };

  /**
   * Handles form submission and authentication
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!loginData.username || !loginData.password) {
      setError("All fields are required.");
      return;
    }

    try {
      const URL = `${import.meta.env.VITE_BACKEND_CHESS_API}/auth/token/login/`;
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Store token
      localStorage.setItem("token", data.auth_token);
      
      // Redirect to the original page or home
      if (location.state?.redirectTo) {
        navigate(location.state.redirectTo);
      } else {
        navigate("/");
      }
      
    } catch (err) {
      console.error("Login Error:", err);
      setError("Invalid username or password");
    }
  };

  /****************************
   * Render Component
   ****************************/
  return (
    <div className={`min-h-screen flex justify-center items-center p-4 
      ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      
      {/* Login Card */}
      <div className={`p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md
        ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        
        {/* Header */}
        <h2 className={`text-2xl sm:text-3xl font-bold text-center mb-6
          ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Welcome Back
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700">
            {error}
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="mb-4 p-3 rounded bg-blue-100 border border-blue-400 text-blue-700">
            {message}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className={`block text-sm font-medium mb-1
              ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg transition-colors
                ${isDark 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500'
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'}
                border-2 focus:outline-none`}
              placeholder="Enter your username"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className={`block text-sm font-medium mb-1
              ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg transition-colors
                ${isDark 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500'
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'}
                border-2 focus:outline-none`}
              placeholder="Enter your password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg font-bold transition-all
              transform hover:scale-105 duration-200
              ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} 
              text-white shadow-lg hover:shadow-xl`}
          >
            Login
          </button>
        </form>

        {/* Sign Up Link */}
        <p className={`text-center mt-6 
          ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            className={`font-medium hover:underline
              ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
