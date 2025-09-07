import React from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Users, Activity } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminManagementContent } from '@/components/admin/AdminManagementContent'; // Import the new content component

const SuperAdminDashboard: React.FC = () => {
  const { signOutAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            <TranslatableText text="Super Admin Dashboard" />
          </h1>
          <Button onClick={signOutAdmin} variant="outline" className="flex items-center gap-2">
            <LogOut size={16} />
            <TranslatableText text="Sign Out" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
          <NavLink
            to="/superadmin"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            <Users size={16} />
            <TranslatableText text="Manage Admins" />
          </NavLink>
          <NavLink
            to="/superadmin/settings"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            <Settings size={16} />
            <TranslatableText text="Site Settings" />
          </NavLink>
          <NavLink
            to="/superadmin/activities"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            <Activity size={16} />
            <TranslatableText text="Admin Activities" />
          </NavLink>
        </div>

        {/* Render nested routes content */}
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;