import React, { useContext, useEffect, useState } from 'react';  
import { useParams } from 'react-router-dom';  
import { AppContext } from '../context/AppContext';  

export default function Pet() {  
  const { category } = useParams();  
  const { pets } = useContext(AppContext);  

  const [filterPet, setFilterPet] = useState([]);  

  const applyFilter = () => {  
    if (category) {  
      setFilterPet(pets.filter(pet => pet.category === category));  
    } else {  
      setFilterPet(pets);  
    }  
  };  

  useEffect(() => {  
    applyFilter();  
  }, [pets, category]);  

  return (  
    <div className="p-4">  
      <p className="mb-4">Browse through the pets categories.</p>  
      <div>  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">  
          {filterPet.map((item, index) => (  
            <div key={index} className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500">  
              <img  
                className="w-full h-48 object-contain m-auto" // Changed to object-contain for full visibility  
                src={item.image}  
                alt={item.name}  
                onError={(e) => {  
                  e.target.onerror = null;  
                  e.target.src = 'path_to_placeholder_image';  // Replace with your placeholder image path  
                }}  
              />  
              <div className='p-4'>  
                <p className='text-gray-900 text-lg font-medium'>{item.name}</p>  
                <p className='text-gray-600 text-sm'>{item.category}</p>  
              </div>  
            </div>  
          ))}  
        </div>  
      </div>  
    </div>  
  );  
}