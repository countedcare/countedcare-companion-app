
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Since we removed authentication, just render the children directly
  return <>{children}</>;
};

export default ProtectedRoute;
