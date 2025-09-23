import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MaintenanceStatus {
  isActive: boolean;
  message: string;
  enabledAt: string | null;
  loading: boolean;
}

export const useMaintenanceMode = (): MaintenanceStatus => {
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus>({
    isActive: false,
    message: '',
    enabledAt: null,
    loading: true,
  });

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      console.log('🔍 Fetching maintenance status...');
      try {
        // First try to get any record
        const { data: allData, error: allError } = await supabase
          .from('site_settings')
          .select('maintenance_mode, maintenance_message, maintenance_enabled_at')
          .order('created_at', { ascending: false });
        
        console.log('📊 All site settings query result:', { allData, allError });
        
        // Then try to get single record
        const { data, error } = await supabase
          .from('site_settings')
          .select('maintenance_mode, maintenance_message, maintenance_enabled_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        console.log('📊 Single site settings query result:', { data, error });

        // Use data from single query or fallback to first record from array query
        let finalData = data;
        
        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error with single query, trying array query:', error);
          if (allData && allData.length > 0) {
            finalData = allData[0];
            console.log('♾️ Using first record from array query:', finalData);
          } else {
            console.error('❌ No data available from either query');
            setMaintenanceStatus({
              isActive: false,
              message: '',
              enabledAt: null,
              loading: false,
            });
            return;
          }
        }

        if (finalData) {
          const newStatus = {
            isActive: finalData.maintenance_mode || false,
            message: finalData.maintenance_message || 'We are currently performing scheduled maintenance. We\'ll be back shortly!',
            enabledAt: finalData.maintenance_enabled_at,
            loading: false,
          };
          console.log('✅ Setting maintenance status:', newStatus);
          setMaintenanceStatus(newStatus);
        } else {
          // No data found, maintenance mode is off
          console.log('ℹ️  No data found, maintenance mode off');
          setMaintenanceStatus({
            isActive: false,
            message: '',
            enabledAt: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('💥 Exception fetching maintenance status:', error);
        // If there's an error, assume maintenance mode is off
        setMaintenanceStatus({
          isActive: false,
          message: '',
          enabledAt: null,
          loading: false,
        });
      }
    };

    fetchMaintenanceStatus();

    // Set up real-time subscription to listen for changes
    const subscription = supabase
      .channel('maintenance-mode-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
        },
        (payload) => {
          console.log('Maintenance mode change detected:', payload);
          fetchMaintenanceStatus(); // Refetch when changes occur
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return maintenanceStatus;
};