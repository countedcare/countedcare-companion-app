import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User } from '@/types/User';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [localUser] = useLocalStorage<User>('countedcare-user', {
    name: '',
    email: '',
    isCaregiver: true,
    onboardingComplete: false,
  });

  useEffect(() => {
    if (loading) return;

    const urlParams = new URLSearchParams(window.location.search);
    const isPasswordRecovery = urlParams.get('type') === 'recovery';

    if (isPasswordRecovery) {
      // Send user directly to reset password page
      navigate('/reset-password' + window.location.search);
      return;
    }

    if (user) {
      if (localUser.onboardingComplete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } else {
      navigate('/auth');
    }
  }, [user, loading, localUser.onboardingComplete, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
};

export default Index;
