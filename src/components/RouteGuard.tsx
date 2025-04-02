
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfileComplete?: boolean;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requireAuth = false,
  requireProfileComplete = false
}) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkRouteAccess = () => {
      if (requireAuth && !isAuthenticated && !isLoading) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to access this page.',
          variant: 'destructive',
        });
      }

      if (requireProfileComplete && 
          isAuthenticated && 
          currentUser && 
          !currentUser.profileComplete) {
        toast({
          title: 'Profile Incomplete',
          description: 'Please complete your profile to continue.',
          variant: 'destructive',
        });
      }
    };

    checkRouteAccess();
  }, [isAuthenticated, requireAuth, currentUser, requireProfileComplete, isLoading]);

  if (isLoading) {
    // Loading state - could return a loader component here
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (requireAuth && !isAuthenticated) {
    // Redirect to login if authentication is required but user is not authenticated
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireProfileComplete && isAuthenticated && currentUser && !currentUser.profileComplete) {
    // Redirect to profile completion if required but profile is not complete
    return <Navigate to="/profile-completion" state={{ from: location.pathname }} replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default RouteGuard;
