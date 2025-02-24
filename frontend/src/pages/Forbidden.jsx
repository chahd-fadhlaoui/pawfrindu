import React from 'react';
import { ShieldX, Home, ArrowLeft, AlertTriangle } from 'lucide-react';

const Forbidden = () => {
  return (
    <section className="relative min-h-screen py-20 bg-white">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute text-6xl text-red-200 transform top-20 left-10 opacity-20 -rotate-12">⚠️</div>
        <div className="absolute text-6xl text-yellow-200 transform rotate-45 top-40 right-20 opacity-20">⚠️</div>
        
        {/* Gradient blobs */}
        <div className="absolute top-0 left-0 bg-red-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute bottom-0 right-0 bg-yellow-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-2xl px-4 mx-auto">
        {/* Error Card */}
        <div className="group relative overflow-hidden bg-white rounded-3xl p-12 transform transition-all duration-500 hover:scale-[1.02] border border-gray-100 shadow-lg hover:border-red-200">
          {/* Background Animation */}
          <div className="absolute inset-0 transition-all duration-500 opacity-0 bg-gradient-to-r from-yellow-50/30 via-red-50/30 to-yellow-50/30 group-hover:opacity-100 group-hover:bg-[length:200%_200%] animate-gradient" />
          
          <div className="relative z-10 space-y-8 text-center">
            {/* Icon Container */}
            <div className="relative mx-auto">
              <div className="w-24 h-24 p-5 mx-auto transition-all duration-500 transform rounded-full bg-gradient-to-br from-yellow-50 to-red-50 group-hover:from-yellow-100 group-hover:to-red-100 group-hover:rotate-6">
                <div className="transition-transform duration-500 group-hover:scale-110">
                  <ShieldX className="w-full h-full text-gray-700" />
                </div>
              </div>
              {/* Floating sparkle decoration */}
              <div className="absolute transition-all duration-300 -right-2 -top-2">
                <span className="absolute transition-all duration-500 opacity-0 group-hover:opacity-100 animate-ping">⚠️</span>
                <span className="transition-all duration-500 opacity-0 group-hover:opacity-100">⚠️</span>
              </div>
            </div>

            {/* Enhanced Content with Animation */}
            <div className="space-y-4 transition-all duration-300 transform group-hover:translate-y-[-2px]">
              <div className="space-y-2">
                <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-red-500 bg-white border border-red-100 rounded-full shadow-sm">
                  <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                  Access Denied
                </span>
                <h1 className="text-4xl font-bold text-gray-900">
                  <span className="block">403 Forbidden</span>
                  <span className="block mt-2 text-red-500">No Permission</span>
                </h1>
              </div>
              <p className="max-w-md mx-auto text-lg leading-relaxed text-gray-600">
                Oops! It seems you don't have the necessary permissions to access this page. 
                Please contact your administrator if you believe this is a mistake.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-3 text-gray-700 transition-colors bg-white border border-gray-200 rounded-full shadow-sm group hover:bg-gray-50 hover:border-gray-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                Go Back
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center px-6 py-3 text-white transition-colors bg-red-500 rounded-full shadow-sm group hover:bg-red-600"
              >
                <Home className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Home Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Forbidden;