import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';
import Layout from '@/components/Layout';
import { WelcomeHeader } from '@/components/home/WelcomeHeader';
import { ProgressTracker } from '@/components/home/ProgressTracker';
import { TransactionTriage } from '@/components/home/TransactionTriage';
import { QuickAddGrid } from '@/components/home/QuickAddGrid';
import { AITipCard } from '@/components/home/AITipCard';
import { RecentActivity } from '@/components/home/RecentActivity';
import ReceiptCaptureModal from '@/components/ReceiptCaptureModal';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useSupabaseProfile();
  const [showReceiptModal, setShowReceiptModal] = useState(false);

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

  if (!profile || !user) {
    return (
      <Layout>
        <div className="container-padding py-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="space-y-6 pb-24">
          {/* Welcome Header */}
          <WelcomeHeader profile={profile} />
          
          {/* Progress Tracker */}
          <ProgressTracker profile={profile} />
          
          {/* Transaction Triage */}
          <TransactionTriage />
          
          {/* Quick Add Grid */}
          <QuickAddGrid onOpenReceiptModal={() => setShowReceiptModal(true)} />
          
          {/* AI Tip of the Day */}
          <AITipCard />
          
          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>
      
      <ReceiptCaptureModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        onExpenseAdded={() => setShowReceiptModal(false)}
      />
    </Layout>
  );
};

export default Home;