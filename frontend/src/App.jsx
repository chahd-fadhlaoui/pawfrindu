import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Pets from './pages/Pets'
import Login from './pages/Login'
import Myprofile from './pages/Myprofile'
import Header from './components/Header'
import Footer from './components/Footer'


export default function App() {
  return (
    <div className='mx-4 sm:max-[10%]:'>
      <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/pets' element={<Pets/>}/>
        <Route path='/pets/:category' element={<Pets/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/myprofile' element={<Myprofile/>}/>
      </Routes> 
      <Footer/>
    </div>
  )
}
