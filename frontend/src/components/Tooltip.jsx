import React, { useState } from 'react'

export const Tooltip = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 p-2 text-xs text-white transform -translate-x-1/2 -translate-y-full bg-gray-800 rounded-md shadow-lg -top-2 left-1/2">
          {text}
        </div>
      )}
    </div>
  );
};
