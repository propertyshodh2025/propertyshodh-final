import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { validateAdminSession, getCurrentAdminSession } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';

interface AdminRouteProtectionProps {
  requiredRole?: 'admin' | 'superadmin' | 'super_super_admin';
  children?: React.ReactNode;
}

export const AdminRouteProtection = ({ 
  requiredRole = 'admin', 
  children 
}: AdminRouteProtectionProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = getCurrentAdminSession();
        if (!session?.sessionToken) {
          setIsValid(false);
          return;
        }

        const { success, admin } = await validateAdminSession(session.sessionToken);
        
        if (success && admin) {
          // Check role if required
          if (requiredRole && admin.role !== requiredRole) {
            toast({
              title: 'Access Denied',
              description: `You need ${requiredRole} privileges to access this page`,
              variant: 'destructive'
            });
            setIsValid(false);
          } else {
            setIsValid(true);
          }
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsValid(false);
      }
    };

    checkAuth();
  }, [requiredRole, toast]);

  if (isValid === null) {
    return null; // Or loading spinner
  }

  if (!isValid) {
    return <Navigate to="/admin-login" replace />;
  }

  return children ? children : <Outlet />;
};