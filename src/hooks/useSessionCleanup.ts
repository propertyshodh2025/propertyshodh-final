import { useEffect } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';

/**
 * Hook to periodically cleanup expired admin sessions
 * This helps maintain database performance and security
 */
export const useSessionCleanup = () => {
  useEffect(() => {
    const cleanupExpiredSessions = async () => {
      try {
        await adminSupabase.rpc('cleanup_expired_admin_sessions');
      } catch (error) {
        console.error('Failed to cleanup expired sessions:', error);
      }
    };

    // Run cleanup immediately
    cleanupExpiredSessions();

    // Run cleanup every 30 minutes
    const interval = setInterval(cleanupExpiredSessions, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};