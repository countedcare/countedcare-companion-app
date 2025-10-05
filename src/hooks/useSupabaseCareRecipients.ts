import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CareRecipient {
  id: string;
  name: string;
  relationship: string;
  date_of_birth?: string;
  notes?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export function useSupabaseCareRecipients() {
  const { user } = useAuth();
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipients = async () => {
    if (!user) {
      setRecipients([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('care_recipients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipients(data || []);
    } catch (err) {
      console.error('Error loading care recipients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load care recipients');
    } finally {
      setLoading(false);
    }
  };

  const addRecipient = async (recipientData: Omit<CareRecipient, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('care_recipients')
        .insert([{ ...recipientData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setRecipients(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding care recipient:', err);
      throw err;
    }
  };

  const updateRecipient = async (id: string, updates: Partial<CareRecipient>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('care_recipients')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setRecipients(prev => prev.map(recipient => recipient.id === id ? data : recipient));
      return data;
    } catch (err) {
      console.error('Error updating care recipient:', err);
      throw err;
    }
  };

  const deleteRecipient = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('care_recipients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setRecipients(prev => prev.filter(recipient => recipient.id !== id));
    } catch (err) {
      console.error('Error deleting care recipient:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadRecipients();
  }, [user]);

  return {
    recipients,
    loading,
    error,
    addRecipient,
    updateRecipient,
    deleteRecipient,
    refreshRecipients: loadRecipients
  };
}