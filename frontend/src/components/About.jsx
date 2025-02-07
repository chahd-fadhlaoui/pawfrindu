import React from "react";  

import about1 from "../assets/about-1.jpg";  
import about1icon from "../assets/about-1-icon.png";  
import about2 from "../assets/about-2.jpg";  
import about2icon from "../assets/about-2-icon.png";  
import about3 from "../assets/about-3.jpg";  
import about3icon from "../assets/about-3-icon.png";  

const About = () => {  
  const sections = [
    {
      image: about1,
      icon: about1icon,
      bgColor: "bg-[#fdf2d9]",
      title: "Let us help you with pet adoption",
      description: "Our dedicated team is here to guide you through the adoption process and help you find your perfect companion.",
      reverse: false
    },
    {
      image: about2,
      icon: about2icon,
      bgColor: "bg-[#e8f7fe]",
      title: "Helping You Find Lost Pets",
      description: "If your furry friend goes missing, our compassionate team is here to assist you in the search and provide resources to help reunite you with your beloved pet.",
      reverse: true
    },
    {
      image: about3,
      icon: about3icon,
      bgColor: "bg-[#fbebf1]",
      title: "Finding the Right Veterinary Care",
      description: "Our dedicated team is here to help you find the perfect veterinary services for your pets, ensuring they receive compassionate care and the medical attention they need in a comfortable environment.",
      reverse: false
    }
  ];

  return (  
    <section className="relative py-16 overflow-hidden bg-white">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 
            transform transition-all duration-700 hover:text-[#ffc929]">
            What We Can Do For You
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Discover how PawFrindu supports you and your pets at every step of the journey
          </p>
        </div>

        {sections.map((section, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between mb-16 
              ${section.reverse ? 'flex-row-reverse' : 'flex-row'}
              group`}
          >
            <div className="w-1/2 p-4">
              <img 
                src={section.image} 
                alt={section.title} 
                className="w-full transition-transform duration-500 transform shadow-lg rounded-2xl group-hover:scale-105"
              />
            </div>
            <div className="w-1/2 p-8">
              <div className="flex flex-col items-center mb-6">
                <span 
                  className={`flex justify-center items-center 
                    ${section.bgColor} rounded-full w-20 h-20 mb-4
                    transition-all duration-500 
                    group-hover:bg-[#ffc929]/20`}
                >
                  <img 
                    src={section.icon} 
                    alt="about-icon" 
                    className="transition-transform transform max-w-10 group-hover:scale-110"
                  />
                </span>
                <h3 
                  className="text-2xl font-semibold text-gray-900 mb-4 
                  group-hover:text-[#ffc929] transition-colors text-center"
                >
                  {section.title}
                </h3>
                <p className="max-w-md text-base leading-relaxed text-center text-gray-600">
                  {section.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Decorative background elements */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-[#ffc929] 
        rounded-full opacity-20 -z-10 animate-blob"></div>
      <div className="absolute w-48 h-48 bg-pink-100 rounded-full -bottom-10 -right-10 opacity-30 -z-10 animate-blob-reverse"></div>
    </section>
  );  
};  

export default About;