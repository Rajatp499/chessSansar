import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "../components/common/LoadingSpinner";

/**
 * Account Activation Component
 * Handles email verification and account activation
 */
const Activate = () => {
  /****************************
   * Hooks & State Management
   ****************************/
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const isDark = useSelector((state) => state.theme.isDark);

  // UI State
  const [status, setStatus] = useState({
    loading: true,
    error: "",
    success: false
  });

  /****************************
   * Activation Handler
   ****************************/
  useEffect(() => {
    const activateAccount = async () => {
      try {
        const BACKEND_API = import.meta.env.VITE_BACKEND_CHESS_API;
        const response = await fetch(`${BACKEND_API}/auth/users/activation/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid, token }),
        });

        if (response.status === 204) {
          setStatus(prev => ({ ...prev, success: true }));
          
          // Redirect to login with activation success message
          setTimeout(() => {
            navigate("/login", {
              state: {
                message: "Account activated successfully! You can now login.",
                username: localStorage.getItem('signup-username')
              }
            });
          }, 2000);
        } else {
          const data = await response.json();
          throw new Error(data.detail || "Activation failed");
        }
      } catch (err) {
        console.error("Activation Error:", err);
        setStatus(prev => ({ 
          ...prev, 
          error: "Account activation failed. The link may be invalid or expired."
        }));
      } finally {
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    activateAccount();
  }, [uid, token, navigate]);

  /****************************
   * Render Component
   ****************************/
  return (
    <div className={`min-h-screen flex justify-center items-center p-4
      ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      
      <div className={`p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md text-center
        ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        
        {/* Loading State */}
        {status.loading && (
          <div className="space-y-4">
            <LoadingSpinner size={8} isDark={isDark} />
            <p className="text-lg font-medium">
              Activating your account...
            </p>
          </div>
        )}

        {/* Error State */}
        {!status.loading && status.error && (
          <div className="space-y-4">
            <div className="text-red-500 text-5xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold">Activation Failed</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {status.error}
            </p>
            <button
              onClick={() => navigate('/signup')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors
                ${isDark 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'} 
                text-white`}
            >
              Back to Sign Up
            </button>
          </div>
        )}

        {/* Success State */}
        {!status.loading && status.success && (
          <div className="space-y-4">
            <div className="text-green-500 text-5xl">
              ✓
            </div>
            <h2 className="text-xl font-bold">Account Activated!</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Redirecting you to login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activate;
