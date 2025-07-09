
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
import useLocalStorage from '@/hooks/useLocalStorage';

export const useGamification = (expenses: Expense[]) => {
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>('countedcare-progress', {
    totalExpenses: 0,
    expenseCount: 0,
    currentStreak: 0,
    longestStreak: 0,
    categoriesUsed: [],
    badgesEarned: [],
    challengesCompleted: [],
    level: 1,
    experiencePoints: 0,
    lastActivity: new Date().toISOString(),
    weeklyMissions: [],
    lastMissionReset: new Date().toISOString(),
    tipsRead: [],
    lastTipDate: ''
  });

  const [activeChallenges, setActiveChallenges] = useLocalStorage<Challenge[]>('countedcare-challenges', []);
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

  // Initialize weekly missions if needed
  useEffect(() => {
    if (!userProgress) return;
    
    const lastReset = userProgress.lastMissionReset ? new Date(userProgress.lastMissionReset) : new Date(0);
    const now = new Date();
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceReset >= 7 || !userProgress.weeklyMissions || userProgress.weeklyMissions.length === 0) {
      const newMissions: WeeklyMission[] = WEEKLY_MISSION_TEMPLATES.map((template, index) => ({
        ...template,
        id: `mission-${now.getTime()}-${index}`,
        current: 0,
        completed: false
      }));
      
      setUserProgress(prev => ({
        ...prev,
        weeklyMissions: newMissions,
        lastMissionReset: now.toISOString()
      }));
    }
  }, [userProgress?.lastMissionReset]);

  // Calculate current progress based on expenses
  useEffect(() => {
    if (!expenses || !Array.isArray(expenses) || !userProgress) return;
    
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expenseCount = expenses.length;
    const uniqueCategories = [...new Set(expenses.map(exp => exp.category))];
    
    // Calculate streak
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    const today = new Date();
    
    // Check if user logged expense today or yesterday
    for (let i = 0; i < sortedExpenses.length; i++) {
      const expenseDate = new Date(sortedExpenses[i].date);
      const daysDiff = Math.floor((today.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= currentStreak + 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    const newProgress: UserProgress = {
      ...userProgress,
      totalExpenses: totalAmount,
      expenseCount,
      categoriesUsed: uniqueCategories,
      currentStreak,
      longestStreak: Math.max(userProgress?.longestStreak || 0, currentStreak),
      experiencePoints: expenseCount * 10 + Math.floor(totalAmount / 10),
      level: Math.floor((expenseCount * 10 + Math.floor(totalAmount / 10)) / 100) + 1,
      lastActivity: expenses.length > 0 ? sortedExpenses[0].date : userProgress?.lastActivity || new Date().toISOString(),
      // Ensure arrays are always defined
      tipsRead: userProgress.tipsRead || [],
      weeklyMissions: userProgress.weeklyMissions || []
    };

    // Update weekly missions progress
    const updatedMissions = (newProgress.weeklyMissions || []).map(mission => {
      if (mission.type === 'log_expenses') {
        const current = Math.min(expenseCount, mission.target);
        return {
          ...mission,
          current,
          completed: current >= mission.target
        };
      }
      return mission;
    });

    setUserProgress({
      ...newProgress,
      weeklyMissions: updatedMissions
    });
  }, [expenses, userProgress?.lastMissionReset]);

  // Check for new badges
  useEffect(() => {
    if (!userProgress || !userProgress.badgesEarned) return;
    
    const earnedBadges: Badge[] = [];
    
    BADGE_DEFINITIONS.forEach(badge => {
      if (!userProgress.badgesEarned.includes(badge.id)) {
        let shouldEarn = false;
        
        switch (badge.criteria.type) {
          case 'expense_count':
            shouldEarn = (userProgress.expenseCount || 0) >= badge.criteria.value;
            break;
          case 'total_amount':
            shouldEarn = (userProgress.totalExpenses || 0) >= badge.criteria.value;
            break;
          case 'streak_days':
            shouldEarn = (userProgress.currentStreak || 0) >= badge.criteria.value;
            break;
          case 'categories_used':
            shouldEarn = (userProgress.categoriesUsed || []).length >= badge.criteria.value;
            break;
        }
        
        if (shouldEarn) {
          earnedBadges.push({ ...badge, unlocked: true, unlockedAt: new Date().toISOString() });
        }
      }
    });

    if (earnedBadges.length > 0) {
      setUserProgress(prev => ({
        ...prev,
        badgesEarned: [...(prev?.badgesEarned || []), ...earnedBadges.map(b => b.id)]
      }));
      setNewBadges(earnedBadges);
      setShowConfetti(true);
      setInstantFeedback({
        show: true,
        message: `You earned the ${earnedBadges[0].name} badge!`,
        type: 'badge'
      });
    }
  }, [userProgress?.expenseCount, userProgress?.totalExpenses, userProgress?.currentStreak, userProgress?.categoriesUsed?.length]);

  const getAllBadges = (): Badge[] => {
    if (!userProgress || !userProgress.badgesEarned) {
      return BADGE_DEFINITIONS.map(badge => ({
        ...badge,
        unlocked: false
      }));
    }
    
    return BADGE_DEFINITIONS.map(badge => ({
      ...badge,
      unlocked: userProgress.badgesEarned.includes(badge.id)
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
    setUserProgress(prev => ({
      ...prev,
      tipsRead: [...(prev?.tipsRead || []), tipId],
      lastTipDate: new Date().toISOString()
    }));

    // Update read tip mission progress
    const updatedMissions = (userProgress?.weeklyMissions || []).map(mission => {
      if (mission.type === 'read_tip' && !mission.completed) {
        const current = Math.min(mission.current + 1, mission.target);
        return {
          ...mission,
          current,
          completed: current >= mission.target
        };
      }
      return mission;
    });

    setUserProgress(prev => ({
      ...prev,
      weeklyMissions: updatedMissions
    }));

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

  // Ensure we always return a complete userProgress object
  const safeUserProgress = userProgress || {
    totalExpenses: 0,
    expenseCount: 0,
    currentStreak: 0,
    longestStreak: 0,
    categoriesUsed: [],
    badgesEarned: [],
    challengesCompleted: [],
    level: 1,
    experiencePoints: 0,
    lastActivity: new Date().toISOString(),
    weeklyMissions: [],
    lastMissionReset: new Date().toISOString(),
    tipsRead: [],
    lastTipDate: ''
  };

  return {
    userProgress: {
      ...safeUserProgress,
      // Double-check arrays are defined
      weeklyMissions: safeUserProgress.weeklyMissions || [],
      tipsRead: safeUserProgress.tipsRead || [],
      categoriesUsed: safeUserProgress.categoriesUsed || [],
      badgesEarned: safeUserProgress.badgesEarned || [],
      challengesCompleted: safeUserProgress.challengesCompleted || []
    },
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
