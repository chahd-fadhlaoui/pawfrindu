import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import CandidatesPage from './pages/CandidatesPage'
import Home from './pages/Home'
import Login from './pages/Login'
import Myprofile from './pages/Myprofile'
import PetDetails from './pages/PetDetails'
import PetOwnerPosts from './pages/PetOwnerPosts'
import Pets from './pages/Pets'
import Veteriniandetail from './pages/Veteriniandetail'


export default function App() {

  return (
    <div className='mx-4 sm:max-[10%]:'>
      <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/pets' element={<Pets/>}/>
        <Route path='/pets/:category' element={<Pets/>}/>
        <Route path='/petsdetails/:petId' element={<PetDetails/>}/>

        <Route path='/login' element={<Login/>}/>
        <Route path='/myprofile' element={<Myprofile/>}/>
        <Route path="/list" element={<PetOwnerPosts/>} />
        <Route path="/candidates/:petId" element={<CandidatesPage />} />


        <Route path='/veterinian/:petId' element={<Veteriniandetail/>}/>

      </Routes> 
      <Footer/>
    </div>
  )
}
