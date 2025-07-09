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
    onboardingComplete: false
  });

  useEffect(() => {
    if (loading) return;
    
    if (user) {
      // User is authenticated
      if (localUser.onboardingComplete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } else {
      // User is not authenticated, show auth screen
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