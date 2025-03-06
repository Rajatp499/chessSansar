import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Modal from "../components/common/Modal"; // Create this reusable component
import LoadingSpinner from "../components/common/LoadingSpinner";

/**
 * SignUp Component
 * Handles user registration and account creation
 */
const Signup = () => {
  /****************************
   * Hooks & State Management
   ****************************/
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.isDark);

  // Form state
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    password: "",
  });

  // UI state
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /****************************
   * Event Handlers
   ****************************/
  /**
   * Updates form state when input values change
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  /**
   * Handles successful signup
   * Redirects to login with pre-filled credentials
   */
  const handleSignupSuccess = () => {
    setModalMessage("Account created successfully! Please check your email for activation link.");
    setShowModal(true);
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigate("/login", { 
        state: { 
          username: userData.username,
          message: "Please login with your new account after email verification."
        }
      });
    }, 3000);
  };

  /**
   * Handles form submission and user registration
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!userData.email || !userData.username || !userData.password) {
      setError("All fields are required.");
      return;
    }

    setIsLoading(true); // Start loading
    setError(""); // Clear any existing errors

    try {
      const URL = `${import.meta.env.VITE_BACKEND_CHESS_API}/auth/users/`;
      const response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.status === 201) {
        handleSignupSuccess();
        return;
      }

      let errorMessage = "";
      Object.keys(data).forEach(key => {
        data[key].forEach(msg => {
          errorMessage += `${key}: ${msg}\n`;
        });
      });
      
      setError(errorMessage.trim());

    } catch (err) {
      console.error("Signup Error:", err);
      setError("An error occurred during signup. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  /****************************
   * Render Component
   ****************************/
  return (
    <div className={`min-h-screen flex justify-center items-center p-4
      ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      
      {/* Signup Card */}
      <div className={`p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md
        ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        
        {/* Header */}
        <h2 className={`text-2xl sm:text-3xl font-bold text-center mb-6
          ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Create Account
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className={`block text-sm font-medium mb-1
              ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg transition-colors
                ${isDark 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500'
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'}
                ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
                border-2 focus:outline-none`}
              placeholder="Enter your email"
            />
          </div>

          {/* Username Field */}
          <div>
            <label className={`block text-sm font-medium mb-1
              ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg transition-colors
                ${isDark 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500'
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'}
                ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
                border-2 focus:outline-none`}
              placeholder="Choose a username"
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
              value={userData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg transition-colors
                ${isDark 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500'
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'}
                ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
                border-2 focus:outline-none`}
              placeholder="Choose a password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-bold transition-all
              transform hover:scale-105 duration-200
              ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} 
              ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
              text-white shadow-lg hover:shadow-xl
              flex items-center justify-center space-x-2`}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size={4} isDark={true} />
                <span>Signing Up...</span>
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className={`text-center mt-6 
          ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            className={`font-medium hover:underline
              ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
          >
            Login
          </Link>
        </p>
      </div>

      {/* Success Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Sign Up Successful"
          message={modalMessage}
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default Signup;
