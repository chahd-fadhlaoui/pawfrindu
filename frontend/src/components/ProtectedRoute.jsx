import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingWrapper from './LoadingWrapper';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading && !user) {
    return <LoadingWrapper loading={loading}><div /></LoadingWrapper>;
  }

  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to /login from", location.pathname);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Normalize role to match backend schema
  const normalizedRole =
    user.role === "Pet Owner" ? "PetOwner" :
    user.role === "Veterinarian" ? "Vet" :
    user.role === "Pet Trainer" ? "Trainer" :
    user.role;

  console.log("ProtectedRoute: Checking access", {
    userRole: user.role,
    normalizedRole,
    allowedRoles,
    currentPath: location.pathname,
  });

  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    console.log(`ProtectedRoute: Role ${normalizedRole} not allowed for ${location.pathname}`);
    // Redirect to pending approval if Vet or Trainer and not active
    if (normalizedRole === "Vet" && !user.isActive) {
      return <Navigate to="/vet-pending-approval" replace />;
    }
    if (normalizedRole === "Trainer" && !user.isActive) {
      return <Navigate to="/trainer-pending-approval" replace />;
    }
    // Redirect to appropriate dashboard or forbidden
    const redirectTo = {
      Admin: "/admin",
      SuperAdmin: "/admin",
      Trainer: "/trainer",
      Vet: "/vet",
      PetOwner: "/",
    }[normalizedRole] || "/forbidden";
    console.log(`ProtectedRoute: Redirecting ${normalizedRole} to ${redirectTo}`);
    return <Navigate to={redirectTo} replace state={{ denied: true }} />;
  }

  return <LoadingWrapper loading={loading}>{children}</LoadingWrapper>;
};

export default ProtectedRoute;