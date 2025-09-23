import React from 'react';
import { useLocation } from 'react-router-dom';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import MaintenanceMode from './MaintenanceMode';

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export const MaintenanceWrapper: React.FC<MaintenanceWrapperProps> = ({ children }) => {
  const { isActive, message, enabledAt, loading } = useMaintenanceMode();
  const location = useLocation();

  // Define routes that should be accessible even during maintenance mode
  const allowedRoutes = [
    '/admin-login',
    '/admin',
    '/superadmin',
    '/omega-admin'
  ];

  // Check if current route is an admin route
  const isAdminRoute = allowedRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  console.log('🚀 MaintenanceWrapper status:', {
    isActive,
    loading,
    currentPath: location.pathname,
    isAdminRoute,
    message
  });

  // Show loading state while fetching maintenance status
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If maintenance mode is active and this is not an admin route, show maintenance page
  if (isActive && !isAdminRoute) {
    return <MaintenanceMode message={message} enabledAt={enabledAt} />;
  }

  // Otherwise, render the normal app
  return <>{children}</>;
};

export default MaintenanceWrapper;