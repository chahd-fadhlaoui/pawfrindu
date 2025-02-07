import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'

export default function App() {
  return (
    <div className='mx-4 sm:max-[10%]:'>
      <Routes>
        <Route path='/' element={<Home/>}/>

      </Routes> 
    </div>
  )
}
