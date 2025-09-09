import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required');
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

export const authenticateAdmin = async (username: string, password: string) => {
  try {
    const { data, error } = await adminSupabase.rpc('authenticate_admin', {
      _username: username,
      _password: password
    });

    if (error || !data || data.length === 0) {
      return { success: false, error: error?.message || 'Invalid credentials' };
    }

    return { 
      success: true, 
      admin: {
        id: data[0].id,
        username: data[0].username,
        role: data[0].role
      }
    };
  } catch (error) {
    return { success: false, error: 'Authentication failed' };
  }
};