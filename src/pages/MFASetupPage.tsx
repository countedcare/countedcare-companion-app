import React from 'react';
import { useNavigate } from 'react-router-dom';
import MFASetup from '@/components/auth/MFASetup';
import AuthHeader from '@/components/auth/AuthHeader';

const MFASetupPage = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral">
      <AuthHeader />
      <MFASetup onComplete={handleComplete} />
      <div className="mt-4 text-sm text-gray-500">
        <p>© 2025 CountedCare. All rights reserved.</p>
      </div>
    </div>
  );
};

export default MFASetupPage;