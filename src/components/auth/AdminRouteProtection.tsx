import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminRouteProtectionProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'superadmin' | 'super_super_admin';
}

export const AdminRouteProtection: React.FC<AdminRouteProtectionProps> = ({ children, requiredRole }) => {
  const { admin, loading: adminAuthLoading } = useAdminAuth();
  const { loading: userAuthLoading } = useAuth();

  console.log('AdminRouteProtection: Rendering. AdminAuthLoading:', adminAuthLoading, 'UserAuthLoading:', userAuthLoading, 'Admin:', admin, 'Required Role:', requiredRole);

  if (adminAuthLoading || userAuthLoading) {
    console.log('AdminRouteProtection: Showing loading spinner.');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!admin) {
    console.log('AdminRouteProtection: No admin found, redirecting to /admin-login.');
    return <Navigate to="/admin-login" replace />;
  }

  const roleHierarchy = {
    'admin': 1,
    'superadmin': 2,
    'super_super_admin': 3,
  };

  const currentAdminRoleLevel = roleHierarchy[admin.role as keyof typeof roleHierarchy] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  console.log('AdminRouteProtection: Current Admin Role:', admin.role, 'Level:', currentAdminRoleLevel, 'Required Role:', requiredRole, 'Level:', requiredRoleLevel);

  if (currentAdminRoleLevel < requiredRoleLevel) {
    console.log('AdminRouteProtection: Insufficient role, redirecting to /admin.');
    return <Navigate to="/admin" replace />;
  }

  console.log('AdminRouteProtection: Access granted.');
  return <>{children}</>;
};