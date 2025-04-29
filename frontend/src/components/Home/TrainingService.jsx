import { ArrowRight, HandHeartIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { trainingCategories } from "../../assets/trainer";

const TrainingCard = ({ category }) => {
  const CategoryIcon = category.icon;
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <div
      className={`
        relative w-full md:w-96 h-[500px] bg-white rounded-3xl
        border border-gray-100 shadow-md hover:shadow-xl
        overflow-hidden transition-all duration-300 hover:scale-[1.02]
        cursor-pointer group focus:outline-none focus:ring-2 focus:ring-pink-300
      `}
      onMouseEnter={!isMobile ? () => setIsFlipped(true) : null}
      onMouseLeave={!isMobile ? () => setIsFlipped(false) : null}
      onClick={isMobile ? handleFlip : null}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Toggle details for ${category.name}`}
      aria-expanded={isFlipped}
    >
      <div
        className={`absolute inset-0 transform transition-transform duration-500 perspective-1000 ${
          isFlipped ? "rotate-y-180 scale-105" : ""
        } rounded-3xl backface-visibility-hidden`}
      >
        {/* Front of Card */}
        <div
          className={`
            absolute inset-0 flex flex-col items-center justify-between p-10 text-center
            ${category.backgroundGradient} rounded-3xl
            ${isFlipped ? "opacity-0" : "opacity-100"} transition-opacity duration-500
          `}
        >
          <div className="relative mt-8">
            <div className="w-24 h-24 p-5 transition-all duration-500 transform rounded-full bg-gradient-to-br from-yellow-50 to-pink-50 group-hover:from-yellow-100 group-hover:to-pink-100 group-hover:rotate-6">
              <CategoryIcon className="w-full h-full text-gray-700 transition-transform duration-300 group-hover:scale-110" />
            </div>
            {/* Sparkle decoration */}
            <div className="absolute transition-all duration-300 -right-4 -top-4">
              <span className="absolute text-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 animate-ping">
                ✨
              </span>
              <span className="text-2xl transition-all duration-500 opacity-0 group-hover:opacity-100">
                ✨
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-pink-500">
              {category.name}
            </h3>
            <p className="text-sm font-medium text-gray-600">{category.tagline}</p>
            <span className="inline-block px-4 py-1 text-xs font-medium text-pink-500 rounded-full bg-pink-50">
              Tap to Learn More
            </span>
          </div>
          <div className="h-8" /> {/* Increased Spacer */}
        </div>

        {/* Back of Card */}
        <div
          className={`
            absolute inset-0 flex flex-col items-center justify-center p-10 text-center
            ${category.backgroundGradient} rounded-3xl
            ${isFlipped ? "opacity-100" : "opacity-0"} transition-opacity duration-500 rotate-y-180
          `}
        >
          <p className="mb-8 text-lg leading-relaxed text-gray-800">
            {category.description}
          </p>
          <button
            className={`
              relative flex items-center gap-3 px-8 py-4 text-white
              bg-pink-500 rounded-full overflow-hidden
              transition-all duration-300 group-hover:bg-[#ffc929]
              hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-300 animate-pulse-slow
            `}
            aria-label={`Learn more about ${category.name}`}
          >
            <span className="relative z-10 text-lg font-medium transition-transform duration-300 group-hover:translate-x-1">
              Learn More
            </span>
            <ArrowRight className="relative z-10 w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
            <div className="absolute inset-0 bg-[#ffc929] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

const TrainingService = () => {


  return (
    <section className="relative py-20 bg-white">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute text-6xl text-pink-200 transform top-20 left-10 opacity-20 -rotate-12">
          🐾
        </div>
        <div className="absolute text-6xl text-yellow-200 transform rotate-45 top-40 right-20 opacity-20">
          🐾
        </div>
        <div className="absolute text-6xl text-pink-200 transform bottom-20 left-1/4 opacity-20 rotate-12">
          🐾
        </div>
        <div className="absolute top-0 left-0 bg-pink-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute bottom-0 right-0 bg-yellow-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />
      </div>

      {/* Content Container */}
      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 space-y-6 text-center">
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-pink-100 rounded-full shadow-sm">
            <HandHeartIcon className="w-4 h-4 mr-2 text-[#ffc929]" />
            Expert Pet Training
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Training Programs</span>
            <span className="block mt-2 text-pink-500">For Every Pet</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl leading-relaxed text-gray-600">
            Transform your pet into a confident, well-trained companion with our
            specialized training programs designed for all skill levels.
          </p>
        </div>

        {/* Training Cards */}
        <div className="flex flex-col justify-center gap-8 md:flex-row md:gap-12">
          {trainingCategories.map((category) => (
            <TrainingCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrainingService;