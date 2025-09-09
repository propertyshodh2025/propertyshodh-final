import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bujpqglebnkdwlbguekm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1anBxZ2xlYm5rZHdsYmd1ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODE2MjEsImV4cCI6MjA2ODA1NzYyMX0.Db4ysTZ2uNEAy59uXjMx8fllwoAUlgyqAxZftZ1WKI8";

// Create a special admin client that doesn't use auth context
// Initialize with a base header, we'll update 'x-admin-id' dynamically
export const adminSupabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-admin-bypass': 'true',
      // 'x-admin-id' will be set dynamically after login/validation
    }
  }
});

// Function to dynamically set the admin ID in the client's global headers
export const setAdminIdHeader = (adminId: string | null) => {
  const currentHeaders = adminSupabase['options']['global']['headers'];
  if (adminId) {
    adminSupabase['options']['global']['headers'] = {
      ...currentHeaders,
      'x-admin-id': adminId,
    };
  } else {
    // Remove the header if adminId is null (e.g., on logout)
    const { 'x-admin-id': _, ...restHeaders } = currentHeaders;
    adminSupabase['options']['global']['headers'] = restHeaders;
  }
  // console.log('Admin Supabase headers updated:', adminSupabase['options']['global']['headers']); // For debugging
};

// Types for admin session management
interface AdminSession {
  id: string;
  username: string;
  role: string;
  sessionToken: string;
  expiresAt: string;
}

interface AdminAuthResult {
  success: boolean;
  admin?: AdminSession;
  error?: string;
}

// Helper function to set admin session variables in PostgreSQL
// This is still useful for RPC functions that explicitly read app.current_admin_id,
// but for RLS, we'll now rely on the 'x-admin-id' header.
export const setAdminSessionContext = async (adminId: string, role: string): Promise<void> => {
  try {
    await adminSupabase.rpc('set_admin_session_context', { _admin_id: adminId, _admin_role: role });
  } catch (error) {
    console.error('Failed to set admin session context:', error);
  }
};

// Secure admin authentication with server-side session management
export const authenticateAdmin = async (username: string, password: string): Promise<AdminAuthResult> => {
  try {
    // Call the secure authentication function
    const { data, error } = await adminSupabase.rpc('authenticate_admin', {
      _username: username,
      _password: password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Invalid credentials' };
    }

    const adminData = data[0];
    
    // Create server-side session
    const { data: sessionToken, error: sessionError } = await adminSupabase.rpc('create_admin_session', {
      _admin_id: adminData.id,
      _ip_address: null, // Will be handled by PostgreSQL
      _user_agent: navigator.userAgent
    });

    if (sessionError) {
      return { success: false, error: 'Failed to create session' };
    }

    // Store session token securely
    const adminSession: AdminSession = {
      id: adminData.id,
      username: adminData.username,
      role: adminData.role,
      sessionToken: sessionToken,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
    };

    // Store in localStorage (will be replaced with httpOnly cookies in production)
    localStorage.setItem('adminSession', JSON.stringify(adminSession));
    
    // Set PostgreSQL session variable (for RPCs that use it)
    await setAdminSessionContext(adminData.id, adminData.role);
    // Dynamically set the admin ID in the client's global headers for RLS
    setAdminIdHeader(adminData.id);

    return { success: true, admin: adminSession };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
  }
};

// Validate admin session server-side
export const validateAdminSession = async (): Promise<AdminAuthResult> => {
  try {
    const sessionStr = localStorage.getItem('adminSession');
    if (!sessionStr) {
      setAdminIdHeader(null); // Clear header if no session
      return { success: false, error: 'No session found' };
    }

    const session: AdminSession = JSON.parse(sessionStr);
    
    // Check if session is expired locally first
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem('adminSession');
      setAdminIdHeader(null); // Clear header on expired session
      return { success: false, error: 'Session expired' };
    }

    // Validate with server (this also extends the session)
    const { data, error } = await adminSupabase.rpc('validate_admin_session', {
      _session_token: session.sessionToken
    });

    if (error || !data || data.length === 0) {
      localStorage.removeItem('adminSession');
      setAdminIdHeader(null); // Clear header on invalid session
      return { success: false, error: 'Invalid session' };
    }

    const adminData = data[0];
    
    // Update session with fresh data
    const updatedSession: AdminSession = {
      ...session,
      username: adminData.username,
      role: adminData.role
    };

    localStorage.setItem('adminSession', JSON.stringify(updatedSession));
    
    // Set PostgreSQL session variable (for RPCs that use it)
    await setAdminSessionContext(adminData.id, adminData.role);
    // Dynamically set the admin ID in the client's global headers for RLS
    setAdminIdHeader(adminData.id);

    return { success: true, admin: updatedSession };
  } catch (error) {
    localStorage.removeItem('adminSession');
    setAdminIdHeader(null); // Clear header on error
    return { success: false, error: error instanceof Error ? error.message : 'Session validation failed' };
  }
};

// Logout admin and revoke session
export const logoutAdmin = async (): Promise<void> => {
  try {
    const sessionStr = localStorage.getItem('adminSession');
    if (sessionStr) {
      const session: AdminSession = JSON.parse(sessionStr);
      
      // Revoke session on server
      await adminSupabase.rpc('revoke_admin_session', {
        _session_token: session.sessionToken
      });
    }
  } catch (error) {
    console.error('Failed to revoke session:', error);
  } finally {
    // Clear local storage
    localStorage.removeItem('adminSession');
    setAdminIdHeader(null); // Clear header on logout
  }
};

// Helper function to get current admin session
export const getCurrentAdminSession = (): AdminSession | null => {
  try {
    const sessionStr = localStorage.getItem('adminSession');
    if (!sessionStr) return null;

    const session: AdminSession = JSON.parse(sessionStr);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem('adminSession');
      setAdminIdHeader(null); // Clear header on expired session
      return null;
    }

    // Ensure the header is set if session is valid (e.g., on app refresh)
    setAdminIdHeader(session.id);

    return session;
  } catch (error) {
    localStorage.removeItem('adminSession');
    setAdminIdHeader(null); // Clear header on error
    return null;
  }
};

// Legacy helper function for backward compatibility
export const isAdminAuthenticated = (): boolean => {
  return getCurrentAdminSession() !== null;
};