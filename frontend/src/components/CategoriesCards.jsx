import React, { useState } from "react";  
import dog from "../assets/dogCategory.png";  
import cat from "../assets/CatCategory.png";  
import other from "../assets/OtherCategory.png";  
import veterinary from "../assets/PawCategory.png";  

const CategoriesCards = () => {  
  // Définition des catégories  
  const categories = [  
    { name: "Dogs", icon: dog },  
    { name: "Cats", icon: cat },  
    { name: "Other Animals", icon: other },  
    { name: "Veterinaries", icon: veterinary },  
  ];  

  const [hoveredIndex, setHoveredIndex] = useState(null);  

  return (  
    <div className="flex flex-col items-center p-5 bg-gray-100 gap-5"> {/* Container principal */}  
      <h1 className="mb-1 text-lg font-bold">Find your new best friend</h1>  
      <h2 className="mt-0 mb-4 text-base text-gray-600">Browse pets from our platform</h2>  

      <div className="flex justify-center gap-5 mt-2 w-full"> {/* Conteneur des cartes */}  
        {categories.map((category, index) => (  
          <div  
            key={index}  
            className={`bg-white border-2 border-pink-300 rounded-lg p-5 text-center cursor-pointer transition-all duration-300 ease-in-out shadow-md flex-none h-30 w-36 flex flex-col items-center   
              ${hoveredIndex === index ? "transform -translate-y-1 shadow-lg" : ""}`} // Carte  
            onMouseEnter={() => setHoveredIndex(index)}  
            onMouseLeave={() => setHoveredIndex(null)}  
          >  
            <div className="text-5xl"> {/* Style de l'icône */}  
              <img  
                src={category.icon}  
                alt={`${category.name} icon`}  
                className="w-12 h-12" // Dimension de l'image  
              />  
            </div>  
            <h3 className="mt-2 text-lg font-medium">{category.name}</h3> {/* Nom de la catégorie */}  
          </div>  
        ))}  
      </div>  
    </div>  
  );  
};  

export default CategoriesCards;