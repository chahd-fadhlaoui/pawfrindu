import React from "react";
import { ChevronRight, Heart, Star, Sparkles, PawPrint } from "lucide-react";

const RightPanel = ({ mode, handleModeSwitch, isTransitioning, direction }) => {
  const getPanelContent = () => {
    switch (mode) {
      case "login":
        return {
          icon: (
            <div className="relative inline-block">
              <PawPrint className="w-16 h-16 text-white animate-bounce" />
              <Sparkles className="absolute w-6 h-6 text-yellow-300 -top-2 -right-2 animate-pulse" />
            </div>
          ),
          title: "Welcome to PawFrindu!",
          description: "Sign in to continue your journey in helping pets find their forever homes.",
          buttonText: "Create Account",
        };
      case "signup":
        return {
          icon: (
            <div className="relative inline-block">
              <Heart className="w-16 h-16 text-white animate-pulse" />
              <Star className="absolute w-6 h-6 text-yellow-300 -top-2 -right-2 animate-spin-slow" />
            </div>
          ),
          title: "Already a Member?",
          description: "Sign in to access your account and continue making a difference.",
          buttonText: "Sign In",
        };
      default:
        return {
          icon: <Star className="w-16 h-16 text-white animate-spin-slow" />,
          title: "Welcome Back!",
          description: "Sign in to continue your journey.",
          buttonText: "Sign In",
        };
    }
  };

  const content = getPanelContent();

  const getTransformClass = () => {
    if (!isTransitioning) return "translate-x-0 scale-100";
    return direction === "right" 
      ? "translate-x-full scale-90"
      : "-translate-x-full scale-90";
  };

  return (
    <div className="h-full">
      <div className="relative w-full h-full overflow-hidden">
        {/* Gradient background with enhanced transition */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 bg-gradient-to-br from-[#ffc929] via-orange-400 to-pink-500 
            transition-all duration-1000 ease-in-out will-change-transform ${
            isTransitioning ? 'scale-110 blur-sm' : 'scale-100 blur-none'
          }`} />
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
        </div>
        
        {/* Content with enhanced staggered animations */}
        <div className="relative flex flex-col items-center justify-center h-full p-8 text-center">
          <div className={`transition-all duration-1000 ease-in-out transform ${getTransformClass()}`}>
            {/* Icon with enhanced hover effect */}
            <div className="mb-8 transition-all duration-500 ease-out hover:scale-110 hover:rotate-3">
              {content.icon}
            </div>

            {/* Text Content with improved staggered fade */}
            <h2 className={`mb-4 text-3xl font-bold text-white transition-all duration-700 ease-out delay-100 transform
              ${isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
              {content.title}
            </h2>
            <p className={`max-w-md mb-8 text-lg text-white/90 transition-all duration-700 ease-out delay-200 transform
              ${isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
              {content.description}
            </p>

            {/* Button with enhanced hover animation */}
            <button
              onClick={() => handleModeSwitch(mode === "login" ? "signup" : "login")}
              disabled={isTransitioning}
              className={`relative px-8 py-3 overflow-hidden font-medium bg-white rounded-lg group text-neutral-900 
                transition-all duration-700 ease-out transform hover:scale-105 hover:shadow-lg active:scale-95
                ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {content.buttonText}
                <ChevronRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-2" />
              </span>
              <div className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out transform translate-y-full bg-[#ffc929]/10 group-hover:translate-y-0" />
            </button>
          </div>
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute transition-all duration-1000 ease-in-out transform ${
            isTransitioning ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
          }`}>
            <div className="absolute border-2 rounded-full w-96 h-96 border-white/20 -top-48 -right-48 animate-spin-slower" />
            <div className="absolute w-[32rem] h-[32rem] border-2 rounded-full border-white/20 -bottom-64 -left-64 animate-spin-slow" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;