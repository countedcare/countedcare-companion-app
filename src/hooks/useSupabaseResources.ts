import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Resource {
  id?: string;
  title: string;
  description?: string;
  category: string;
  url?: string;
  is_favorited?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useSupabaseResources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResources = async () => {
    if (!user) {
      setResources([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.error('Error loading resources:', err);
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (resourceData: Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{ ...resourceData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setResources(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding resource:', err);
      throw err;
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setResources(prev => prev.map(resource => resource.id === id ? data : resource));
      return data;
    } catch (err) {
      console.error('Error updating resource:', err);
      throw err;
    }
  };

  const deleteResource = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setResources(prev => prev.filter(resource => resource.id !== id));
    } catch (err) {
      console.error('Error deleting resource:', err);
      throw err;
    }
  };

  const toggleFavorite = async (id: string) => {
    const resource = resources.find(r => r.id === id);
    if (!resource) return;

    await updateResource(id, { is_favorited: !resource.is_favorited });
  };

  useEffect(() => {
    loadResources();
  }, [user]);

  return {
    resources,
    loading,
    error,
    addResource,
    updateResource,
    deleteResource,
    toggleFavorite,
    refreshResources: loadResources
  };
}