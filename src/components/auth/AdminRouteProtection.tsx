import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateAdminSession } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AdminRouteProtectionProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'superadmin' | 'super_super_admin';
}

export const AdminRouteProtection = ({ children, requiredRole = 'admin' }: AdminRouteProtectionProps) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await validateAdminSession();
        
        if (!result.success || !result.admin) {
          toast({
            title: "Session Expired",
            description: "Please log in again.",
            variant: "destructive",
          });
          navigate('/admin-login');
          return;
        }

        // Check role requirements with hierarchy
        const roleHierarchy = {
          'admin': 1,
          'superadmin': 2,
          'super_super_admin': 3
        };

        const userRoleLevel = roleHierarchy[result.admin.role as keyof typeof roleHierarchy] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

        if (userRoleLevel < requiredRoleLevel) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this resource.",
            variant: "destructive",
          });
          navigate('/admin-login');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to verify session. Please log in again.",
          variant: "destructive",
        });
        navigate('/admin-login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requiredRole, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};