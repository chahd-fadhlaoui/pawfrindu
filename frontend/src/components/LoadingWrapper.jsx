import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingWrapper = ({ loading, children }) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {children}
      </div>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5">
          <div className="flex flex-col items-center justify-center p-4 rounded-lg">
            <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingWrapper;