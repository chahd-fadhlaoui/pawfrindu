import React from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import CategoriesCards from '../components/CategoriesCards'
import About from '../components/About'
import TrainingService from '../components/TrainingService'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div>
      <Header/>
      <HeroSection/>
      <CategoriesCards/>
     <About/> 
     <TrainingService/>
     <Footer/>
    </div>
  )
}
