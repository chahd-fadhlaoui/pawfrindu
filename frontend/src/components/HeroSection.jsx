import React from 'react';  
import dogsection from "../assets/dogHero.png";  
import Pawbg from "../assets/Paw-bg.png";  

const HeroSection = () => {  
  return (  
    <div className="relative overflow-hidden bg-white">
      <div className="grid grid-cols-1 gap-8 px-4 py-16 mx-auto max-w-7xl md:grid-cols-2 lg:py-24">
        <div className="flex flex-col justify-center order-2 space-y-6 md:order-1 animate-fade-in-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 
            transform transition-all duration-700 hover:scale-105 hover:text-[#ffc929]">
            Welcome to PawFrindu
          </h1>
          <p className="text-lg text-gray-600 delay-300 animate-bounce-in-left">
            Discover a vibrant community committed to pet adoption, care, and welfare. Our platform allows you to find a wide array of pets ready for adoption, ensuring you find the right companion for your family.
          </p>
          <div>
            <button className="bg-[#ffc929] text-gray-900 px-6 py-3 rounded-full 
              hover:bg-pink-500 hover:text-white 
              transition-all duration-300 
              transform hover:scale-110 
              flex items-center gap-2 
              animate-pulse-slow">
              Join Us Today
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-bounce-x" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative flex items-center justify-center order-1 md:order-2 animate-fade-in-right">
          <div className="relative group">
            <img 
              src={Pawbg} 
              alt="Background" 
              className="absolute -z-10 -left-10 -top-10 w-full max-w-[500px] opacity-20 
                group-hover:rotate-6 transition-transform duration-500"
            />
            <img 
              src={dogsection} 
              alt="Pet Adoption" 
              className="z-10 object-contain h-auto max-w-full transition-transform duration-500 transform group-hover:scale-110 group-hover:rotate-3"
            />
          </div>
        </div>
      </div>
      
      {/* Decorative background elements with animations */}
      <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#ffc929] rounded-full 
        opacity-30 -z-20 animate-blob"></div>
      <div className="absolute w-64 h-64 bg-pink-100 rounded-full opacity-50 -bottom-10 -right-10 -z-20 animate-blob-reverse"></div>
    </div>
  );  
};  

export default HeroSection;