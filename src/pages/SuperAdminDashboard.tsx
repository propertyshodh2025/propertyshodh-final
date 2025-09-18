import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, NavLink, Routes, Route } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, Users, Activity, Search, Bookmark, Star, BarChart3, Columns3, TrendingUp, Shield, Zap, Home, Eye, Award, Construction, Play, Pause, AlertTriangle } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminManagementContent } from '@/components/admin/AdminManagementContent';
import SuperAdminCRMKanban from '@/components/superadmin/SuperAdminCRMKanban';
import SuperAdminSavedProperties from '@/components/superadmin/SuperAdminSavedProperties';
import FeaturePropertiesManager from '@/components/superadmin/FeaturePropertiesManager';
import MarketIntelligenceManager from '@/components/admin/MarketIntelligenceManager';
import SuperAdminSearchHistory from '@/components/superadmin/SuperAdminSearchHistory';
import SuperAdminPropertyInterest from '@/components/superadmin/SuperAdminPropertyInterest';
import { AdminSiteSettings } from '@/components/admin/AdminSiteSettings';
import AdminActivities from '@/pages/AdminActivities';
import UserManagement from '@/components/superadmin/UserManagement';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';
import { adminSupabase } from '@/lib/adminSupabase';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface MaintenanceMode {
  is_active: boolean;
  message: string;
  enabled_at: string | null;
}

// Helper function to generate monthly analytics from actual data
const generateMonthlyAnalytics = (users: any[], properties: any[], inquiries: any[]) => {
  const currentDate = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = [];
  
  // Generate data for the last 6 months
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = monthNames[targetDate.getMonth()];
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    // Count items created in this month
    const usersCount = users.filter(user => {
      if (!user.created_at) return false;
      const createdDate = new Date(user.created_at);
      return createdDate.getFullYear() === year && createdDate.getMonth() === month;
    }).length;
    
    const propertiesCount = properties.filter(property => {
      if (!property.created_at) return false;
      const createdDate = new Date(property.created_at);
      return createdDate.getFullYear() === year && createdDate.getMonth() === month;
    }).length;
    
    const inquiriesCount = inquiries.filter(inquiry => {
      if (!inquiry.created_at) return false;
      const createdDate = new Date(inquiry.created_at);
      return createdDate.getFullYear() === year && createdDate.getMonth() === month;
    }).length;
    
    monthlyData.push({
      month: monthName,
      users: usersCount,
      properties: propertiesCount,
      inquiries: inquiriesCount
    });
  }
  
  return monthlyData;
};

