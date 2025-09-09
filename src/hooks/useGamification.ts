import { useState, useEffect } from 'react';
import { 
  BADGE_DEFINITIONS, 
  CHALLENGE_TEMPLATES, 
  WEEKLY_MISSION_TEMPLATES, 
  DAILY_TIPS,
  Badge, 
  Challenge, 
  WeeklyMission, 
  UserProgress 
} from '@/types/Gamification';
import { Expense } from '@/types/User';
import { useSupabaseGamification } from '@/hooks/useSupabaseGamification';

export const useGamification = (expenses: Expense[]) => {
  const { userProgress, updateUserProgress, loading } = useSupabaseGamification();
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [instantFeedback, setInstantFeedback] = useState<{
    show: boolean;
    message: string;
    type: 'expense' | 'receipt' | 'badge' | 'streak' | 'mission';
  }>({
    show: false,
    message: '',
    type: 'expense'
  });

  // Transform Supabase data to local format
  const safeUserProgress: UserProgress = {
    totalExpenses: expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
    expenseCount: expenses?.length || 0,
    currentStreak: userProgress?.currentStreak || 0,
    longestStreak: userProgress?.bestStreak || 0,
    categoriesUsed: [...new Set(expenses?.map(exp => exp.category) || [])],
    badgesEarned: [],
    challengesCompleted: [],
    level: userProgress?.level || 1,
    experiencePoints: userProgress?.totalXP || 0,
    lastActivity: userProgress?.lastActivityDate || new Date().toISOString(),
    weeklyMissions: [],
    lastMissionReset: new Date().toISOString(),
    tipsRead: [],
    lastTipDate: ''
  };

  const getAllBadges = (): Badge[] => {
    return BADGE_DEFINITIONS.map(badge => ({
      ...badge,
      unlocked: false
    }));
  };

  const acceptChallenge = (challengeId: string) => {
    const template = CHALLENGE_TEMPLATES.find(t => t.title === challengeId);
    if (!template) return;

    const newChallenge: Challenge = {
      ...template,
      id: Date.now().toString(),
      active: true,
      startDate: new Date().toISOString()
    };

    setActiveChallenges(prev => [...(prev || []), newChallenge]);
  };

  const completeChallenge = (challengeId: string) => {
    setActiveChallenges(prev => 
      (prev || []).map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, completedAt: new Date().toISOString() }
          : challenge
      )
    );
    setShowConfetti(true);
    setInstantFeedback({
      show: true,
      message: 'Challenge completed! You\'re building amazing habits!',
      type: 'mission'
    });
  };

  const getAvailableChallenges = (): Challenge[] => {
    const activeIds = (activeChallenges || []).map(c => c.title);
    return CHALLENGE_TEMPLATES
      .filter(template => !activeIds.includes(template.title))
      .map(template => ({
        ...template,
        id: template.title,
        active: false
      }));
  };

  const markTipAsRead = (tipId: string) => {
    setInstantFeedback({
      show: true,
      message: 'Great job learning something new today!',
      type: 'expense'
    });
  };

  const showExpenseFeedback = () => {
    setInstantFeedback({
      show: true,
      message: 'You just added a deductible expense! Keep it up!',
      type: 'expense'
    });
  };

  const showReceiptFeedback = () => {
    setInstantFeedback({
      show: true,
      message: 'Receipt scanned successfully! Great record keeping!',
      type: 'receipt'
    });
  };

  return {
    userProgress: safeUserProgress,
    badges: getAllBadges(),
    activeChallenges: activeChallenges || [],
    availableChallenges: getAvailableChallenges(),
    newBadges,
    showConfetti,
    instantFeedback,
    acceptChallenge,
    completeChallenge,
    markTipAsRead,
    showExpenseFeedback,
    showReceiptFeedback,
    setShowConfetti,
    setNewBadges,
    setInstantFeedback: (feedback) => setInstantFeedback(feedback)
  };
};