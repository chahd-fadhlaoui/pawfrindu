import { ArrowRight, HandHeartIcon, Heart } from "lucide-react";
import React from "react";
import dogImage from '../assets/dogHero.png'
const PawIcon = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    style={style}
    fill="currentColor"
  >
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

const HeroSection = () => {
  // Floating paw animation background
  const PawBackground = () => {
    return Array(12)
      .fill(null)
      .map((_, index) => (
        <PawIcon
          key={index}
          className={`
          absolute w-10 h-10 opacity-10
          animate-float
          text-pink-300
          ${
            index % 3 === 0
              ? "top-1/4"
              : index % 3 === 1
              ? "top-1/2"
              : "top-3/4"
          }
          ${
            index % 4 === 0
              ? "left-1/4"
              : index % 4 === 1
              ? "left-1/2"
              : index % 4 === 2
              ? "left-3/4"
              : "left-1/3"
          }
        `}
          style={{
            animationDelay: `${index * 0.5}s`,
            transform: `rotate(${index * 30}deg)`,
          }}
        />
      ));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-pink-50">
      {/* Animated Paw Background */}
      <div className="absolute inset-0 overflow-hidden">
        <PawBackground />
      </div>

      <div className="relative grid grid-cols-1 gap-12 px-4 py-20 mx-auto max-w-7xl md:grid-cols-2 lg:py-32">
        {/* Content Section */}
        <div className="flex flex-col justify-center order-2 space-y-8 md:order-1 animate-fade-in-left">
          <div className="space-y-4">
            <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#f5abc8] rounded-full">
              <HandHeartIcon className="w-4 h-4 mr-2 text-[#ffc929]" />
              Find Your Perfect Companion
            </span>

            <h1 className="text-5xl font-bold tracking-tight text-gray-900 md:text-5xl group">
              <span className="block transition-all duration-300">
                Welcome To{" "}
                <i className="block mt-2 text-pink-500 transition-all duration-300 group-hover:scale-105">
                  PawFrindu
                </i>
              </span>
            </h1>
          </div>

          <p className="text-xl leading-relaxed text-gray-600">
            Discover a vibrant community dedicated to pet adoption, care, and
            welfare. Our platform connects compassionate pet lovers with furry
            friends seeking their forever homes.
          </p>

          <div className="flex gap-4">
            <button
              className="relative flex items-center gap-3 px-8 py-4 overflow-hidden text-white bg-pink-500 rounded-full group animate-pulse-slow"
              aria-label="Join PawFrindu Community"
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                Join Us Today
              </span>
              <ArrowRight className="relative z-10 transition-transform duration-300 group-hover:translate-x-2" />
              <div className="absolute inset-0 transition-transform duration-300 bg-[#ffc929] scale-x-0 group-hover:scale-x-100 origin-left" />
            </button>

            <button className="px-8 py-4 text-gray-700 transition-colors duration-300 border-2 border-gray-300 rounded-full hover:border-pink-500 hover:text-pink-500">
              Learn More
            </button>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative flex items-center justify-center order-1 md:order-2 animate-fade-in-right">
          <div className="relative w-full max-w-lg group">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 bg-pink-300 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#ffc929] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob-reverse" />
            <div className="absolute bottom-0 left-0 bg-purple-300 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob" />

            <img
              src={dogImage}
              alt="Happy dog ready for adoption"
              className="relative z-10 object-contain w-full h-auto transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;