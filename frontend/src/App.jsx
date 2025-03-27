// App.jsx
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ResetPasswordConfirmation from './components/auth/ResetPasswordConfirmation';
import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AppContextProvider, { useApp } from './context/AppContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import Auth from './pages/Auth';
import CandidatesPage from './pages/CandidatesPage';
import CreatePet from './pages/CreatePet';
import CreateProfile from './pages/CreateProfile';
import Forbidden from './pages/Forbidden';
import Home from './pages/Home';
import PetDetails from './pages/PetDetails';
import PetManagementDashboard from './pages/PetManagementDashboard';
import Pets from './pages/Pets';
import Profile from './pages/Profile';
import TrainerDashboard from './pages/Trainer/TrainerDashboard';
import  VetDashboard from './pages/VetDashboard/VetDashboard';
import Veteriniandetail from './pages/Veteriniandetail';
import Veterinarians from './pages/VetAppointment/Veterinarians';
import VetDetails from './pages/VetAppointment/VetDetails';
import "leaflet/dist/leaflet.css";
import VetPendingApproval from './pages/VetDashboard/VetPendingApproval';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useApp(); 

  const isAdminPage = location.pathname.startsWith('/admin');
  const isTrainerPage = location.pathname.startsWith('/trainer');
  const isVetPage = location.pathname === '/vet';
    const isHomePage = location.pathname === '/';
  const isForbiddenPage = location.pathname === '/forbidden';
  const isAdminLoginPage = location.pathname === '/AdminLoginPage';
  const isVetPendingPage = location.pathname === '/vet-pending-approval'; // Add this check


  const showHeaderFooter = 
    (!user || user.role === "PetOwner") && 
    !isAdminPage && 
    !isTrainerPage && 
    !isVetPage && 
    !isForbiddenPage && 
    !isAdminLoginPage &&
    !isVetPendingPage;


 
  return (
<div className="mx-4 sm:max-[10%]">
      {showHeaderFooter && <Header />}
      <div className="transition-opacity duration-300 ease-in-out">
        {children}
      </div>
      {showHeaderFooter && <Footer />}
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/pets" element={<Pets />} />
      <Route path="/vets" element={<Veterinarians/>} />
      <Route path="/vet/:id" element={<VetDetails />} />
      <Route path="/pets/:species" element={<Pets />} />
      <Route path="/petsdetails/:petId" element={<PetDetails />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/AdminLoginPage" element={<AdminLoginPage />} />

      <Route path="/reset-password" element={<ResetPasswordConfirmation />} />
      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/trainer" element={<ProtectedRoute allowedRoles={["Trainer"]}><TrainerDashboard /></ProtectedRoute>} />
      <Route path="/vet" element={<ProtectedRoute allowedRoles={["Vet"]}><VetDashboard /></ProtectedRoute>} />
      <Route path="/vet-pending-approval" element={<ProtectedRoute allowedRoles={["Vet"]}><VetPendingApproval/></ProtectedRoute>} /> {/* Add this route */}
      <Route path="/addPet" element={<ProtectedRoute allowedRoles={["PetOwner"]}><CreatePet /></ProtectedRoute>} />
      <Route path="/list" element={<ProtectedRoute allowedRoles={["PetOwner"]}><PetManagementDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={["PetOwner", "Trainer", "Vet"]}><Profile /></ProtectedRoute>} />
      <Route path="/myprofile" element={<ProtectedRoute allowedRoles={["PetOwner", "Trainer", "Vet"]}><CreateProfile /></ProtectedRoute>} />
      <Route path="/candidates/:petId" element={<ProtectedRoute allowedRoles={["PetOwner", "Trainer", "Vet"]}><CandidatesPage /></ProtectedRoute>} />
      <Route path="/veterinian/:petId" element={<ProtectedRoute allowedRoles={["Vet"]}><Veteriniandetail /></ProtectedRoute>} />
    </Routes>
  );
};

export default function App() {
  return (
    <AppContextProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AppContextProvider>
  );
}