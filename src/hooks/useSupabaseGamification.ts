import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProgress {
  level: number;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  challengesCompleted: number;
  lastActivityDate?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  category: string;
  reward: string;
  completed: boolean;
}

export function useSupabaseGamification() {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    totalXP: 0,
    currentStreak: 0,
    bestStreak: 0,
    challengesCompleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGamificationData = async () => {
    if (!user) {
      setUserProgress({
        level: 1,
        totalXP: 0,
        currentStreak: 0,
        bestStreak: 0,
        challengesCompleted: 0,
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        setUserProgress({
          level: data.level,
          totalXP: data.total_xp,
          currentStreak: data.current_streak,
          bestStreak: data.best_streak,
          challengesCompleted: data.challenges_completed,
          lastActivityDate: data.last_activity_date,
        });
      }
    } catch (err) {
      console.error('Error loading gamification data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProgress = async (updates: Partial<UserProgress>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const progressData = {
        level: updates.level ?? userProgress.level,
        total_xp: updates.totalXP ?? userProgress.totalXP,
        current_streak: updates.currentStreak ?? userProgress.currentStreak,
        best_streak: updates.bestStreak ?? userProgress.bestStreak,
        challenges_completed: updates.challengesCompleted ?? userProgress.challengesCompleted,
        last_activity_date: updates.lastActivityDate ?? userProgress.lastActivityDate,
      };

      const { data, error } = await supabase
        .from('gamification')
        .upsert([{ ...progressData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setUserProgress({
        level: data.level,
        totalXP: data.total_xp,
        currentStreak: data.current_streak,
        bestStreak: data.best_streak,
        challengesCompleted: data.challenges_completed,
        lastActivityDate: data.last_activity_date,
      });
      
      return data;
    } catch (err) {
      console.error('Error updating gamification data:', err);
      throw err;
    }
  };

  const addXP = async (amount: number) => {
    const newTotalXP = userProgress.totalXP + amount;
    const newLevel = Math.floor(newTotalXP / 100) + 1; // Simple leveling system
    
    await updateUserProgress({
      totalXP: newTotalXP,
      level: newLevel,
      lastActivityDate: new Date().toISOString().split('T')[0],
    });
  };

  const updateStreak = async (active: boolean) => {
    const newStreak = active ? userProgress.currentStreak + 1 : 0;
    const newBestStreak = Math.max(userProgress.bestStreak, newStreak);
    
    await updateUserProgress({
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      lastActivityDate: new Date().toISOString().split('T')[0],
    });
  };

  useEffect(() => {
    loadGamificationData();
  }, [user]);

  return {
    userProgress,
    loading,
    error,
    updateUserProgress,
    addXP,
    updateStreak,
    refreshGamification: loadGamificationData
  };
}