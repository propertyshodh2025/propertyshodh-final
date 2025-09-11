import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner'; // Assuming you have a LoadingSpinner component

interface AdminRouteProtectionProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'superadmin' | 'super_super_admin';
}

export const AdminRouteProtection: React.FC<AdminRouteProtectionProps> = ({ children, requiredRole }) => {
  const { admin, loading: adminAuthLoading } = useAdminAuth();
  const { loading: userAuthLoading } = useAuth();

  if (adminAuthLoading || userAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!admin) {
    // If no admin session, redirect to admin login
    return <Navigate to="/admin-login" replace />;
  }

  // Check if the admin's role meets the required role
  const roleHierarchy = {
    'admin': 1,
    'superadmin': 2,
    'super_super_admin': 3,
  };

  const currentAdminRoleLevel = roleHierarchy[admin.role as keyof typeof roleHierarchy] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  if (currentAdminRoleLevel < requiredRoleLevel) {
    // If the admin's role is insufficient, redirect to a forbidden page or admin dashboard
    return <Navigate to="/admin" replace />; // Or a specific /forbidden page
  }

  return <>{children}</>;
};