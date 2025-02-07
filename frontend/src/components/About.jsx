import React from "react";  

import about1 from "../assets/about-1.jpg";  
import about1icon from "../assets/about-1-icon.png";  
import about2 from "../assets/about-2.jpg";  
import about2icon from "../assets/about-2-icon.png";  
import about3 from "../assets/about-3.jpg";  
import about3icon from "../assets/about-3-icon.png";  

const About = () => {  
  return (  
    <section className="py-8 bg-white" id="about"> {/* Section principale */}  
      <p className="text-center text-lg text-gray-800 mb-2">About Us</p>  
      <h2 className="text-center text-3xl font-bold text-gray-900 mb-8">What we can do for you</h2>  

      {/* Premier Bloc */}  
      <div className="flex items-center mb-8">  
        <img src={about1} alt="about" className="flex-1" style={{ width: '450px' }} /> {/* Image de gauche */}  
        <div className="flex-1 text-left"> {/* Contenu de droite */}  
          <div className="flex flex-col items-center mb-4"> {/* Containers pour l'icône et le texte */}  
            <span className="flex justify-center items-center bg-[#fdf2d9] rounded-full w-16 h-16 mb-2"> {/* Icône */}  
              <img src={about1icon} alt="about-icon" className="max-w-8" />  
            </span>  
            <h4 className="text-xl font-medium text-gray-800 text-center ml-4"> {/* margin-left ajoutée */}  
              Let us help you with pet adoption  
            </h4>  
          </div>  
          <p className="text-gray-600 text-base max-w-md leading-relaxed text-center ml-20"> {/* margin-left identique */}  
            Our dedicated team is here to guide you through the adoption process and help you find your perfect companion.  
          </p>  
        </div>  
      </div>  

      {/* Deuxième Bloc */}  
      <div className="flex items-center mb-8">  
        <div className="flex-1 text-left"> {/* Contenu de gauche */}  
          <div className="flex flex-col items-center mb-4">  
            <span className="flex justify-center items-center bg-[#e8f7fe] rounded-full w-16 h-16 mb-2"> {/* Icône */}  
              <img src={about2icon} alt="about-icon" className="max-w-8" />  
            </span>  
            <h4 className="text-xl font-medium text-gray-800 text-center ml-4"> {/* margin-left identique */}  
              Helping You Find Lost Pets  
            </h4>  
          </div>  
          <p className="text-gray-600 text-base max-w-md leading-relaxed text-center ml-20"> {/* margin-left identique */}  
            If your furry friend goes missing, our compassionate team is here to assist you in the search and provide resources to help reunite you with your beloved pet.  
          </p>  
        </div>  
        <img src={about2} alt="about" className="flex-1" style={{ width: '450px' }} /> {/* Image de droite */}  
      </div>  

      {/* Troisième Bloc */}  
      <div className="flex items-center mb-8">  
        <img src={about3} alt="about" className="flex-1" style={{ width: '450px' }} /> {/* Image de gauche */}  
        <div className="flex-1 text-left"> {/* Contenu de droite */}  
          <div className="flex flex-col items-center mb-4">  
            <span className="flex justify-center items-center bg-[#fbebf1] rounded-full w-16 h-16 mb-2"> {/* Icône */}  
              <img src={about3icon} alt="about-icon" className="max-w-8" />  
            </span>  
            <h4 className="text-xl font-medium text-gray-800 text-center ml-4"> {/* margin-left identique */}  
              Finding the Right Veterinary Care  
            </h4>  
          </div>  
          <p className="text-gray-600 text-base max-w-md leading-relaxed text-center ml-20"> {/* margin-left identique */}  
            Our dedicated team is here to help you find the perfect veterinary services for your pets, ensuring they receive compassionate care and the medical attention they need in a comfortable environment.  
          </p>  
        </div>  
      </div>  
    </section>  
  );  
};  

export default About;