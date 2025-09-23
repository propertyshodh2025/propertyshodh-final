import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimpleCentralContactReturn {
  contactNumber: string;
  isLoading: boolean;
  updateContact: (newNumber: string) => Promise<boolean>;
  refreshContact: () => Promise<void>;
}

export const useSimpleCentralContact = (): SimpleCentralContactReturn => {
  const [contactNumber, setContactNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Simple function to fetch current contact number
  const fetchContactNumber = useCallback(async () => {
    try {
      console.log('🔍 SIMPLE: Fetching contact number...');
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('central_contact_number')
        .limit(1);

      console.log('🔍 SIMPLE: Raw fetch result:', { data, error });

      if (error) {
        console.error('❌ SIMPLE: Fetch error:', error);
        setContactNumber(''); // Use empty string on error
        return;
      }

      if (data && data.length > 0) {
        const number = data[0].central_contact_number || '';
        console.log('✅ SIMPLE: Found contact number:', number);
        setContactNumber(number);
      } else {
        console.log('📋 SIMPLE: No data found, using empty string');
        setContactNumber('');
      }
    } catch (err) {
      console.error('💥 SIMPLE: Exception during fetch:', err);
      setContactNumber(''); // Always fallback to empty string
    }
  }, []);

  // Simple function to update contact number
  const updateContact = useCallback(async (newNumber: string): Promise<boolean> => {
    try {
      console.log('🚀 SIMPLE UPDATE: Updating contact to:', newNumber);
      
      // Use our bulletproof RPC function
      const { data, error } = await supabase.rpc('update_central_contact_number', {
        _contact_number: newNumber
      });

      console.log('🚀 SIMPLE UPDATE: RPC response:', { data, error });

      if (error) {
        console.error('❌ SIMPLE UPDATE: RPC error:', error);
        toast({
          title: '❌ Update Failed',
          description: `Database error: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }

      if (data && data.success) {
        console.log('✅ SIMPLE UPDATE: Success! Updating local state...');
        
        // Update local state immediately
        setContactNumber(newNumber);
        
        // Also refresh from database to be sure
        await fetchContactNumber();
        
        toast({
          title: '✅ Success!',
          description: `Contact number updated to: ${newNumber}`,
          variant: 'default'
        });
        
        return true;
      } else {
        console.error('❌ SIMPLE UPDATE: Invalid response:', data);
        toast({
          title: '❌ Update Failed', 
          description: 'Invalid response from database',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err) {
      console.error('💥 SIMPLE UPDATE: Exception:', err);
      toast({
        title: '❌ Update Failed',
        description: `Exception: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, fetchContactNumber]);

  // Refresh function for manual refresh
  const refreshContact = useCallback(async () => {
    setIsLoading(true);
    await fetchContactNumber();
    setIsLoading(false);
  }, [fetchContactNumber]);

  // Load contact number on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchContactNumber();
      setIsLoading(false);
    };

    loadInitialData();
  }, [fetchContactNumber]);

  // Set up real-time listener for changes
  useEffect(() => {
    console.log('🔄 SIMPLE: Setting up real-time listener...');
    
    const channel = supabase
      .channel('simple-contact-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
        },
        (payload) => {
          console.log('🔄 SIMPLE: Real-time change detected:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newNumber = (payload.new as any)?.central_contact_number || '';
            console.log('🔄 SIMPLE: Updating to:', newNumber);
            setContactNumber(newNumber);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔄 SIMPLE: Subscription status:', status);
      });

    return () => {
      console.log('🔄 SIMPLE: Cleaning up real-time listener...');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    contactNumber,
    isLoading,
    updateContact,
    refreshContact
  };
};

// Utility function to get contact number with fallback
export const getContactWithFallback = (contactNumber: string): string => {
  return contactNumber || '+91 98765 43210';
};