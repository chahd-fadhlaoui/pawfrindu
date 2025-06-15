import { ChevronRight, Heart, PawPrint, Sparkles, Star } from "lucide-react";
import { useMemo } from "react";

const RightPanel = ({ mode, handleModeSwitch, isTransitioning }) => {

  const getPanelContent = useMemo(() => {
    switch (mode) {
      case "login":
        return {
          icon: (
            <div className="relative inline-block">
              <PawPrint className="w-12 h-12 text-white sm:w-14 lg:w-16 sm:h-14 lg:h-16 animate-bounce" />
              <Sparkles className="absolute w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-yellow-300 -top-1 sm:-top-1.5 lg:-top-2 -right-1 sm:-right-1.5 lg:-right-2 animate-pulse" />
            </div>
          ),
          title: "Welcome to PawFrindu!",
          description:
            "Sign in to continue your journey in helping pets find their forever homes.",
          buttonText: "Create Account",
        };
      case "signup":
        return {
          icon: (
            <div className="relative inline-block">
              <Heart className="w-12 h-12 text-white sm:w-14 lg:w-16 sm:h-14 lg:h-16 animate-pulse" />
              <Star className="absolute w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-yellow-300 -top-1 sm:-top-1.5 lg:-top-2 -right-1 sm:-right-1.5 lg:-right-2 animate-spin-slow" />
            </div>
          ),
          title: "Already a Member?",
          description:
            "Sign in to access your account and continue making a difference.",
          buttonText: "Sign In",
        };
      default:
        return {
          icon: (
            <Star className="w-12 h-12 text-white sm:w-14 lg:w-16 sm:h-14 lg:h-16 animate-spin-slow" />
          ),
          title: "Welcome Back!",
          description: "Sign in to continue your journey.",
          buttonText: "Sign In",
        };
    }
  }, [mode]);

  const getTransformClass = () => {
    if (!isTransitioning) return "translate-x-0 scale-100";
    return mode === "signup"
      ? "translate-x-full scale-95"
      : "-translate-x-full scale-95";
  };

  return (
    <div className="h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-[#ffc929] via-orange-400 to-pink-500 transition-all duration-500 ease-in-out will-change-transform ${
              isTransitioning ? "scale-102 blur-sm" : "scale-100 blur-none"
            }`}
          />
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
        </div>

        <div className="relative flex flex-col items-center justify-center h-full p-6 text-center sm:p-8 lg:p-10">
          <div className={`transition-all duration-500 ease-in-out transform ${getTransformClass()}`}>
            <div className="mb-6 transition-all duration-500 ease-out sm:mb-8 lg:mb-10 hover:scale-105 hover:rotate-2">
              {getPanelContent.icon}
            </div>

            <h2
              className={`mb-4 sm:mb-5 lg:mb-6 text-2xl sm:text-2.5xl lg:text-3xl font-bold text-white transition-all duration-500 ease-out delay-100 transform ${
                isTransitioning ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
              }`}
              style={{ fontSize: "clamp(1.5rem, 4vw, 1.875rem)" }}
            >
              {getPanelContent.title}
            </h2>
            <p
              className={`max-w-xs sm:max-w-sm lg:max-w-md mx-auto mb-6 sm:mb-8 lg:mb-10 text-base sm:text-lg lg:text-xl text-white/90 transition-all duration-500 ease-out delay-200 transform ${
                isTransitioning ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
              }`}
              style={{ fontSize: "clamp(0.875rem, 3vw, 1.25rem)" }}
            >
              {getPanelContent.description}
            </p>

            <button
              onClick={() => handleModeSwitch(mode === "login" ? "signup" : "login")}
              disabled={isTransitioning}
              className={`relative px-8 py-3.5 sm:px-10 sm:py-4 overflow-hidden font-medium bg-white rounded-lg text-neutral-900 transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-lg active:scale-95 min-h-[48px] min-w-[48px] group ${
                isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}
              aria-label={
                mode === "login" ? "Switch to sign up" : "Switch to sign in"
              }
            >
              <span className="relative z-10 flex items-center gap-2">
                {getPanelContent.buttonText}
                <ChevronRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out transform translate-y-full bg-[#ffc929]/10 group-hover:translate-y-0" />
            </button>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute transition-all duration-700 ease-in-out transform ${
              isTransitioning ? "scale-105 rotate-4" : "scale-100 rotate-0"
            }`}
          >
            <div className="absolute w-64 h-64 border-2 rounded-full sm:w-80 lg:w-96 sm:h-80 lg:h-96 border-white/20 -top-32 sm:-top-40 lg:-top-48 -right-32 sm:-right-40 lg:-right-48 animate-spin-slower" />
            <div className="absolute w-80 sm:w-96 lg:w-[32rem] h-80 sm:h-96 lg:h-[32rem] border-2 rounded-full border-white/20 -bottom-40 sm:-bottom-48 lg:-bottom-64 -left-40 sm:-left-48 lg:-left-64 animate-spin-slow" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;