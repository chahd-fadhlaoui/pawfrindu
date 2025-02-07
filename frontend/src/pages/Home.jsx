import React from 'react'
import About from '../components/About'
import CategoriesCards from '../components/CategoriesCards'
import Footer from '../components/Footer'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import TrainingService from '../components/TrainingService'

export default function Home() {
  return (
    <div>
      <HeroSection/>
      <CategoriesCards/>
     <About/> 
     <TrainingService/>
    </div>
  )
}
