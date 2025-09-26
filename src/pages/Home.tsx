import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';
import { useExpenseData } from '@/hooks/useExpenseData';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
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
  const { expenses, stats } = useExpenseData();
  const { accounts } = useLinkedAccounts();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showLoadingExperience, setShowLoadingExperience] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showChecklist, setShowChecklist] = useState(true);

  // Calculate completion for checklist logic
  const recipients = [];
  const completedCount = [
    profile?.name && profile?.email && profile?.household_agi,
    recipients.length > 0,
    accounts.length > 0,
    expenses.length > 0,
    profile?.household_agi && profile?.household_agi > 0
  ].filter(Boolean).length;
  
  const items = [1, 2, 3, 4, 5]; // Mock for calculation

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
        <div className="space-y-4 pb-24 animate-fade-in">
          {/* Getting Started Checklist - More compact and contextual */}
          {showChecklist && (completedCount < items.length) && (
            <div className="container-padding pt-2">
              <GettingStartedChecklist onClose={() => setShowChecklist(false)} />
            </div>
          )}
          
          <div data-tour="dashboard-content" className="space-y-6">
            {/* Enhanced Welcome Header */}
            <div className="animate-scale-in">
              <EnhancedWelcomeHeader profile={profile} />
            </div>
            
            {/* Tutorial Trigger - Better positioned */}
            {!showTutorial && completedCount >= 2 && (
              <div className="container-padding">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTutorial(true)}
                  className="mb-2 flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
                >
                  <Play className="h-4 w-4" />
                  Take a Complete Tour
                </Button>
              </div>
            )}
            
            {/* Progress Tracker - Only show if user has some progress */}
            {stats.total > 0 && (
              <div data-tour="progress-tracker" className="animate-slide-in-right">
                <ProgressTracker profile={profile} />
              </div>
            )}
            
            {/* Interactive Dashboard - Optimized for performance */}
            <div data-tour="dashboard" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <InteractiveDashboard />
            </div>
            
            {/* Transaction Triage - Only show if user has linked accounts */}
            {accounts.length > 0 && (
              <div data-tour="transaction-triage" className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <TransactionTriage />
              </div>
            )}
            
            {/* Personalized Insights - Conditional rendering */}
            {stats.total >= 3 && (
              <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <PersonalizedInsights />
              </div>
            )}
            
            {/* Quick Add Grid */}
            <div data-tour="quick-actions" className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <QuickAddGrid onOpenReceiptModal={() => setShowReceiptModal(true)} />
            </div>
            
            {/* Enhanced Recent Activity - Only show if there are expenses */}
            {stats.total > 0 && (
              <div data-tour="recent-activity" className="animate-fade-in" style={{ animationDelay: '1s' }}>
                <EnhancedRecentActivity />
              </div>
            )}
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