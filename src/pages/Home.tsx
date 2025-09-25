import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';
import Layout from '@/components/Layout';
import { EnhancedWelcomeHeader } from '@/components/home/EnhancedWelcomeHeader';
import { ProgressTracker } from '@/components/home/ProgressTracker';
import { TransactionTriage } from '@/components/home/TransactionTriage';
import { QuickAddGrid } from '@/components/home/QuickAddGrid';
import { InteractiveDashboard } from '@/components/home/InteractiveDashboard';
import { EnhancedRecentActivity } from '@/components/home/EnhancedRecentActivity';
import { PersonalizedInsights } from '@/components/home/PersonalizedInsights';
import { SignInLoadingExperience } from '@/components/home/SignInLoadingExperience';
import GettingStartedChecklist from '@/components/help/GettingStartedChecklist';
import InteractiveTutorial from '@/components/help/InteractiveTutorial';
import ReceiptCaptureModal from '@/components/ReceiptCaptureModal';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useSupabaseProfile();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showLoadingExperience, setShowLoadingExperience] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showChecklist, setShowChecklist] = useState(true);

  // Redirect to onboarding if not completed (only after profile loads)
  React.useEffect(() => {
    if (profile && !profile.onboarding_complete) {
      navigate('/onboarding');
    }
  }, [profile, navigate]);

  // SEO
  React.useEffect(() => {
    document.title = 'CountedCare – Your Caregiving Dashboard';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Track caregiving expenses, manage tax deductions, and review transactions in one place.');
  }, []);

  // Show loading experience on first load
  React.useEffect(() => {
    if (user && profile) {
      const hasSeenLoading = sessionStorage.getItem('hasSeenLoadingExperience');
      if (hasSeenLoading) {
        setShowLoadingExperience(false);
      }
    }
  }, [user, profile]);

  const handleLoadingComplete = () => {
    setShowLoadingExperience(false);
    sessionStorage.setItem('hasSeenLoadingExperience', 'true');
  };

  if (!profile || !user) {
    return (
      <Layout>
        <div className="container-padding py-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show engaging loading experience for first-time or returning users
  if (showLoadingExperience) {
    return <SignInLoadingExperience onComplete={handleLoadingComplete} />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="space-y-6 pb-24">
          {/* Getting Started Checklist */}
          {showChecklist && (
            <div className="container-padding">
              <GettingStartedChecklist onClose={() => setShowChecklist(false)} />
            </div>
          )}
          
          <div data-tour="dashboard-content">
            {/* Enhanced Welcome Header */}
            <EnhancedWelcomeHeader profile={profile} />
            
            {/* Tutorial Trigger */}
            <div className="container-padding">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTutorial(true)}
                className="mb-4 flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Take a Complete Tour
              </Button>
            </div>
            
            {/* Progress Tracker */}
            <div data-tour="progress-tracker">
              <ProgressTracker profile={profile} />
            </div>
            
            {/* Interactive Dashboard */}
            <div data-tour="dashboard">
              <InteractiveDashboard />
            </div>
            
            {/* Transaction Triage */}
            <div data-tour="transaction-triage">
              <TransactionTriage />
            </div>
            
            {/* Personalized Insights */}
            <PersonalizedInsights />
            
            {/* Quick Add Grid */}
            <div data-tour="quick-actions">
              <QuickAddGrid onOpenReceiptModal={() => setShowReceiptModal(true)} />
            </div>
            
            {/* Enhanced Recent Activity */}
            <div data-tour="recent-activity">
              <EnhancedRecentActivity />
            </div>
          </div>
        </div>
      </div>
      
      <ReceiptCaptureModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        onExpenseAdded={() => setShowReceiptModal(false)}
      />
      
      {/* Interactive Tutorial */}
      {showTutorial && (
        <InteractiveTutorial
          tutorialId="complete-onboarding"
          onComplete={() => setShowTutorial(false)}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </Layout>
  );
};

export default Home;