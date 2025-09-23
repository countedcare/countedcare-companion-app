import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type ResourceCategory = 'federal' | 'state' | 'county' | 'nonprofit';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  state_code?: string;
  county_name?: string;
  tags: string[];
  eligibility_summary?: string;
  application_steps?: string;
  documents_required?: string[];
  estimated_benefit_min?: number;
  estimated_benefit_max?: number;
  source_url?: string;
  apply_url?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_hours?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_bookmarked?: boolean;
  rank?: number;
}

interface SearchFilters {
  query?: string;
  category?: ResourceCategory;
  state?: string;
  county?: string;
  tags?: string[];
}

interface SearchOptions {
  page?: number;
  pageSize?: number;
}

export const useResourcesSystem = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Load user's bookmarks
  const loadBookmarks = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('resource_bookmarks')
        .select('resource_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const bookmarkSet = new Set(data?.map(b => b.resource_id) || []);
      setBookmarks(bookmarkSet);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
    }
  }, [user]);

  // Search resources using the stored procedure
  const searchResources = useCallback(async (
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('search_resources', {
        q: filters.query || null,
        p_state: filters.state || null,
        p_county: filters.county || null, 
        p_category: filters.category || null,
        p_tags: filters.tags || null
      });

      if (error) throw error;

      // Map results and add bookmark status
      const resourcesWithBookmarks = (data || []).map((resource: any) => ({
        ...resource,
        is_bookmarked: bookmarks.has(resource.id)
      }));

      setResources(resourcesWithBookmarks);
    } catch (err) {
      console.error('Error searching resources:', err);
      setError(err instanceof Error ? err.message : 'Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [bookmarks]);

  // Get bookmarked resources
  const getBookmarkedResources = useCallback(async () => {
    if (!user) return;

    try {
      setBookmarksLoading(true);
      
      const { data, error } = await supabase
        .from('resource_bookmarks')
        .select(`
          resource_id,
          resources (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookmarkedResources = (data || []).map((bookmark: any) => ({
        ...bookmark.resources,
        is_bookmarked: true
      }));

      setBookmarkedResources(bookmarkedResources);
    } catch (err) {
      console.error('Error loading bookmarked resources:', err);
      setBookmarkedResources([]);
    } finally {
      setBookmarksLoading(false);
    }
  }, [user]);

  // Toggle bookmark status
  const toggleBookmark = useCallback(async (resourceId: string) => {
    if (!user) {
      toast.error('Please sign in to save resources');
      return;
    }

    try {
      const isBookmarked = bookmarks.has(resourceId);

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('resource_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId);

        if (error) throw error;

        // Log analytics event
        await logResourceEvent(resourceId, 'unsave');

        // Update local state
        const newBookmarks = new Set(bookmarks);
        newBookmarks.delete(resourceId);
        setBookmarks(newBookmarks);

        toast.success('Resource removed from saved');
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('resource_bookmarks')
          .insert({
            user_id: user.id,
            resource_id: resourceId
          });

        if (error) throw error;

        // Log analytics event
        await logResourceEvent(resourceId, 'save');

        // Update local state
        const newBookmarks = new Set(bookmarks);
        newBookmarks.add(resourceId);
        setBookmarks(newBookmarks);

        toast.success('Resource saved');
      }

      // Update resources list with new bookmark status
      setResources(prev => prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, is_bookmarked: !isBookmarked }
          : resource
      ));

      // Refresh bookmarked resources if we're viewing them
      await getBookmarkedResources();

    } catch (err) {
      console.error('Error toggling bookmark:', err);
      toast.error('Failed to update bookmark');
    }
  }, [user, bookmarks, getBookmarkedResources]);

  // Log resource events for analytics
  const logResourceEvent = useCallback(async (
    resourceId: string, 
    eventType: string, 
    context?: any
  ) => {
    try {
      await supabase.from('resource_events').insert({
        user_id: user?.id || null,
        resource_id: resourceId,
        event_type: eventType,
        context: context || { route: window.location.pathname }
      });
    } catch (err) {
      console.error('Error logging resource event:', err);
    }
  }, [user]);

  // Suggest a resource
  const suggestResource = useCallback(async (suggestion: {
    title: string;
    link?: string;
    note?: string;
  }) => {
    if (!user) {
      toast.error('Please sign in to suggest resources');
      return false;
    }

    try {
      const { error } = await supabase
        .from('resource_suggestions')
        .insert({
          user_id: user.id,
          title: suggestion.title,
          link: suggestion.link,
          note: suggestion.note
        });

      if (error) throw error;

      toast.success('Thanks! We\'ll review and add relevant resources.');
      return true;
    } catch (err) {
      console.error('Error submitting suggestion:', err);
      toast.error('Failed to submit suggestion');
      return false;
    }
  }, [user]);

  // Initialize bookmarks on mount
  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user, loadBookmarks]);

  return {
    // Data
    resources,
    bookmarkedResources,
    loading,
    bookmarksLoading,
    error,
    bookmarks,

    // Actions
    searchResources,
    getBookmarkedResources,
    toggleBookmark,
    logResourceEvent,
    suggestResource,

    // Utils
    isBookmarked: (resourceId: string) => bookmarks.has(resourceId),
    refreshBookmarks: loadBookmarks
  };
};