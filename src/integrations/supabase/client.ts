import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'bujpqglebnkdwlbguekm';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1anBxZ2xlYm5rZHdsYmd1ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODE2MjEsImV4cCI6MjA2ODA1NzYyMX0.Db4ysTZ2uNEAy59uXjMx8fllwoAUlgyqAxZftZ1WKI8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);