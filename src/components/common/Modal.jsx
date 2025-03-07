import React from 'react';

const Modal = ({ isOpen, onClose, title, message, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative p-6 rounded-lg shadow-xl max-w-md w-full mx-4
        ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded font-medium
            ${isDark 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-500 hover:bg-blue-600'} 
            text-white transition-colors`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;