import React, { useState, cloneElement } from 'react';

export const Tooltip = ({ 
  children, 
  text, 
  position = 'top', 
  className = '', 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full -top-2 left-1/2',
    bottom: '-translate-x-1/2 translate-y-full -bottom-2 left-1/2',
    left: '-translate-x-full -translate-y-1/2 -left-2 top-1/2',
    right: 'translate-x-full -translate-y-1/2 -right-2 top-1/2'
  };

  const handleMouseEnter = () => {
    if (delay > 0) {
      const id = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      setTimeoutId(id);
    } else {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  // Enhance the child element with additional props
  const enhancedChild = cloneElement(children, {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  return (
    <div className="relative inline-block group">
      {enhancedChild}
      {isVisible && (
        <div 
          className={`
            absolute z-50 px-3 py-2 text-xs text-white 
            bg-gray-800 rounded-md shadow-lg 
            transition-all duration-200 ease-in-out
            ${positionClasses[position]}
            ${className}
          `}
        >
          {text}
          {/* Optional: Add a small triangle pointer */}
          <div 
            className={`
              absolute w-2 h-2 bg-gray-800 
              ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 rotate-45' : ''}
              ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 rotate-45' : ''}
              ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 rotate-45' : ''}
              ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2 rotate-45' : ''}
            `}
          />
        </div>
      )}
    </div>
  );
};