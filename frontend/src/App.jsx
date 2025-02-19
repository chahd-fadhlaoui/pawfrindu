import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ResetPasswordConfirmation from './components/auth/ResetPasswordConfirmation';
import Footer from './components/Footer';
import Header from './components/Header';
import AppContextProvider from './context/AppContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import Auth from './pages/Auth';
import CandidatesPage from './pages/CandidatesPage';
import CreateProfile from './pages/CreateProfile';
import Home from './pages/Home';
import PetDetails from './pages/PetDetails';
import PetOwnerPosts from './pages/PetOwnerPosts';
import Pets from './pages/Pets';
import Profile from './pages/Profile';
import Veteriniandetail from './pages/Veteriniandetail';
import CreatePet from './pages/CreatePet';

// Create a layout component to handle the header and footer
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className='mx-4 sm:max-[10%]'>
      {!isAdminPage && <Header />}
      {children}
      <Footer />
    </div>
  );
};

// Main App component with routes
const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/addPet' element={<CreatePet/>} />

      <Route path='/pets' element={<Pets />} />
      <Route path='/pets/:category' element={<Pets />} />
      <Route path='/petsdetails/:petId' element={<PetDetails />} />
      <Route path='/login' element={<Auth />} />
      <Route path='/profile' element={<Profile />} />
      <Route path="/list" element={<PetOwnerPosts />} />
      <Route path="/candidates/:petId" element={<CandidatesPage />} />
      <Route path="/reset-password" element={<ResetPasswordConfirmation />} />
      <Route path="/myprofile" element={<CreateProfile />} />
      <Route path='/admin' element={<AdminDashboard />} />
      <Route path='/veterinian/:petId' element={<Veteriniandetail />} />
    </Routes>
  );
};

// Root App component wrapped with AppContextProvider
export default function App() {
  return (
    <AppContextProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AppContextProvider>
  );
}