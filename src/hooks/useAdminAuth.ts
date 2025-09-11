import { isAdminAuthenticated } from '@/lib/adminSupabase';

// Update your hook to use the new function
export const useAdminAuth = () => {
  // ... existing code
  
  const checkAuth = async () => {
    const isAuth = await isAdminAuthenticated();
    setIsAdminAuthenticated(isAuth);
  };

  // ... rest of your hook
};