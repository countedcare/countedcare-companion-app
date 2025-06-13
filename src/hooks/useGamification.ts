
import { useState, useEffect } from 'react';
import { BADGE_DEFINITIONS, CHALLENGE_TEMPLATES, Badge, Challenge, UserProgress } from '@/types/Gamification';
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
    lastActivity: new Date().toISOString()
  });

  const [activeChallenges, setActiveChallenges] = useLocalStorage<Challenge[]>('countedcare-challenges', []);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  // Calculate current progress based on expenses
  useEffect(() => {
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expenseCount = expenses.length;
    const uniqueCategories = [...new Set(expenses.map(exp => exp.category))];
    
    // Calculate streak (simplified - would need more complex logic for real streaks)
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    let checkDate = new Date();
    
    for (const expense of sortedExpenses) {
      const expenseDate = new Date(expense.date);
      const daysDiff = Math.floor((checkDate.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        currentStreak++;
        checkDate = expenseDate;
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
      longestStreak: Math.max(userProgress.longestStreak, currentStreak),
      experiencePoints: expenseCount * 10 + Math.floor(totalAmount / 10), // 10 XP per expense + 1 XP per $10
      level: Math.floor((expenseCount * 10 + Math.floor(totalAmount / 10)) / 100) + 1,
      lastActivity: new Date().toISOString()
    };

    setUserProgress(newProgress);
  }, [expenses, setUserProgress]);

  // Check for new badges
  useEffect(() => {
    const earnedBadges: Badge[] = [];
    
    BADGE_DEFINITIONS.forEach(badge => {
      if (!userProgress.badgesEarned.includes(badge.id)) {
        let shouldEarn = false;
        
        switch (badge.criteria.type) {
          case 'expense_count':
            shouldEarn = userProgress.expenseCount >= badge.criteria.value;
            break;
          case 'total_amount':
            shouldEarn = userProgress.totalExpenses >= badge.criteria.value;
            break;
          case 'streak_days':
            shouldEarn = userProgress.currentStreak >= badge.criteria.value;
            break;
          case 'categories_used':
            shouldEarn = userProgress.categoriesUsed.length >= badge.criteria.value;
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
        badgesEarned: [...prev.badgesEarned, ...earnedBadges.map(b => b.id)]
      }));
      setNewBadges(earnedBadges);
      setShowConfetti(true);
    }
  }, [userProgress, setUserProgress]);

  const getAllBadges = (): Badge[] => {
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

    setActiveChallenges(prev => [...prev, newChallenge]);
  };

  const completeChallenge = (challengeId: string) => {
    setActiveChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, completedAt: new Date().toISOString() }
          : challenge
      )
    );
    setShowConfetti(true);
  };

  const getAvailableChallenges = (): Challenge[] => {
    const activeIds = activeChallenges.map(c => c.title);
    return CHALLENGE_TEMPLATES
      .filter(template => !activeIds.includes(template.title))
      .map(template => ({
        ...template,
        id: template.title,
        active: false
      }));
  };

  return {
    userProgress,
    badges: getAllBadges(),
    activeChallenges,
    availableChallenges: getAvailableChallenges(),
    newBadges,
    showConfetti,
    acceptChallenge,
    completeChallenge,
    setShowConfetti
  };
};
