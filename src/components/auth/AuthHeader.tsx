
import React from 'react';
import Logo from '@/components/Logo';

const AuthHeader = () => {
  return (
    <div className="w-full max-w-md mb-8 text-center">
      <Logo size="lg" className="justify-center mb-4" />
      <h1 className="text-2xl font-heading font-semibold text-gray-800 mb-2">
        Welcome to CountedCare
      </h1>
      <p className="text-gray-600">
        Track your caregiving expenses and maximize tax benefits
      </p>
    </div>
  );
};

export default AuthHeader;
