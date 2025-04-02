
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
  }, [isAuthenticated, requireAuth, currentUser, requireProfileComplete, isLoading, toast]);

  if (isLoading) {
    // Improved loading state with spinner
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your information...</p>
        </div>
      </div>
    );
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
