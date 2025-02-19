import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingWrapper = ({ loading, children }) => {
  const [showLoader, setShowLoader] = useState(false);
  
  // Delayed loader to prevent flash on quick loads
  useEffect(() => {
    let timeoutId;
    if (loading) {
      timeoutId = setTimeout(() => {
        setShowLoader(true);
      }, 300); // Only show loader for operations taking longer than 300ms
    } else {
      setShowLoader(false);
    }
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <div 
        className={`transition-all duration-300 ${
          showLoader ? 'opacity-50 pointer-events-none' : 'opacity-100'
        }`}
      >
        {children}
      </div>
      
      {showLoader && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[2px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center justify-center p-6 shadow-lg bg-white/80 rounded-xl">
            <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
            <span className="mt-2 text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default LoadingWrapper;