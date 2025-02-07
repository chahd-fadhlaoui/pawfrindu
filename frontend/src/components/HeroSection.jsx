import React from 'react';  
import dogsection from "../assets/dogHero.png";  
import Pawbg from "../assets/Paw-bg.png";  

const HeroSection = () => {  
  return (  
    <header className="w-full py-8 mt-10 relative isolate bg-[#f3cbfc] mx-0"> {/* width: 100%, Suppression des marges horizontales */}  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 w-full h-screen"> {/* height pleine de l'écran pour le centrage */}   
        <div className="relative isolate flex justify-center items-center">  
          <img  
            src={Pawbg}  
            alt="header-bg"  
            className="absolute top-1/2 left-0 transform -translate-y-1/2 max-w-[300px] z-[-1]"  // headerImageBg style  
          />  
          <img src={dogsection} alt="header" className="max-w-[400px] mx-auto" /> {/* headerImageImg style */}  
        </div>  
        <div className="flex flex-col items-center justify-center h-full"> {/* Center content vertically and horizontally, h-full pour prendre toute la hauteur */}  
          <h1 className="text-3xl font-bold mb-4 text-center">   
            <span className="text-5xl">PawFrindu</span>  
          </h1>  
          <h2 className="text-lg font-semibold mb-4 text-center text-[#333]">We love pets like you do 😊</h2>  
          <p className="mb-8 text-center text-[#666]">  
            This platform is here to help you to find your soul friend!    
          </p>  
          <div className="flex">  
            <button className="flex items-center gap-2 px-3 py-2 mx-auto rounded-full bg-[#333] text-white transition duration-300 ease-in-out hover:bg-[#666]">  
              Adopt friend!  
              <span className="flex items-center justify-center rounded-full bg-[#333] p-1">  
                <i className="ri-arrow-right-line"></i>  
              </span>  
            </button>  
          </div>  
        </div>  
      </div>  
      <div className="absolute bottom-0 left-0 w-full h-12 bg-white z-[-1]"></div> {/* headerBottom style */}  
    </header>  
  );  
};  

export default HeroSection;