const SuperAdminDashboard: React.FC = () => {
  const { adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceMode>({ is_active: false, message: '', enabled_at: null });
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeProperties: 0,
    totalInquiries: 0,
    monthlyData: []
  });
  
  useEffect(() => {
    fetchMaintenanceStatus();
    fetchAnalytics();
  }, []);
  
  const fetchMaintenanceStatus = async () => {
    try {
      console.log('🔍 Fetching maintenance status in SuperAdmin...');
      const { data, error } = await supabase
        .from('site_settings')
        .select('maintenance_mode, maintenance_message, maintenance_enabled_at')
        .single();
        
      console.log('📊 SuperAdmin fetch result:', { data, error });
        
      if (!error && data) {
        setMaintenanceMode({
          is_active: data.maintenance_mode || false,
          message: data.maintenance_message || 'Site is under maintenance. Please check back later.',
          enabled_at: data.maintenance_enabled_at
        });
        console.log('✅ SuperAdmin maintenance status set:', {
          is_active: data.maintenance_mode || false,
          message: data.maintenance_message || 'Site is under maintenance. Please check back later.',
          enabled_at: data.maintenance_enabled_at
        });
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
    }
  };
  
  const fetchAnalytics = async () => {
    try {
      console.log('Fetching analytics data...');
      
      // Get ALL types of inquiries/interests from all sources (based on actual component queries)
      const [propertiesRes, usersRes, propertyInquiriesRes, userInquiriesRes, searchActivitiesRes, savedActivitiesRes, researchLeadsRes, allActivitiesRes] = await Promise.all([
        adminSupabase.from('properties').select('id, listing_status, created_at'),
        adminSupabase.from('profiles').select('id, created_at'),
        adminSupabase.from('property_inquiries').select('id, created_at'),
        adminSupabase.from('user_inquiries').select('id, created_at'),
        adminSupabase.from('user_activities').select('id, created_at').eq('activity_type', 'search').not('search_query', 'is', null),
        adminSupabase.from('user_activities').select('id, created_at').eq('activity_type', 'property_saved').not('property_id', 'is', null),
        adminSupabase.from('research_report_leads').select('id, created_at'),
        // Get all activity types to see what's available
        adminSupabase.from('user_activities').select('activity_type').limit(1000)
      ]);
      
      // Check for errors in queries
      if (propertiesRes.error) {
        console.error('Properties query error:', propertiesRes.error);
      }
      if (usersRes.error) {
        console.error('Users query error:', usersRes.error);
      }
      if (propertyInquiriesRes.error) {
        console.error('Property inquiries query error:', propertyInquiriesRes.error);
      }
      if (userInquiriesRes.error) {
        console.error('User inquiries query error:', userInquiriesRes.error);
      }
      if (searchActivitiesRes.error) {
        console.error('Search activities query error:', searchActivitiesRes.error);
      }
      if (savedActivitiesRes.error) {
        console.error('Saved activities query error:', savedActivitiesRes.error);
      }
      if (researchLeadsRes.error) {
        console.error('Research leads query error:', researchLeadsRes.error);
      }
      if (allActivitiesRes.error) {
        console.error('All activities query error:', allActivitiesRes.error);
      }
      
      // Log available activity types
      const activityTypes = [...new Set((allActivitiesRes.data || []).map(a => a.activity_type))];
      console.log('Available activity types:', activityTypes);
      
      console.log('Data fetched:', {
        properties: propertiesRes.data?.length || 0,
        users: usersRes.data?.length || 0,
        propertyInquiries: propertyInquiriesRes.data?.length || 0,
        userInquiries: userInquiriesRes.data?.length || 0,
        searchActivities: searchActivitiesRes.data?.length || 0,
        savedActivities: savedActivitiesRes.data?.length || 0,
        researchLeads: researchLeadsRes.data?.length || 0
      });
      
      // Total inquiries = all forms of interest and inquiries
      const totalInquiries = (
        (propertyInquiriesRes.data?.length || 0) +
        (userInquiriesRes.data?.length || 0) +
        (searchActivitiesRes.data?.length || 0) +
        (savedActivitiesRes.data?.length || 0) +
        (researchLeadsRes.data?.length || 0)
      );
      
      console.log('Total inquiries calculation:', {
        propertyInquiries: propertyInquiriesRes.data?.length || 0,
        userInquiries: userInquiriesRes.data?.length || 0,
        searchActivities: searchActivitiesRes.data?.length || 0,
        savedActivities: savedActivitiesRes.data?.length || 0,
        researchLeads: researchLeadsRes.data?.length || 0,
        total: totalInquiries
      });
      const activeProperties = propertiesRes.data?.filter(p => {
        console.log('Property status:', p.listing_status);
        return p.listing_status === 'Active';
      }).length || 0;
      
      // Generate monthly data from actual database records - include all inquiry sources
      const allInquiryData = [
        ...(propertyInquiriesRes.data || []),
        ...(userInquiriesRes.data || []),
        ...(searchActivitiesRes.data || []),
        ...(savedActivitiesRes.data || []),
        ...(researchLeadsRes.data || [])
      ];
      
      const monthlyData = generateMonthlyAnalytics(
        usersRes.data || [],
        propertiesRes.data || [],
        allInquiryData
      );
      
      console.log('Generated monthly data:', monthlyData);
      
      setAnalyticsData({
        totalUsers: usersRes.data?.length || 0,
        totalProperties: propertiesRes.data?.length || 0,
        activeProperties: activeProperties,
        totalInquiries: totalInquiries,
        monthlyData: monthlyData
      });
      
      console.log('Analytics data set successfully');
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await adminLogout();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/admin-login');
  };
  
  const toggleMaintenanceMode = async () => {
    console.log('🔄 Toggling maintenance mode from:', maintenanceMode.is_active, 'to:', !maintenanceMode.is_active);
    setLoading(true);
    try {
      const newMode = !maintenanceMode.is_active;
      const now = new Date().toISOString();
      
      console.log('📊 New mode will be:', newMode);
      
      // First check if site_settings record exists
      const { data: existingSettings, error: fetchError } = await supabase
        .from('site_settings')
        .select('id')
        .single();
        
      console.log('🔍 Existing settings:', { existingSettings, fetchError });
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      const updateData = {
        maintenance_mode: newMode,
        maintenance_message: 'Site is under maintenance. We\'ll be back shortly!',
        maintenance_enabled_at: newMode ? now : null,
        updated_at: now
      };
      
      console.log('📦 Update data:', updateData);
      
      if (existingSettings) {
        console.log('🔄 Updating existing record with ID:', existingSettings.id);
        // Update existing record
        const { data: updateResult, error } = await supabase
          .from('site_settings')
          .update(updateData)
          .eq('id', existingSettings.id)
          .select();
          
        console.log('✅ Update result:', { updateResult, error });
        if (error) throw error;
      } else {
        console.log('➕ Inserting new record');
        // Insert new record
        const { data: insertResult, error } = await supabase
          .from('site_settings')
          .insert(updateData)
          .select();
          
        console.log('✅ Insert result:', { insertResult, error });
        if (error) throw error;
      }
      
      setMaintenanceMode({
        is_active: newMode,
        message: updateData.maintenance_message,
        enabled_at: updateData.maintenance_enabled_at
      });
      
      toast({
        title: newMode ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
        description: newMode 
          ? 'Site is now in maintenance mode for regular users.'
          : 'Site is now accessible to all users.',
        variant: newMode ? 'destructive' : 'default'
      });
    } catch (error: any) {
      console.error('Error toggling maintenance mode:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle maintenance mode.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-900/20">
      {/* Animated background pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIxIj4KPGNpcmNsZSBjeD0iNyIgY3k9IjciIHI9IjIiLz4KPC9nPgo8L2c+Cjwvc3ZnPg==')]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Modern Header with Glass Effect */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl shadow-purple-500/10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-800 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
                    <TranslatableText text="Super Admin Dashboard" />
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                    PropertyShodh - Complete System Control
                    {maintenanceMode.is_active && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Maintenance Mode
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSignOut} variant="outline" className="bg-white/50 dark:bg-slate-800/50 border-white/30 hover:bg-white/80 backdrop-blur-sm transition-all duration-200">
                <LogOut size={16} className="mr-2" />
                <TranslatableText text="Sign Out" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Modern Stats Cards with Glass Effect */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{analyticsData.totalUsers}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Properties</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analyticsData.totalProperties}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Home className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Active Properties</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analyticsData.activeProperties}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Inquiries</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analyticsData.totalInquiries}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Navigation Tabs with Glass Effect */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-2xl p-2 mb-8 shadow-lg">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-2">
            <NavLink
              to="/superadmin"
              end
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <BarChart3 size={16} />
              <span className="text-xs truncate"><TranslatableText text="Analytics" /></span>
            </NavLink>
            <NavLink
              to="/superadmin/manage-users"
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Shield size={16} />
              <span className="text-xs truncate"><TranslatableText text="Manage Users" /></span>
            </NavLink>
            <NavLink
              to="/superadmin/manage-admins"
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Users size={16} />
              <span className="text-xs truncate"><TranslatableText text="Manage Admins" /></span>
            </NavLink>
            <NavLink
              to="/superadmin/crm"
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Columns3 size={16} />
              <span className="text-xs truncate"><TranslatableText text="CRM" /></span>
            </NavLink>
            <NavLink
              to="/superadmin/property-interest"
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <TrendingUp size={16} />
              <span className="text-xs truncate"><TranslatableText text="Interest" /></span>
            </NavLink>
            <NavLink
              to="/superadmin/search-history"
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Search size={16} />
              <span className="text-xs truncate"><TranslatableText text="Search" /></span>
            </NavLink>
            <NavLink
              to="/superadmin/featured"
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Star size={16} />
              <span className="text-xs truncate"><TranslatableText text="Featured" /></span>
            </NavLink>
            <NavLink
              to="/superadmin/settings"
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Settings size={16} />
              <span className="text-xs truncate"><TranslatableText text="Settings" /></span>
            </NavLink>
          </div>
        </div>

        {/* Analytics Dashboard (Default View) */}
        <Routes>
          <Route index element={<SuperAdminAnalytics analyticsData={analyticsData} />} />
          <Route path="manage-users" element={<UserManagement />} />
          <Route path="manage-admins" element={<AdminManagementContent />} />
          <Route path="crm" element={<SuperAdminCRMKanban />} />
          <Route path="property-interest" element={<SuperAdminPropertyInterest />} />
          <Route path="search-history" element={<SuperAdminSearchHistory />} />
          <Route path="saved" element={<SuperAdminSavedProperties />} />
          <Route path="featured" element={<FeaturePropertiesManager />} />
          <Route path="settings" element={<SuperAdminSiteSettings toggleMaintenanceMode={toggleMaintenanceMode} maintenanceMode={maintenanceMode} />} />
        </Routes>
      </div>
    </div>
  );
};

// Super Admin Analytics Component
interface SuperAdminAnalyticsProps {
  analyticsData: {
    totalUsers: number;
    totalProperties: number;
    activeProperties: number;
    totalInquiries: number;
    monthlyData: Array<{
      month: string;
      users: number;
      properties: number;
      inquiries: number;
    }>;
  };
}

const SuperAdminAnalytics: React.FC<SuperAdminAnalyticsProps> = ({ analyticsData }) => {
  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];
  
  const statusData = [
    { name: 'Active', value: analyticsData.activeProperties },
    { name: 'Total', value: analyticsData.totalProperties - analyticsData.activeProperties },
  ];
  
  return (
    <div className="space-y-6">
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Chart */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold">Monthly Growth</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="users" fill="#8B5CF6" name="New Users" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="properties" fill="#3B82F6" name="New Properties" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inquiries" fill="#10B981" name="Inquiries" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Property Status Distribution */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold">Property Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Trend */}
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold">Platform Growth Trends</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontWeight={500}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontWeight={500}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8B5CF6" 
                  strokeWidth={3} 
                  name="Users Growth"
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2, fill: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="properties" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  name="Properties Growth"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="inquiries" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  name="Inquiries Growth"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Site Settings with Maintenance Mode
interface SuperAdminSiteSettingsProps {
  toggleMaintenanceMode: () => void;
  maintenanceMode: MaintenanceMode;
}

const SuperAdminSiteSettings: React.FC<SuperAdminSiteSettingsProps> = ({ toggleMaintenanceMode, maintenanceMode }) => {
  return (
    <div className="space-y-6">
      <AdminSiteSettings />
      
      {/* Maintenance Mode Section */}
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              maintenanceMode.is_active 
                ? 'bg-gradient-to-br from-red-500 to-red-600' 
                : 'bg-gradient-to-br from-green-500 to-emerald-600'
            }`}>
              <Construction className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Maintenance Mode Control</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Control site accessibility for regular users
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div>
              <h3 className="font-medium">Current Status</h3>
              <p className="text-sm text-muted-foreground">
                {maintenanceMode.is_active ? 'Site is in maintenance mode' : 'Site is fully operational'}
              </p>
              {maintenanceMode.enabled_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last changed: {new Date(maintenanceMode.enabled_at).toLocaleString()}
                </p>
              )}
            </div>
            <Badge 
              variant={maintenanceMode.is_active ? 'destructive' : 'default'}
              className="px-3 py-1"
            >
              {maintenanceMode.is_active ? 'Maintenance Active' : 'Site Active'}
            </Badge>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">Important Note</p>
                <p className="text-amber-700 dark:text-amber-400">
                  When maintenance mode is enabled, regular users will be blocked from accessing the site. 
                  Admin, SuperAdmin, and Super Super Admin users will still have access.
                </p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={toggleMaintenanceMode}
            variant={maintenanceMode.is_active ? 'destructive' : 'default'}
            className={`w-full ${maintenanceMode.is_active 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            } text-white shadow-lg hover:shadow-xl transition-all duration-200`}
            size="lg"
          >
            {maintenanceMode.is_active ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Disable Maintenance Mode
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Enable Maintenance Mode
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
