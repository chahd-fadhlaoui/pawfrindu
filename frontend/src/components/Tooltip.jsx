import React, { useState, cloneElement } from "react";

export const Tooltip = ({
  children,
  text,
  ariaLabel,
  position = "top",
  className = "",
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const positionClasses = {
    top: "-translate-x-1/2 -mt-16 left-1/2",
    bottom: "-translate-x-1/2 translate-y-full -bottom-2 left-1/2",
    left: "-translate-x-full -translate-y-1/2 -left-2 top-1/2",
    right: "translate-x-full -translate-y-1/2 -right-2 top-1/2",
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
      <span
        className={`
          absolute z-50 w-64 px-3 py-2 text-sm text-white 
          bg-gray-800 rounded-lg transition-opacity
          ${isVisible ? "visible opacity-100" : "invisible opacity-0"}
          ${positionClasses[position]}
          ${className}
        `}
      >
        {text}
      </span>
    </div>
  );
};
