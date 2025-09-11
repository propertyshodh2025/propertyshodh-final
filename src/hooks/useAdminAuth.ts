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
    setLoading(true);
    const storedSession = getCurrentAdminSession();
    if (storedSession?.sessionToken) {
      const { success, admin: validatedAdmin } = await validateAdminSession(storedSession.sessionToken);
      if (success && validatedAdmin) {
        setAdmin(validatedAdmin);
      } else {
        localStorage.removeItem('adminSession');
        setAdmin(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAdminSession();
  }, [loadAdminSession]);

  const adminLogin = async (username: string, password: string) => {
    setLoading(true);
    const { success, admin: authenticatedAdmin, error } = await authenticateAdmin(username, password);
    if (success && authenticatedAdmin) {
      setAdmin(authenticatedAdmin);
      localStorage.setItem('adminSession', JSON.stringify({ sessionToken: authenticatedAdmin.sessionToken }));
      setLoading(false);
      return { success: true };
    } else {
      setAdmin(null);
      localStorage.removeItem('adminSession');
      setLoading(false);
      return { success: false, error: error || 'Login failed' };
    }
  };

  const adminLogout = async () => {
    setLoading(true);
    const storedSession = getCurrentAdminSession();
    if (storedSession?.sessionToken) {
      await logoutAdmin(storedSession.sessionToken);
    }
    localStorage.removeItem('adminSession');
    setAdmin(null);
    setLoading(false);
  };

  return {
    admin,
    loading,
    adminLogin,
    adminLogout,
  };
};