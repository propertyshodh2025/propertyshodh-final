import { AdminRouteProtection } from './AdminRouteProtection';

interface SuperSuperAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper that ensures only super_super_admin users can access the wrapped content
 * This is a specialized version of AdminRouteProtection for the highest security level
 */
export const SuperSuperAdminRoute = ({ children }: SuperSuperAdminRouteProps) => {
  return (
    <AdminRouteProtection 
      requiredRole="super_super_admin" 
      requireSuperSuperAdmin={true}
    >
      {children}
    </AdminRouteProtection>
  );
};