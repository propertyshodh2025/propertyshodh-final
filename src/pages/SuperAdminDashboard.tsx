import React from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Users, Activity, MessageSquare, Search, Bookmark, Star, BarChart3, Columns3, TrendingUp } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminManagementContent } from '@/components/admin/AdminManagementContent'; // Import the new content component
import SuperAdminCRMKanban from '@/components/superadmin/SuperAdminCRMKanban'; // New CRM for Superadmin
import SuperAdminSavedProperties from '@/components/superadmin/SuperAdminSavedProperties'; // Moved
import FeaturePropertiesManager from '@/components/superadmin/FeaturePropertiesManager'; // Moved
import MarketIntelligenceManager from '@/components/superadmin/MarketIntelligenceManager'; // Moved
import SuperAdminSearchHistory from '@/components/superadmin/SuperAdminSearchHistory'; // New
import SuperAdminPropertyInterest from '@/components/superadmin/SuperAdminPropertyInterest'; // New
import SuperAdminUserInquiries from '@/components/superadmin/SuperAdminUserInquiries'; // New

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
            to="/superadmin/crm"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            <Columns3 size={16} />
            <TranslatableText text="CRM" />
          </NavLink>
          <NavLink
            to="/superadmin/inquiries"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            <MessageSquare size={16} />
            <TranslatableText text="General Inquiries" />
          </NavLink>
          <NavLink
            to="/superadmin/property-interest"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            <TrendingUp size={16} />
            <TranslatableText text="Property Interest" />
          </NavLink>
          <NavLink
            to="/superadmin/search-history"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            <Search size={16} />
            <TranslatableText text="Search History" />
          </NavLink>
          <NavLink
            to="/superadmin/saved"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            <Bookmark size={16} />
            <TranslatableText text="Saved Properties" />
          </NavLink>
          <NavLink
            to="/superadmin/featured"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            <Star size={16} />
            <TranslatableText text="Featured Properties" />
          </NavLink>
          <NavLink
            to="/superadmin/market-intelligence"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            <BarChart3 size={16} />
            <TranslatableText text="Market Intelligence" />
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
        <Routes>
          <Route index element={<AdminManagementContent />} /> {/* Default for /superadmin */}
          <Route path="crm" element={<SuperAdminCRMKanban />} />
          <Route path="inquiries" element={<SuperAdminUserInquiries />} />
          <Route path="property-interest" element={<SuperAdminPropertyInterest />} />
          <Route path="search-history" element={<SuperAdminSearchHistory />} />
          <Route path="saved" element={<SuperAdminSavedProperties />} />
          <Route path="featured" element={<FeaturePropertiesManager />} />
          <Route path="market-intelligence" element={<MarketIntelligenceManager />} />
          <Route path="settings" element={<AdminSiteSettings />} />
          <Route path="activities" element={<AdminActivities />} />
        </Routes>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;