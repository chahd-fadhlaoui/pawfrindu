import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingWrapper from './LoadingWrapper';

const PublicRoute = ({ children, restrictedRoles = [] }) => {
  const { user, loading } = useApp();

  if (loading) {
    return <LoadingWrapper loading={loading}><div /></LoadingWrapper>;
  }

  if (user) {
    // Normalize role for comparison
    const normalizedRole = user.role === "Pet Owner" ? "PetOwner" : user.role;
    if (restrictedRoles.includes(normalizedRole)) {
      console.log(`PublicRoute: User role ${user.role} not allowed, redirecting`);
      return <Navigate to={{
        "Admin": "/admin",
        "Trainer": "/trainer",
        "Vet": "/vet",
        "PetOwner": "/"
      }[normalizedRole] || "/login"} replace />;
    }
  }

  // Non-authenticated users can access
  return children;
};

export default PublicRoute;