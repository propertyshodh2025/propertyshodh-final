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

// Add this new function
export const isAdminAuthenticated = async () => {
  const session = getCurrentAdminSession();
  if (!session?.sessionToken) return false;
  
  const { success } = await validateAdminSession(session.sessionToken);
  return success;
};

// Keep all your existing exports (validateAdminSession, authenticateAdmin, etc.)
// ... (rest of your existing code)