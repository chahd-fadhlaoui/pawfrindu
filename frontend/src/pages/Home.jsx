import React from "react";
import About from "../components/About";
import CategoriesCards from "../components/CategoriesCards";
import HeroSection from "../components/HeroSection";
import TrainingService from "../components/TrainingService";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CategoriesCards />
      <About />
      <TrainingService />
    </main>
  );
}