// Change this import:
import { adminSupabase, isAdminAuthenticated } from '@/lib/adminSupabase';

// To this if you're using the quick check:
const { quickAuthCheck } = useAdminAuth();

// Or use the new function directly:
const isAuth = await isAdminAuthenticated();