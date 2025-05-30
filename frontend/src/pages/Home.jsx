import React from "react";
import About from "../components/Home/About";
import HeroSection from "../components/Home/HeroSection";
import CategoriesCards from "../components/Home/CategoriesCards";
import TrainingService from "../components/Home/TrainingService";
import Chatbot from "../components/Home/Chatbot";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Categories Section */}
      <div className="relative z-10">
        <CategoriesCards />
      </div>
      
      {/* About Section */}
      <div className="relative z-10">
        <About />
      </div>
      
      {/* Training Service Section */}
      <div className="relative z-10">
        <TrainingService />
      </div>

       {/* Chatbot - Fixed position in bottom right */}
       <Chatbot />
    </main>
  );
}