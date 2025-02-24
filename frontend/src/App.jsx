// App.jsx
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
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
import TrainerDashboard from './pages/Trainer/TrainerDashboard';
import { VetDashboard } from './pages/Vet/VetDashboard';
import { useApp } from './context/AppContext';
import Forbidden from './pages/Forbidden';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useApp();

  if (loading) {
    return <div>Loading...</div>;
  }

  const isAdminPage = location.pathname.startsWith('/admin');
  const isTrainerPage = location.pathname.startsWith('/trainer');
  const isVetPage = location.pathname.startsWith('/vet');
  const isHomePage = location.pathname === '/';
  const isForbiddenPage = location.pathname === '/forbidden'; // Check for forbidden page

  // Show Header and Footer only for non-authenticated users or PetOwner on home page, and not on /forbidden
  const showHeaderFooter = 
    (!user || user.role === "PetOwner") && 
    !isAdminPage && 
    !isTrainerPage && 
    !isVetPage && 
    !isForbiddenPage; // Exclude /forbidden

  return (
    <div className='mx-4 sm:max-[10%]'>
      {showHeaderFooter && <Header />}
      {children}
      {showHeaderFooter && <Footer />}
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Only non-authenticated or PetOwner */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />
      <Route path="/pets" element={<Pets />} />
      <Route path="/pets/:category" element={<Pets />} />
      <Route path="/petsdetails/:petId" element={<PetDetails />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPasswordConfirmation />} />
      <Route path="/forbidden" element={<Forbidden />} />

      {/* Protected Routes */}
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={["Admin"]}><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/trainer"
        element={<ProtectedRoute allowedRoles={["Trainer"]}><TrainerDashboard /></ProtectedRoute>}
      />
      <Route
        path="/vet"
        element={<ProtectedRoute allowedRoles={["Vet"]}><VetDashboard /></ProtectedRoute>}
      />
      <Route
        path="/addPet"
        element={<ProtectedRoute allowedRoles={["PetOwner"]}><CreatePet /></ProtectedRoute>}
      />
      <Route
        path="/list"
        element={<ProtectedRoute allowedRoles={["PetOwner"]}><PetOwnerPosts /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute allowedRoles={["PetOwner", "Trainer", "Vet"]}><Profile /></ProtectedRoute>}
      />
      <Route
        path="/myprofile"
        element={<ProtectedRoute allowedRoles={["PetOwner", "Trainer", "Vet"]}><CreateProfile /></ProtectedRoute>}
      />
      <Route
        path="/candidates/:petId"
        element={<ProtectedRoute allowedRoles={["PetOwner", "Trainer", "Vet"]}><CandidatesPage /></ProtectedRoute>}
      />
      <Route
        path="/veterinian/:petId"
        element={<ProtectedRoute allowedRoles={["Vet"]}><Veteriniandetail /></ProtectedRoute>}
      />
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