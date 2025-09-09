import { useState, useEffect } from 'react';
import { validateAdminSession, logoutAdmin, getCurrentAdminSession, setAdminIdHeader } from '@/lib/adminSupabase';

export const useAdminAuth = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const result = await validateAdminSession();
        
        if (result.success && result.admin) {
          setIsAdminAuthenticated(true);
          setAdminRole(result.admin.role);
          setAdminUsername(result.admin.username);
          setAdminIdHeader(result.admin.id); // Set header on successful validation
        } else {
          setIsAdminAuthenticated(false);
          setAdminRole(null);
          setAdminUsername(null);
          setAdminIdHeader(null); // Clear header on failed validation
        }
      } catch (error) {
        console.error('Session validation error:', error);
        setIsAdminAuthenticated(false);
        setAdminRole(null);
        setAdminUsername(null);
        setAdminIdHeader(null); // Clear header on error
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
    
    // Check every 30 seconds for session validation (server-side check)
    const interval = setInterval(checkAdminAuth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const adminLogout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAdminAuthenticated(false);
      setAdminRole(null);
      setAdminUsername(null);
      setAdminIdHeader(null); // Clear header on logout
    }
  };

  // Quick check without server validation for performance
  const quickAuthCheck = () => {
    const session = getCurrentAdminSession();
    return session !== null;
  };

  return { 
    isAdminAuthenticated, 
    adminRole, 
    adminUsername, 
    loading, 
    adminLogout,
    quickAuthCheck 
  };
};