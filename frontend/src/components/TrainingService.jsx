import React, { useState } from "react";  
import basicTrainingIcon from "../assets/service-3.png";  
import medicalTrainingIcon from "../assets/service-5.png";  

export default function TrainingService() {  
  const trainingCategories = [  
    {  
      name: "Basic Training",  
      icon: basicTrainingIcon,  
      description:  
        "Basic training for pets involves teaching essential commands and behaviors to establish good manners and communication between pets and their owners. This training typically includes commands such as sit, stay, come, and heel, helping pets understand expectations and build positive habits.",  
      backgroundColor: "bg-[#fdf2d9]"
    },  
    {  
      name: "Medical Training",  
      icon: medicalTrainingIcon,  
      description:  
        "Medical training for pets focuses on familiarizing animals with veterinary procedures and handling to reduce stress during visits. This training covers basic health care skills, such as accepting vaccinations, handling exams, and maintaining calm during clinical assessments.",  
      backgroundColor: "bg-[#e8f7fe]"
    },  
  ];  

  const [activeCard, setActiveCard] = useState(null);  

  return (  
    <div className="relative py-16 overflow-hidden bg-white">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 
            transform transition-all duration-700 hover:text-[#ffc929]">
            Training Services
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Specialized training to help your pet become a confident, well-adjusted companion
          </p>
        </div>

        <div className="flex justify-center gap-8">
          {trainingCategories.map((category, index) => (
            <div 
              key={index} 
              className={`
                relative w-96 h-[500px] rounded-2xl shadow-lg 
                transform transition-all duration-500 
                ${activeCard === index 
                  ? "scale-105 shadow-2xl z-10" 
                  : "hover:scale-105 hover:shadow-xl"}
                ${category.backgroundColor}
              `}
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 mb-6 bg-white rounded-full shadow-md">
                  <img
                    src={category.icon}
                    alt={`${category.name} icon`}
                    className="w-24 h-24 transition-transform duration-300 transform group-hover:scale-110"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 
                  transform transition-transform duration-300 
                  group-hover:text-[#ffc929]">
                  {category.name}
                </h3>
                <p className="mb-6 text-base leading-relaxed text-gray-700">
                  {category.description}
                </p>
                <button 
                  className="bg-[#ffc929] text-gray-900 px-6 py-3 rounded-full 
                  hover:bg-pink-500 hover:text-white 
                  transition-all duration-300 
                  transform hover:scale-110 
                  flex items-center gap-2"
                >
                  Learn More
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
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