
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBetaAccess } from '@/hooks/useBetaAccess';
import BetaPaymentWall from './BetaPaymentWall';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasBetaAccess, loading: betaLoading, refreshBetaAccess } = useBetaAccess();

  if (authLoading || betaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Allow access to beta-success page even without beta access
  if (window.location.pathname === '/beta-success') {
    return <>{children}</>;
  }

  if (!hasBetaAccess) {
    return <BetaPaymentWall onPaymentSuccess={refreshBetaAccess} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
