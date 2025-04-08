
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface OwnerRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'manageUsers' | 'manageAccess' | 'viewLogs' | 'manageDoors';
}

const OwnerRoute: React.FC<OwnerRouteProps> = ({ children, requiredPermission }) => {
  const { isAuthenticated, isOwner, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Owner always has access
  if (isAuthenticated && isOwner) {
    return <>{children}</>;
  }
  
  // Check for specific permission if not owner
  if (isAuthenticated && requiredPermission && user?.permissions?.[requiredPermission]) {
    return <>{children}</>;
  }

  // Default redirect if not authenticated or doesn't have permission
  return <Navigate to="/dashboard" replace />;
};

export default OwnerRoute;
