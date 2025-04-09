// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingWrapper from './LoadingWrapper';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useApp();

  // If still loading and no user yet, show loading state without unmounting children
  if (loading && !user) {
    return <LoadingWrapper loading={loading}><div /></LoadingWrapper>;
  }

  // Once loading is done, check user and role
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to /login");
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("ProtectedRoute: Role not allowed, redirecting to /forbidden");
    return <Navigate to="/forbidden" replace state={{ denied: true }} />;
  }

  // Render children with loading overlay if still fetching data
  return (
    <LoadingWrapper loading={loading}>
      {children}
    </LoadingWrapper>
  );
};

export default ProtectedRoute;