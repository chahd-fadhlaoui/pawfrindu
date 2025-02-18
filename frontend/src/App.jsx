import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import AdminDashboard from './pages/admin/AdminDashboard'
import CandidatesPage from './pages/CandidatesPage'
import CreateProfile from './pages/CreateProfile'
import Home from './pages/Home'
import Login from './pages/Login'
import PetDetails from './pages/PetDetails'
import PetOwnerPosts from './pages/PetOwnerPosts'
import Pets from './pages/Pets'
import Profile from './pages/Profile'
import Veteriniandetail from './pages/Veteriniandetail'


export default function App() {

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className='mx-4 sm:max-[10%]:'>
      {!isAdminPage && <Header />} {/* Afficher le Header sauf sur /admin */}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/pets' element={<Pets/>}/>
        <Route path='/pets/:category' element={<Pets/>}/>
        <Route path='/petsdetails/:petId' element={<PetDetails/>}/>

        <Route path='/login' element={<Login/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path="/list" element={<PetOwnerPosts/>} />
        <Route path="/candidates/:petId" element={<CandidatesPage />} />
        <Route path="/myprofile" element={<CreateProfile />}/>

        <Route path='/admin' element={<AdminDashboard/>}/>
        <Route path='/veterinian/:petId' element={<Veteriniandetail/>}/>

      </Routes> 
      <Footer/>
    </div>
  )
}
