import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateAdminSession, canAccessSuperSuperAdminFeatures } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AdminRouteProtectionProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'superadmin' | 'super_super_admin';
  requireSuperSuperAdmin?: boolean; // Explicit flag for super_super_admin only features
}

export const AdminRouteProtection = ({ children, requiredRole = 'admin', requireSuperSuperAdmin = false }: AdminRouteProtectionProps) => {
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

        // Check if super_super_admin access is explicitly required
        if (requireSuperSuperAdmin && !canAccessSuperSuperAdminFeatures(result.admin.role)) {
          toast({
            title: "Access Denied",
            description: "This feature requires Super Super Admin privileges.",
            variant: "destructive",
          });
          navigate('/admin-login');
          return;
        }

        // Check role requirements with strict hierarchy
        const roleHierarchy = {
          'admin': 1,
          'superadmin': 2,
          'super_super_admin': 3
        };

        const userRoleLevel = roleHierarchy[result.admin.role as keyof typeof roleHierarchy] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

        // Strict role checking - user must have exact role or higher, but with explicit restrictions
        if (userRoleLevel < requiredRoleLevel) {
          toast({
            title: "Access Denied",
            description: `This resource requires ${requiredRole} level access or higher.`,
            variant: "destructive",
          });
          navigate('/admin-login');
          return;
        }
        
        // Additional security: Validate the role is legitimate
        if (!['admin', 'superadmin', 'super_super_admin'].includes(result.admin.role)) {
          toast({
            title: "Security Error",
            description: "Invalid admin role detected. Please contact system administrator.",
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