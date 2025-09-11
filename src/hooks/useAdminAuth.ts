import { useState, useEffect, useCallback } from 'react';
import { authenticateAdmin, logoutAdmin, validateAdminSession, getCurrentAdminSession } from '@/lib/adminSupabase';

interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'superadmin' | 'super_super_admin';
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => Promise<void>;
}

export const useAdminAuth = (): AdminAuthContextType => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminSession = useCallback(async () => {
    console.log('useAdminAuth: Starting loadAdminSession...');
    setLoading(true);
    const storedSession = getCurrentAdminSession();
    console.log('useAdminAuth: Stored session:', storedSession);

    if (storedSession?.sessionToken) {
      console.log('useAdminAuth: Validating stored session token...');
      const { success, admin: validatedAdmin, error } = await validateAdminSession(storedSession.sessionToken);
      if (success && validatedAdmin) {
        console.log('useAdminAuth: Session validated successfully. Admin:', validatedAdmin);
        setAdmin(validatedAdmin);
      } else {
        console.error('useAdminAuth: Session validation failed:', error);
        localStorage.removeItem('adminSession');
        setAdmin(null);
      }
    } else {
      console.log('useAdminAuth: No stored session token found.');
    }
    setLoading(false);
    console.log('useAdminAuth: Finished loadAdminSession. Current Admin:', admin, 'Loading state:', false);
  }, []);

  useEffect(() => {
    loadAdminSession();
  }, [loadAdminSession]);

  const adminLogin = async (username: string, password: string) => {
    console.log('useAdminAuth: Attempting admin login for:', username);
    setLoading(true);
    const { success, admin: authenticatedAdmin, error } = await authenticateAdmin(username, password);
    if (success && authenticatedAdmin) {
      console.log('useAdminAuth: Login successful. Admin:', authenticatedAdmin);
      setAdmin(authenticatedAdmin);
      localStorage.setItem('adminSession', JSON.stringify({ sessionToken: authenticatedAdmin.sessionToken }));
      setLoading(false);
      return { success: true };
    } else {
      console.error('useAdminAuth: Login failed:', error);
      setAdmin(null);
      localStorage.removeItem('adminSession');
      setLoading(false);
      return { success: false, error: error || 'Login failed' };
    }
  };

  const adminLogout = async () => {
    console.log('useAdminAuth: Attempting admin logout.');
    setLoading(true);
    const storedSession = getCurrentAdminSession();
    if (storedSession?.sessionToken) {
      await logoutAdmin(storedSession.sessionToken);
      console.log('useAdminAuth: Session revoked on backend.');
    }
    localStorage.removeItem('adminSession');
    setAdmin(null);
    setLoading(false);
    console.log('useAdminAuth: Admin logged out.');
  };

  return {
    admin,
    loading,
    adminLogin,
    adminLogout,
  };
};