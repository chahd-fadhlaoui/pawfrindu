import React from "react";
import HeroSection from "../components/HeroSection";
import CategoriesCards from "../components/CategoriesCards";
import About from "../components/About";
import TrainingService from "../components/TrainingService";

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
    </main>
  );
}