import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // This error indicates a problem with the environment setup, not the code itself.
  // The .env file must be in the project root and variables must be prefixed with VITE_.
  throw new Error('Supabase URL or Anon Key is required. Please ensure your .env file is correctly configured in the project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);