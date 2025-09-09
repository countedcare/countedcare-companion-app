
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, mfaState } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // Handle MFA state redirects
  if (mfaState === "verify" && location.pathname !== "/mfa-verify") {
    return <Navigate to="/mfa-verify" replace state={{ from: location }} />;
  }

  if (mfaState === "enroll" && location.pathname !== "/mfa-setup") {
    return <Navigate to="/mfa-setup" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
