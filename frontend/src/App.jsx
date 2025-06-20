import "leaflet/dist/leaflet.css";
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
import LostAndFound from "./pages/LostAndFound";
import LostPetForm from "./pages/LostPetForm";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentSuccess from "./pages/PaymentSuccess";
import PetDetails from './pages/PetDetails';
import PetManagementDashboard from './pages/PetManagementDashboard';
import Pets from './pages/Pets';
import Profile from './pages/Profile';
import PetFinderForm from "./pages/ReportFoundPet";
import TrainerDashboard from './pages/Trainer/TrainerDashboard/TrainerDashboard';
import TrainerDetails from "./pages/Trainer/TrainerUserSide/TrainerDetails";
import TrainerPendingApproval from './pages/Trainer/TrainerUserSide/TrainerPendingApproval';
import Trainers from "./pages/Trainer/TrainerUserSide/Trainers";
import VetDashboard from './pages/vet/VetDashboardManagment/VetDashboard';
import VetPendingApproval from './pages/vet/VetDashboardManagment/VetPendingApproval';
import MyVetappointments from './pages/vet/VetUserAppointment/MyVetappointments';
import VetDetails from './pages/vet/VetUserAppointment/VetDetails';
import Veterinarians from './pages/vet/VetUserAppointment/Veterinarians';
import MyReports from "./pages/MyReports";

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useApp(); 

  const isAdminPage = location.pathname.startsWith('/admin');
  const isTrainerPage = location.pathname === '/trainer' ;
  const isVetPage = location.pathname === '/vet';
    const isHomePage = location.pathname === '/';
  const isForbiddenPage = location.pathname === '/forbidden';
  const isAdminLoginPage = location.pathname === '/AdminLoginPage';
  const isVetPendingPage = location.pathname === '/vet-pending-approval'; 
  const isTrainerPendingPage = location.pathname === '/trainer-pending-approval'; 



  const showHeaderFooter = 
    (!user || user.role === "PetOwner") && 
    !isAdminPage && 
    !isTrainerPage && 
    !isVetPage && 
    !isForbiddenPage && 
    !isAdminLoginPage &&
    !isVetPendingPage &&
    !isTrainerPendingPage ;


 
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
      <Route path="/trainers" element={<Trainers/>} />
      <Route path="/lost-and-found" element={<PublicRoute><LostAndFound /></PublicRoute>} />
      <Route path="/report-found-pet" element={<PublicRoute><PetFinderForm /></PublicRoute>} />
      <Route path="/report-lost-pet" element={<PublicRoute><LostPetForm /></PublicRoute>} />

      <Route path="/vet/:id" element={<VetDetails />} />
      <Route path="/trainer/:id" element={<TrainerDetails />} />
      <Route path="/pets/:species" element={<Pets />} />
      <Route path="/petsdetails/:petId" element={<PetDetails />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/AdminLoginPage" element={<AdminLoginPage />} />

      <Route path="/reset-password" element={<ResetPasswordConfirmation />} />
      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["Admin","SuperAdmin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/trainer" element={<ProtectedRoute allowedRoles={["Trainer"]}><TrainerDashboard /></ProtectedRoute>} />
      <Route path="/trainer-pending-approval" element={<ProtectedRoute allowedRoles={["Trainer"]}><TrainerPendingApproval/></ProtectedRoute>} /> 
      <Route path="/vet" element={<ProtectedRoute allowedRoles={["Vet"]}><VetDashboard /></ProtectedRoute>} />
      <Route path="/vet-pending-approval" element={<ProtectedRoute allowedRoles={["Vet"]}><VetPendingApproval/></ProtectedRoute>} /> 
      <Route path="/addPet" element={<ProtectedRoute allowedRoles={["PetOwner"]}><CreatePet /></ProtectedRoute>} />
      <Route path="/list/*" element={<ProtectedRoute allowedRoles={["PetOwner"]}><PetManagementDashboard /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute allowedRoles={["PetOwner"]}><MyVetappointments/></ProtectedRoute>} /> 
      <Route path="/reports" element={<ProtectedRoute allowedRoles={["PetOwner"]}><MyReports/></ProtectedRoute>} /> 
      <Route path="/profile" element={<ProtectedRoute allowedRoles={["PetOwner", "Trainer", "Vet"]}><Profile /></ProtectedRoute>} />
      <Route path="/myprofile" element={<ProtectedRoute allowedRoles={["PetOwner", "Trainer", "Vet"]}><CreateProfile /></ProtectedRoute>} />
      <Route path="/candidates/:petId" element={<ProtectedRoute allowedRoles={["PetOwner", "Trainer", "Vet"]}><CandidatesPage /></ProtectedRoute>} />
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