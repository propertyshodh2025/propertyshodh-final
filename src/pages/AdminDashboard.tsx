import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Home, Users, MessageSquare, BarChart3, Settings, Activity, Bookmark, Star } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminActivityFeed } from '@/components/admin/AdminActivityFeed';
import AdminSavedProperties from '@/components/admin/AdminSavedProperties';
import FeaturePropertiesManager from '@/components/admin/FeaturePropertiesManager';
import MarketIntelligenceManager from '@/components/admin/MarketIntelligenceManager';
import { AdminSiteSettings } from '@/components/admin/AdminSiteSettings';
import { AdminManagementContent } from '@/components/admin/AdminManagementContent'; // Assuming this is for user/admin management
import { Badge } from '@/components/ui/badge'; // Added Badge import

const AdminDashboard: React.FC = () => {
  const { adminLogout, admin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview'); // Default tab

  const handleSignOut = async () => {
    await adminLogout();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/admin-login');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading admin session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            <TranslatableText text="Admin Dashboard" />
          </h1>
          <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
            <LogOut size={16} />
            <TranslatableText text="Sign Out" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2"
          >
            <Home size={16} />
            <TranslatableText text="Overview" />
          </Button>
          <Button
            variant={activeTab === 'properties' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('properties')}
            className="flex items-center gap-2"
          >
            <Star size={16} />
            <TranslatableText text="Featured Properties" />
          </Button>
          <Button
            variant={activeTab === 'market-intelligence' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('market-intelligence')}
            className="flex items-center gap-2"
          >
            <BarChart3 size={16} />
            <TranslatableText text="Market Intelligence" />
          </Button>
          <Button
            variant={activeTab === 'saved-properties' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('saved-properties')}
            className="flex items-center gap-2"
          >
            <Bookmark size={16} />
            <TranslatableText text="Saved Properties" />
          </Button>
          <Button
            variant={activeTab === 'admin-activities' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('admin-activities')}
            className="flex items-center gap-2"
          >
            <Activity size={16} />
            <TranslatableText text="Admin Activities" />
          </Button>
          {admin?.role === 'superadmin' && (
            <Button
              variant={activeTab === 'admin-management' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('admin-management')}
              className="flex items-center gap-2"
            >
              <Users size={16} />
              <TranslatableText text="Admin Management" />
            </Button>
          )}
          <Button
            variant={activeTab === 'site-settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('site-settings')}
            className="flex items-center gap-2"
          >
            <Settings size={16} />
            <TranslatableText text="Site Settings" />
          </Button>
        </div>

        {/* Content based on active tab */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle>Welcome, {admin?.username || 'Admin'}!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This is your central hub for managing the application. Use the tabs above to navigate through different sections.
                </p>
                <div className="mt-4 space-y-2">
                  <p><strong>Your Role:</strong> <Badge>{admin?.role || 'N/A'}</Badge></p>
                  <p><strong>Admin ID:</strong> <Badge variant="secondary">{admin?.id || 'N/A'}</Badge></p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'properties' && <FeaturePropertiesManager />}
          {activeTab === 'market-intelligence' && <MarketIntelligenceManager />}
          {activeTab === 'saved-properties' && <AdminSavedProperties />}
          {activeTab === 'admin-activities' && <AdminActivityFeed />}
          {activeTab === 'admin-management' && admin?.role === 'superadmin' && <AdminManagementContent />}
          {activeTab === 'site-settings' && <AdminSiteSettings />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;