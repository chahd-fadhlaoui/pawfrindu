import React, { useState } from "react";
import { ArrowRight } from 'lucide-react';
import basicTrainingIcon from "../assets/service-3.png";  
import medicalTrainingIcon from "../assets/service-5.png";  

export default function TrainingService() {  
  const trainingCategories = [  
    {  
      name: "Basic Training",  
      icon: basicTrainingIcon,  
      description: "Comprehensive training program focusing on essential obedience, socialization, and behavioral skills to help your pet become a well-mannered companion.",
      backgroundColor: "bg-[#faeacf]"
    },  
    {  
      name: "Medical Training",  
      icon: medicalTrainingIcon,  
      description: "Specialized training designed to help pets become comfortable with medical procedures, reducing stress during veterinary visits and medical treatments.",
      backgroundColor: "bg-[#ffbfca]"
    },  
  ];  

  const [hoveredCard, setHoveredCard] = useState(null);

  return (  
    <div className="relative py-16 overflow-hidden bg-white">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 
            transform transition-all duration-700 hover:text-[#ffc929]">
            Training Services
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Specialized training to help your pet become a confident, well-adjusted companion
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
                    <img
                      src={category.icon}
                      alt={`${category.name} icon`}
                      className="w-24 h-24 transition-transform duration-300 transform"
                    />
                  </div>
                  <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                    {category.name}
                  </h3>
                </div>

                {/* Back of Card */}
                <div 
                  className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center
                    ${hoveredCard === index ? 'opacity-100' : 'opacity-0'}
                    transition-opacity duration-500
                    rotate-y-180`}
                >
                  <p className="mb-6 text-base leading-relaxed text-gray-700">
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

      {/* Decorative background elements */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-[#ffc929] 
        rounded-full opacity-20 -z-10 animate-blob"></div>
      <div className="absolute w-48 h-48 bg-pink-100 rounded-full -bottom-10 -right-10 opacity-30 -z-10 animate-blob-reverse"></div>
    </div>
  );  
}