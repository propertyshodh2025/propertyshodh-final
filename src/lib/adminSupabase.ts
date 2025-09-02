import { supabase } from '@/integrations/supabase/client';

interface AdminSession {
  admin_id: string;
  username: string;
  role: string;
  is_active: boolean;
}

const ADMIN_SESSION_KEY = 'supabase-admin-session';

export const validateAdminSession = async (): Promise<{ success: boolean; admin?: AdminSession | null; error?: string }> => {
  const sessionToken = localStorage.getItem(ADMIN_SESSION_KEY);

  if (!sessionToken) {
    return { success: false, error: 'No admin session found' };
  }

  try {
    const { data, error } = await supabase.rpc('validate_admin_session', { _session_token: sessionToken });

    if (error) {
      console.error('RPC validate_admin_session error:', error);
      localStorage.removeItem(ADMIN_SESSION_KEY); // Clear invalid session
      return { success: false, error: error.message };
    }

    if (data && data.length > 0) {
      const admin = data[0];
      return { success: true, admin: admin as AdminSession };
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY); // Clear expired/invalid session
      return { success: false, error: 'Invalid or expired admin session' };
    }
  } catch (err) {
    console.error('Unexpected error during admin session validation:', err);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return { success: false, error: (err as Error).message };
  }
};

export const loginAdmin = async (username: string, password: string): Promise<{ success: boolean; admin?: AdminSession; sessionToken?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('authenticate_admin', { _username: username, _password: password });

    if (error) {
      console.error('RPC authenticate_admin error:', error);
      return { success: false, error: error.message };
    }

    if (data && data.length > 0) {
      const admin = data[0];
      if (admin.is_active) {
        const { data: sessionData, error: sessionError } = await supabase.rpc('create_admin_session', { _admin_id: admin.id });
        if (sessionError) {
          console.error('RPC create_admin_session error:', sessionError);
          return { success: false, error: sessionError.message };
        }
        const sessionToken = sessionData as string;
        localStorage.setItem(ADMIN_SESSION_KEY, sessionToken);
        return { success: true, admin: admin as AdminSession, sessionToken };
      } else {
        return { success: false, error: 'Admin account is inactive' };
      }
    } else {
      return { success: false, error: 'Invalid username or password' };
    }
  } catch (err) {
    console.error('Unexpected error during admin login:', err);
    return { success: false, error: (err as Error).message };
  }
};

export const logoutAdmin = async () => {
  const sessionToken = localStorage.getItem(ADMIN_SESSION_KEY);
  if (sessionToken) {
    try {
      await supabase.rpc('revoke_admin_session', { _session_token: sessionToken });
    } catch (error) {
      console.error('Error revoking admin session:', error);
    }
  }
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const getCurrentAdminSession = (): string | null => {
  return localStorage.getItem(ADMIN_SESSION_KEY);
};