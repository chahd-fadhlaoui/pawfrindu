import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { posts } from './assets/posts'
import CandidatesPage from './pages/CandidatesPage'
import Footer from './components/Footer'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Myprofile from './pages/Myprofile'
import PetOwnerPosts from './pages/PetOwnerPosts'
import Pets from './pages/Pets'
import PetDetails from './pages/PetDetails'


export default function App() {

  return (
    <div className='mx-4 sm:max-[10%]:'>
      <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/pets' element={<Pets/>}/>
        <Route path='/pets/:category' element={<Pets/>}/>
        <Route path='/petsdetails/:id' element={<PetDetails/>}/>

        <Route path='/login' element={<Login/>}/>
        <Route path='/myprofile' element={<Myprofile/>}/>
        <Route path="/list" element={<PetOwnerPosts posts={posts} />} />
        <Route path="/candidates/:petId" element={<CandidatesPage />} />

      </Routes> 
      <Footer/>
    </div>
  )
}
