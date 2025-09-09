import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key in environment variables');
}

export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-admin-bypass': 'true'
    }
  }
});

// Session validation function
export const validateAdminSession = async (sessionToken?: string) => {
  try {
    const { data, error } = await adminSupabase.rpc('validate_admin_session', {
      _session_token: sessionToken || ''
    });

    if (error || !data || data.length === 0) {
      return { success: false, error: error?.message || 'Invalid session' };
    }

    return {
      success: true,
      admin: {
        id: data[0].admin_id,
        username: data[0].admin_username,
        role: data[0].role
      }
    };
  } catch (error) {
    return { success: false, error: 'Session validation failed' };
  }
};

// Authentication function
export const authenticateAdmin = async (username: string, password: string) => {
  try {
    const { data, error } = await adminSupabase.rpc('authenticate_admin', {
      _username: username,
      _password: password
    });

    if (error || !data || data.length === 0) {
      return { success: false, error: error?.message || 'Invalid credentials' };
    }

    // Create session after successful authentication
    const sessionResult = await adminSupabase.rpc('create_admin_session', {
      _admin_id: data[0].id
    });

    if (sessionResult.error) {
      throw sessionResult.error;
    }

    return {
      success: true,
      admin: {
        id: data[0].id,
        username: data[0].username,
        role: data[0].role,
        sessionToken: sessionResult.data
      }
    };
  } catch (error) {
    return { success: false, error: 'Authentication failed' };
  }
};

// Logout function
export const logoutAdmin = async (sessionToken: string) => {
  try {
    const { error } = await adminSupabase.rpc('revoke_admin_session', {
      _session_token: sessionToken
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Logout failed' };
  }
};

// Get current session
export const getCurrentAdminSession = () => {
  const sessionData = localStorage.getItem('adminSession');
  return sessionData ? JSON.parse(sessionData) : null;
};

// Set admin ID header
export const setAdminIdHeader = (adminId: string | null) => {
  if (adminId) {
    adminSupabase.realtime.setAuth(adminId);
  } else {
    adminSupabase.realtime.setAuth(null);
  }
};