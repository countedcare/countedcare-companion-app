import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  url?: string;
  content?: string;
  tags?: string[];
  estimated_benefit?: string;
  eligibility_requirements?: string[];
  application_process?: string;
  contact_info?: any;
  external_links?: any;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export function useSupabaseResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
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

  useEffect(() => {
    loadResources();
  }, []);

  return {
    resources,
    loading,
    error,
    refreshResources: loadResources
  };
}