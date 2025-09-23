import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseResources, Resource } from '@/hooks/useSupabaseResources';

export interface SavedResource {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
  resource: Resource;
}

export function useSupabaseSavedResources() {
  const { user } = useAuth();
  const { resources } = useSupabaseResources();
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSavedResourceIds = (): string[] => {
    if (!user) return [];
    try {
      const saved = localStorage.getItem(`saved_resources_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const setSavedResourceIds = (ids: string[]) => {
    if (!user) return;
    localStorage.setItem(`saved_resources_${user.id}`, JSON.stringify(ids));
  };

  const loadSavedResources = () => {
    if (!user || resources.length === 0) {
      setSavedResources([]);
      setLoading(false);
      return;
    }

    try {
      const savedIds = getSavedResourceIds();
      const savedResourcesList = savedIds
        .map(id => resources.find(r => r.id === id))
        .filter((resource): resource is Resource => resource !== undefined)
        .map(resource => ({
          id: resource.id,
          user_id: user.id,
          resource_id: resource.id,
          created_at: new Date().toISOString(),
          resource
        }));

      setSavedResources(savedResourcesList);
    } catch (err) {
      console.error('Error loading saved resources:', err);
      setError('Failed to load saved resources');
    } finally {
      setLoading(false);
    }
  };

  const saveResource = async (resourceId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const savedIds = getSavedResourceIds();
      if (!savedIds.includes(resourceId)) {
        const newSavedIds = [...savedIds, resourceId];
        setSavedResourceIds(newSavedIds);
        loadSavedResources();
      }
      
      // Analytics event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'resource_toggle_saved', {
          resource_id: resourceId,
          action: 'save'
        });
      }
    } catch (err) {
      console.error('Error saving resource:', err);
      throw err;
    }
  };

  const unsaveResource = async (resourceId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const savedIds = getSavedResourceIds();
      const newSavedIds = savedIds.filter(id => id !== resourceId);
      setSavedResourceIds(newSavedIds);
      loadSavedResources();
      
      // Analytics event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'resource_toggle_saved', {
          resource_id: resourceId,
          action: 'unsave'
        });
      }
    } catch (err) {
      console.error('Error unsaving resource:', err);
      throw err;
    }
  };

  const isResourceSaved = (resourceId: string) => {
    const savedIds = getSavedResourceIds();
    return savedIds.includes(resourceId);
  };

  useEffect(() => {
    loadSavedResources();
  }, [user, resources]);

  return {
    savedResources,
    loading,
    error,
    saveResource,
    unsaveResource,
    isResourceSaved,
    refreshSavedResources: loadSavedResources
  };
}