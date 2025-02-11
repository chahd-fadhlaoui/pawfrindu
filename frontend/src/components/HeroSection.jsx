import React from 'react';
import { ArrowRight } from 'lucide-react';
import dogsection from "../assets/dogHero.png";
import Pawbg from "../assets/Paw-bg.png";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="grid grid-cols-1 gap-8 px-4 py-16 mx-auto max-w-7xl md:grid-cols-2 lg:py-24">
        {/* Content Section */}
        <div className="flex flex-col justify-center order-2 space-y-6 md:order-1">
          <h1 
            className="
              text-4xl md:text-5xl font-bold text-gray-900 
              transition-all duration-700 
              hover:text-[#ffc929] 
              hover:scale-[1.02]
              group"
          >
            <span className="block transition-transform transform group-hover:translate-x-2">
              Welcome to PawFrindu
            </span>
          </h1>
          
          <p className="text-lg leading-relaxed text-gray-600">
            Discover a vibrant community dedicated to pet adoption, care, and welfare. Our platform connects compassionate pet lovers with furry friends seeking their forever homes.
          </p>
          
          <div>
            <button 
              className="
                bg-pink-500 text-white
                px-6 py-3 rounded-full 
                flex items-center gap-2
                hover:bg-[#ffc929] hover:text-gray-900
                transition-all duration-300
                transform hover:scale-105
                shadow-md hover:shadow-lg
                group"
              aria-label="Join PawFrindu Community"
            >
              Join Us Today
              <ArrowRight 
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
        
        {/* Image Section */}
        <div className="relative flex items-center justify-center order-1 md:order-2">
          <div className="relative group">
            <img 
              src={Pawbg} 
              alt="Paw Background" 
              className="
                absolute -z-10 
                top-1/2 left-1/2 
                transform -translate-x-1/2 -translate-y-1/2
                w-full max-w-[600px] 
                opacity-40 
                group-hover:rotate-6 
                transition-transform 
                duration-500"
            />
            <img 
              src={dogsection} 
              alt="Pet Adoption" 
              className="z-10 object-contain h-auto max-w-full transition-transform duration-500 transform group-hover:scale-110 group-hover:rotate-3"
            />
          </div>
        </div>
      </div>
      
      {/* Decorative Background Blobs */}
      <div 
        className="
          absolute -top-10 -left-10 
          w-64 h-64 
          bg-[#ffc929] 
          rounded-full 
          opacity-30 
          -z-20 
          animate-blob"
      />
      <div 
        className="absolute w-64 h-64 bg-pink-100 rounded-full opacity-50 -bottom-10 -right-10 -z-20 animate-blob-reverse"
      />
    </div>
  );
};

export default HeroSection;