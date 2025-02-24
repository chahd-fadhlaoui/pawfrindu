// components/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingWrapper from './LoadingWrapper'; // Import your LoadingWrapper

const PublicRoute = ({ children, restrictedRoles = [] }) => {
  const { user, loading } = useApp();

  if (loading) {
    return <LoadingWrapper loading={loading}><div /></LoadingWrapper>; // Use LoadingWrapper
  }

  if (user) {
    // If authenticated but not PetOwner, redirect to role-specific dashboard
    if (user.role !== "PetOwner") {
      console.log(`PublicRoute: User role ${user.role} not allowed, redirecting`);
      return <Navigate to={{
        "Admin": "/admin",
        "Trainer": "/trainer",
        "Vet": "/vet"
      }[user.role] || "/login"} replace />;
    }
    // PetOwner can stay
    return children;
  }

  // Non-authenticated users can access
  return children;
};

export default PublicRoute;