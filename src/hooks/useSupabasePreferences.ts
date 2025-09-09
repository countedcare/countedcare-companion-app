import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPreferences {
  last_quick_action?: string;
  preferences?: Record<string, any>;
}

export function useSupabasePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = async () => {
    if (!user) {
      setPreferences({});
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        setPreferences({
          last_quick_action: data.last_quick_action,
          preferences: (data.preferences as Record<string, any>) || {},
        });
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const currentPrefs = preferences.preferences || {};
      const newPrefs = updates.preferences ? { ...currentPrefs, ...updates.preferences } : currentPrefs;

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert([{
          user_id: user.id,
          last_quick_action: updates.last_quick_action ?? preferences.last_quick_action,
          preferences: newPrefs,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setPreferences({
        last_quick_action: data.last_quick_action,
        preferences: (data.preferences as Record<string, any>) || {},
      });
      
      return data;
    } catch (err) {
      console.error('Error updating preferences:', err);
      throw err;
    }
  };

  const setLastQuickAction = async (action: string) => {
    await updatePreferences({ last_quick_action: action });
  };

  const setPreference = async (key: string, value: any) => {
    await updatePreferences({ preferences: { [key]: value } });
  };

  useEffect(() => {
    loadPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    setLastQuickAction,
    setPreference,
    refreshPreferences: loadPreferences
  };
}