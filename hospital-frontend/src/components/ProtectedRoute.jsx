import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasAccess } from '../utils/rolePermissions';

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Checking access for path', location.pathname);

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentPath = `/${location.pathname.split('/')[1]}`;
  
  if (!hasAccess(user.role, currentPath)) {
    console.warn(`ProtectedRoute: Access denied for role ${user.role} to path ${currentPath}. Redirecting to dashboard.`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('ProtectedRoute: Access granted for', user.name);
  return <Outlet />;
}