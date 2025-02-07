import React, { useState } from "react";  
import basicTrainingIcon from "../assets/service-3.png";  
import medicalTrainingIcon from "../assets/service-5.png";  

export default function TrainingService() {  
  const trainingCategories = [  
    {  
      name: "Basic Training",  
      icon: basicTrainingIcon,  
      description:  
        "Basic training for pets involves teaching essential commands and behaviors to establish good manners and communication between pets and their owners. This training typically includes commands such as sit, stay, come, and heel, helping pets understand expectations and build positive habits. Early socialization and positive reinforcement play crucial roles in ensuring pets become well-adjusted and obedient companions.",  
    },  
    {  
      name: "Medical Training",  
      icon: medicalTrainingIcon,  
      description:  
        "Medical training for pets focuses on familiarizing animals with veterinary procedures and handling to reduce stress during visits. This training covers basic health care skills, such as accepting vaccinations, handling exams, and maintaining calm during medical assessments. By using positive reinforcement techniques, owners can help their pets feel comfortable and cooperative in a clinical setting.",  
    },  
  ];  

  const [flippedStates, setFlippedStates] = useState(Array(trainingCategories.length).fill(false));  

  const handleFlip = (index) => {  
    const newFlippedStates = [...flippedStates];  
    newFlippedStates[index] = !newFlippedStates[index];  
    setFlippedStates(newFlippedStates);  
  };  
  
  return (  
    <div className="flex flex-col items-center p-5 bg-[#FDF2D9] min-h-screen">  
      <h1 className="mb-1 text-3xl font-bold">Training Services</h1>  
      <h2 className="mt-0 mb-4 text-xl">Choose your training type</h2>  

      <div className="flex justify-center gap-10 mt-4">  
        {trainingCategories.map((category, index) => (  
          <div key={index} className="relative w-80 h-80 bg-white border-2 border-[#efaeef] rounded-lg shadow-md overflow-hidden perspective">  
            {/* Front Side */}  
            <div className={`absolute w-full h-full transition-transform duration-700 transform ${flippedStates[index] ? "rotate-y-180" : ""}`}>  
              <div className="flex flex-col justify-center items-center w-full h-full backface-hidden">  
                <img  
                  src={category.icon}  
                  alt={`${category.name} icon`}  
                  className="w-20 h-20 mb-3"  
                />  
                <h3 className="text-xl font-semibold">{category.name}</h3>  
                <div className="mt-3 cursor-pointer text-2xl text-blue-500 hover:text-blue-700" onClick={() => handleFlip(index)}>  
                  &#9654; {/* Flèche vers la droite */}  
                </div>  
              </div>  
            </div>  
            {/* Back Side */}  
            <div className={`absolute w-full h-full transition-transform duration-700 transform ${flippedStates[index] ? "" : "rotate-y-180"} backface-hidden flex flex-col justify-center items-center`}>  
              <p className="px-4 py-2 text-sm text-center">{category.description}</p>  
              <div className="mt-3 cursor-pointer text-2xl text-blue-500 hover:text-blue-700" onClick={() => handleFlip(index)}>  
                &#9664; {/* Flèche vers la gauche */}  
              </div>  
            </div>  
          </div>  
        ))}  
      </div>  
    </div>  
  );  
}