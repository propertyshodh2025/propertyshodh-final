import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bujpqglebnkdwlbguekm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1anBxZ2xlYm5rZHdsYmd1ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODE2MjEsImV4cCI6MjA2ODA1NzYyMX0.Db4ysTZ2uNEAy59uXjMx8fllwoAUlgyqAxZftZ1WKI8";

// Types for admin session management
interface AdminSession {
  id: string;
  username: string;
  role: string;
  sessionToken: string;
  expiresAt: string;
}

// Helper function to get current admin session
const getCurrentAdminSessionInternal = (): AdminSession | null => {
  try {
    const sessionStr = localStorage.getItem('adminSession');
    if (!sessionStr) return null;

    const session: AdminSession = JSON.parse(sessionStr);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem('adminSession');
      return null;
    }

    return session;
  } catch (error) {
    localStorage.removeItem('adminSession');
    return null;
  }
};

// Base admin client without session headers
const baseAdminSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Function to get admin client with current session token
export const getAdminSupabase = () => {
  const session = getCurrentAdminSessionInternal();
  if (!session?.sessionToken) {
    return baseAdminSupabase;
  }
  
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-admin-session': session.sessionToken
      }
    }
  });
};

// Default export for backward compatibility - use the session-aware version
export const adminSupabase = new Proxy({}, {
  get(target, prop) {
    return getAdminSupabase()[prop];
  }
});

interface AdminAuthResult {
  success: boolean;
  admin?: AdminSession;
  error?: string;
}

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
    
    // Set PostgreSQL session variable
    await setAdminSession(adminData.role);

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
      return { success: false, error: 'No session found' };
    }

    const session: AdminSession = JSON.parse(sessionStr);
    
    // Check if session is expired locally first
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem('adminSession');
      return { success: false, error: 'Session expired' };
    }

    // Validate with server (this also extends the session)
    const { data, error } = await adminSupabase.rpc('validate_admin_session', {
      _session_token: session.sessionToken
    });

    if (error || !data || data.length === 0) {
      localStorage.removeItem('adminSession');
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
    
    // Set PostgreSQL session variable
    await setAdminSession(adminData.role);

    return { success: true, admin: updatedSession };
  } catch (error) {
    localStorage.removeItem('adminSession');
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
  }
};

// Helper function to get current admin session with role validation
export const getCurrentAdminSession = (): AdminSession | null => {
  const session = getCurrentAdminSessionInternal();
  
  // Additional security check: validate role exists and is legitimate
  if (session && !['admin', 'superadmin', 'super_super_admin'].includes(session.role)) {
    console.warn('Invalid admin role detected, clearing session');
    localStorage.removeItem('adminSession');
    return null;
  }
  
  return session;
};

// Legacy helper function for backward compatibility
export const isAdminAuthenticated = (): boolean => {
  return getCurrentAdminSession() !== null;
};

// Helper function to set admin session variables in PostgreSQL
export const setAdminSession = async (role: string): Promise<void> => {
  try {
    await adminSupabase.rpc('set_admin_session', { admin_role: role });
  } catch (error) {
    console.error('Failed to set admin session:', error);
  }
};

// Role hierarchy validation helpers
export const canManageRole = (currentRole: string, targetRole: string): boolean => {
  const roleHierarchy: { [key: string]: number } = {
    'admin': 1,
    'superadmin': 2,
    'super_super_admin': 3
  };
  
  const currentLevel = roleHierarchy[currentRole] || 0;
  const targetLevel = roleHierarchy[targetRole] || 0;
  
  // Super super admin can manage any role
  if (currentRole === 'super_super_admin') {
    return true;
  }
  
  // Superadmin can only manage admin roles, not other superadmins or super_super_admins
  if (currentRole === 'superadmin') {
    return targetRole === 'admin';
  }
  
  // Admin can't manage any other admin roles
  if (currentRole === 'admin') {
    return false;
  }
  
  return false;
};

export const canCreateRole = (currentRole: string, roleToCreate: string): boolean => {
  // Super super admin can create any role
  if (currentRole === 'super_super_admin') {
    return true;
  }
  
  // Superadmin can only create admin accounts
  if (currentRole === 'superadmin') {
    return roleToCreate === 'admin';
  }
  
  // Admin can't create any accounts
  return false;
};

export const canAccessSuperSuperAdminFeatures = (currentRole: string): boolean => {
  return currentRole === 'super_super_admin';
};

export const canViewRole = (currentRole: string, targetRole: string): boolean => {
  // Super super admin can view all roles
  if (currentRole === 'super_super_admin') {
    return true;
  }
  
  // Superadmin can view admin and superadmin accounts, but NOT super_super_admin
  if (currentRole === 'superadmin') {
    return targetRole === 'admin' || targetRole === 'superadmin';
  }
  
  // Admin can only view admin accounts
  if (currentRole === 'admin') {
    return targetRole === 'admin';
  }
  
  return false;
};
