"use client";

import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TranslatableText } from '@/components/TranslatableText';
import { AdminSiteSettings } from '@/components/admin/AdminSiteSettings'; // Import the new component

// Assuming your SuperAdminDashboard has a layout similar to this
export const SuperAdminDashboard: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/superadmin', icon: Home, label: 'Dashboard' },
    { path: '/superadmin/users', icon: Users, label: 'Users' },
    { path: '/superadmin/settings', icon: Settings, label: 'Settings' }, // New settings tab
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4">
        <h2 className="text-2xl font-bold mb-6 text-primary"><TranslatableText text="Super Admin" /></h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-lg py-6",
                  location.pathname === item.path && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <TranslatableText text={item.label} />
              </Button>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">
          {navItems.find(item => location.pathname === item.path)?.label || 'Super Admin Dashboard'}
        </h1>
        
        {/* This is where nested routes will render */}
        {location.pathname === '/superadmin/settings' ? (
          <AdminSiteSettings />
        ) : (
          <Outlet /> // Renders child routes defined in App.tsx
        )}
      </main>
    </div>
  );
};