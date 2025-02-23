import React, { useState } from "react";
import { ArrowRight, GraduationCap } from 'lucide-react';

const TrainingService = () => {  
  const trainingCategories = [  
    {  
      name: "Basic Training",  
      description: "Comprehensive training program focusing on essential obedience, socialization, and behavioral skills to help your pet become a well-mannered companion.",
      backgroundColor: "bg-pink-50",
      metrics: "500+ Trained Pets"
    },  
    {  
      name: "Medical Training",  
      description: "Specialized training designed to help pets become comfortable with medical procedures, reducing stress during veterinary visits and medical treatments.",
      backgroundColor: "bg-yellow-50",
      metrics: "98% Success Rate"
    },  
  ];  

  const [hoveredCard, setHoveredCard] = useState(null);

  return (  
    <section className="relative py-20 bg-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute text-6xl text-pink-200 transform top-20 left-10 opacity-20 -rotate-12">🐾</div>
        <div className="absolute text-6xl text-yellow-200 transform rotate-45 top-40 right-20 opacity-20">🐾</div>
        
        <div className="absolute top-0 left-0 bg-pink-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute bottom-0 right-0 bg-yellow-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl">
        <div className="mb-16 space-y-6 text-center">
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-pink-100 rounded-full shadow-sm">
            <GraduationCap className="w-4 h-4 mr-2 text-[#ffc929]" />
            Professional Training
          </span>

          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl group">
            <span className="block">Expert Training</span>
            <span className="block mt-2 text-pink-500">For Every Pet</span>
          </h2>

          <p className="max-w-2xl mx-auto text-xl leading-relaxed text-gray-600">
            Transform your pet into a well-behaved companion with our specialized training programs
          </p>
        </div>

        <div className="flex flex-col justify-center gap-8 md:flex-row">
          {trainingCategories.map((category, index) => (
            <div 
              key={index} 
              className={`relative w-full md:w-96 h-[500px] rounded-2xl shadow-lg 
                transition-all duration-500
                ${hoveredCard === index ? "scale-105 shadow-2xl" : ""}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div 
                className={`absolute inset-0 
                  transform transition-transform duration-500 
                  ${hoveredCard === index ? 'rotate-y-180' : ''}
                  ${category.backgroundColor}
                  rounded-2xl
                  flex flex-col items-center justify-center
                  backface-visibility-hidden`}
              >
                {/* Front of Card */}
                <div 
                  className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center
                    ${hoveredCard === index ? 'opacity-0' : 'opacity-100'}
                    transition-opacity duration-500`}
                >
                  <div className="p-4 mb-6 bg-white rounded-full shadow-md">
                    <GraduationCap className="w-24 h-24 text-gray-700 transition-transform duration-300 transform" />
                  </div>
                  <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white rounded-full">
                    {category.metrics}
                  </span>
                </div>

                {/* Back of Card */}
                <div 
                  className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center
                    ${hoveredCard === index ? 'opacity-100' : 'opacity-0'}
                    transition-opacity duration-500
                    rotate-y-180`}
                >
                  <p className="mb-6 text-lg leading-relaxed text-gray-700">
                    {category.description}
                  </p>
                  <button 
                    className="bg-pink-500 text-white px-6 py-3 rounded-full 
                    hover:bg-[#ffc929] hover:text-gray-900
                    transition-all duration-300 
                    transform hover:scale-110 
                    flex items-center gap-2"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );  
};

export default TrainingService;