// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useApp();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to /login");
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("ProtectedRoute: Role not allowed, redirecting to /forbidden");
    return <Navigate to="/forbidden" replace state={{ denied: true }} />;
  }

  return children;
};

export default ProtectedRoute;