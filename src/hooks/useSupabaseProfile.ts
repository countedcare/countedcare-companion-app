import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  is_caregiver: boolean;
  caregiving_for?: string[];
  zip_code?: string;
  household_agi?: number;
  onboarding_complete: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useSupabaseProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const createProfile = async (profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ ...profileData, id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error creating profile:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    createProfile,
    refreshProfile: loadProfile
  };
}