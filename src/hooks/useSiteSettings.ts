import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SiteSettings {
  id?: string;
  central_contact_number?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  maintenance_mode?: boolean;
  maintenance_message?: string;
  maintenance_enabled_at?: string;
}

interface UseSiteSettingsReturn {
  siteSettings: SiteSettings;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateSettings: (updates: Partial<SiteSettings>) => Promise<boolean>;
}

export const useSiteSettings = (): UseSiteSettingsReturn => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSiteSettings = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No rows found - this is expected for initial state
          setSiteSettings({});
        } else {
          throw fetchError;
        }
      } else {
        setSiteSettings(data || {});
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch site settings';
      setError(errorMessage);
      console.error('Error fetching site settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<SiteSettings>): Promise<boolean> => {
    try {
      setError(null);
      
      // Check if a record exists
      const { data: existingSettings, error: fetchError } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingSettings) {
        // Update existing record
        const { error } = await supabase
          .from('site_settings')
          .update(updates)
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('site_settings')
          .insert(updates);

        if (error) throw error;
      }

      // Update local state
      setSiteSettings(prev => ({ ...prev, ...updates }));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update site settings';
      setError(errorMessage);
      console.error('Error updating site settings:', err);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchSiteSettings();
  }, [fetchSiteSettings]);

  useEffect(() => {
    fetchSiteSettings();

    // Set up real-time subscription
    const channel = supabase
      .channel('site-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
        },
        (payload) => {
          console.log('Site settings changed:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setSiteSettings(payload.new as SiteSettings);
          } else if (payload.eventType === 'DELETE') {
            setSiteSettings({});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSiteSettings]);

  return {
    siteSettings,
    loading,
    error,
    refetch,
    updateSettings,
  };
};

// Utility function to get central contact number with fallback
export const getCentralContactNumber = (siteSettings: SiteSettings): string => {
  return siteSettings.central_contact_number || '+91 98765 43210';
};

// Utility function to format phone number for WhatsApp
export const formatPhoneForWhatsApp = (phoneNumber: string): string => {
  return phoneNumber.replace(/[^\d]/g, '');
};