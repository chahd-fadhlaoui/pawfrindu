import React, { useState } from "react";
import dog from "../assets/dogCategory.png";
import cat from "../assets/CatCategory.png";
import other from "../assets/OtherCategory.png";
import veterinary from "../assets/PawCategory.png";

const CategoriesCards = () => {
  const categories = [
    { name: "Dogs", icon: dog, description: "Find loyal companions" },
    { name: "Cats", icon: cat, description: "Discover feline friends" },
    { name: "Other Animals", icon: other, description: "Unique pets await" },
    { name: "Veterinaries", icon: veterinary, description: "Expert pet care" },
  ];

  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="relative px-4 py-16 overflow-hidden bg-white">
      <div className="mx-auto mb-12 text-center max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 
          transform transition-all duration-700 hover:text-[#ffc929]">
          Find Your New Best Friend
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600">
          Browse through our diverse selection of pets and discover the perfect companion for your life
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6"> 
        {categories.map((category, index) => (  
          <div  
            key={index}  
            className={`
              bg-white border-2 border-pink-200 rounded-2xl p-6 text-center 
              cursor-pointer transition-all duration-500 ease-in-out 
              shadow-lg w-64 transform hover:scale-105 hover:border-[#ffc929]
              flex flex-col items-center group
              ${hoveredIndex === index ? "shadow-2xl" : ""}
            `}
            onMouseEnter={() => setHoveredIndex(index)}  
            onMouseLeave={() => setHoveredIndex(null)}  
          >  
            <div className="mb-4 p-4 bg-pink-50 rounded-full 
              transition-all duration-500 group-hover:bg-[#ffc929]/20">
              <img  
                src={category.icon}  
                alt={`${category.name} icon`}  
                className="w-16 h-16 transition-transform transform group-hover:scale-110" 
              />  
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 
              group-hover:text-[#ffc929] transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-gray-600">
              {category.description}
            </p>
            <div className="mt-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
              <span className="text-[#ffc929] font-medium">
                Explore →
              </span>
            </div>
          </div>  
        ))}  
      </div>

      {/* Decorative background elements */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-[#ffc929] 
        rounded-full opacity-20 -z-10 animate-blob"></div>
      <div className="absolute w-48 h-48 bg-pink-100 rounded-full -bottom-10 -right-10 opacity-30 -z-10 animate-blob-reverse"></div>
    </div>
  );
};

export default CategoriesCards;