import React from 'react';

const LoadingSpinner = ({ size = 5, isDark = false }) => {
  return (
    <div className={`inline-block animate-spin rounded-full 
      border-2 border-solid border-current
      border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]
      ${isDark ? 'text-white' : 'text-gray-800'}
      w-${size} h-${size}`}
      role="status">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};

export default LoadingSpinner;