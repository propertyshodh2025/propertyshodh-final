import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink, BarChart3, Home, Star, Check, X, Columns3, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { adminSupabase, getCurrentAdminSession } from '@/lib/adminSupabase';
import { Property } from '@/types/database';
import { ConversationalAdminPropertyForm } from '@/components/ConversationalAdminPropertyForm';
import { AdminPropertyFormDialog } from '@/components/admin/AdminPropertyFormDialog';
import { PropertyInterestDropdown } from '@/components/PropertyInterestDropdown';
import VerificationManagement from '@/components/admin/VerificationManagement';
import CRMKanban from '@/components/admin/CRMKanban';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatINRShort } from '@/lib/locale';

// New interface for search history items with profile details (no longer needed here, but keeping for reference if moved back)
interface UserActivityWithProfile {
  id: string;
  user_id: string;
  activity_type: string;
  property_id: string | null;
  search_query: string | null;
  metadata: any; // Assuming metadata can be any JSONB structure
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
  } | null;
}

const AdminDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdminAuthenticated, loading: authLoading, adminLogout } = useAdminAuth();
  const { language } = useLanguage();

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    console.log('AdminDashboard: Auth loading:', authLoading, 'Is authenticated:', isAdminAuthenticated);
    
    if (!authLoading && !isAdminAuthenticated) {
      console.log('AdminDashboard: Not authenticated, redirecting to login');
      navigate('/admin-login');
      return;
    }
    
    if (isAdminAuthenticated) {
      console.log('AdminDashboard: Authenticated, fetching data');
      fetchProperties();
      fetchUserProperties();
    }
  }, [navigate, isAdminAuthenticated, authLoading]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('properties')
        .select('*')
        .or('submitted_by_user.is.null,submitted_by_user.eq.false')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProperties = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('properties')
        .select('*')
        .eq('submitted_by_user', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately if needed
      const propertiesWithProfiles = await Promise.all(
        (data || []).map(async (property) => {
          if (property.user_id) {
            const { data: profile } = await adminSupabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', property.user_id)
              .maybeSingle();
            
            return {
              ...property,
              profiles: profile
            };
          }
          return property;
        })
      );

      setUserProperties(propertiesWithProfiles);
    } catch (error) {
      console.error('Error fetching user properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user properties",
        variant: "destructive",
      });
    }
  };

  // Removed fetchInquiries, fetchPropertyInquiries, fetchFeatureRequests, fetchSearchHistory

  const handleFeatureRequestAction = async (requestId: string, action: 'approved' | 'rejected', propertyId?: string) => {
    try {
      // Get current admin session to get the actual admin ID
      const session = getCurrentAdminSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Admin session not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Update the feature request status
      const { error: requestError } = await adminSupabase
        .from('property_feature_requests')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by_admin_id: session.id
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // If approved, mark the property as featured
      if (action === 'approved' && propertyId) {
        const { error: propertyError } = await adminSupabase
          .from('properties')
          .update({
            is_featured: true,
            featured_at: new Date().toISOString()
          })
          .eq('id', propertyId);

        if (propertyError) throw propertyError;
      }

      // Refresh the data
      // Removed fetchFeatureRequests();
      fetchProperties();
      fetchUserProperties();

      toast({
        title: "Success",
        description: `Feature request ${action} successfully`,
      });
    } catch (error) {
      console.error('Error handling feature request:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} feature request`,
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    // Clear admin authentication
    adminLogout();
    // Also clear any regular user authentication to prevent confusion
    localStorage.clear();
    sessionStorage.clear();
    navigate('/admin-login');
  };

  const handleStatusChange = async (id: string, newStatus: 'Active' | 'Inactive' | 'Sold') => {
    try {
      const { error } = await adminSupabase
        .from('properties')
        .update({ listing_status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update both properties and userProperties states
      setProperties(prev => 
        prev.map(property => 
          property.id === id 
            ? { ...property, listing_status: newStatus }
            : property
        )
      );

      setUserProperties(prev => 
        prev.map(property => 
          property.id === id 
            ? { ...property, listing_status: newStatus }
            : property
        )
      );

      toast({
        title: "Success",
        description: `Property marked as ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      console.error('Error updating property status:', error);
      toast({
        title: "Error",
        description: "Failed to update property status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const { error } = await adminSupabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProperties(properties.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  const handleFeatureProperty = async (id: string, currentFeaturedStatus: boolean = false) => {
    try {
      const now = new Date().toISOString();
      const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await adminSupabase
        .from('properties')
        .update({ 
          is_featured: !currentFeaturedStatus,
          featured_at: !currentFeaturedStatus ? now : null,
          featured_until: !currentFeaturedStatus ? oneWeekLater : null,
          approval_status: 'approved', // Auto-approve when featuring
          listing_status: 'active'      // Ensure it's active when featured
        })
        .eq('id', id);

      if (error) throw error;

      // Update both properties and userProperties states
      setProperties(prev => 
        prev.map(property => 
          property.id === id 
            ? { 
                ...property, 
                is_featured: !currentFeaturedStatus,
                featured_at: !currentFeaturedStatus ? now : null,
                featured_until: !currentFeaturedStatus ? oneWeekLater : null,
                approval_status: 'approved',
                listing_status: 'active'
              }
            : property
        )
      );

      setUserProperties(prev => 
        prev.map(property => 
          property.id === id 
            ? { 
                ...property, 
                is_featured: !currentFeaturedStatus,
                featured_at: !currentFeaturedStatus ? now : null,
                featured_until: !currentFeaturedStatus ? oneWeekLater : null,
                approval_status: 'approved',
                listing_status: 'active'
              }
            : property
        )
      );

      toast({
        title: "Success",
        description: !currentFeaturedStatus 
          ? "Property featured and approved for 1 week" 
          : "Property unfeatured",
      });
    } catch (error) {
      console.error('Error featuring property:', error);
      toast({
        title: "Error",
        description: "Failed to feature property",
        variant: "destructive",
      });
    }
  };

  const getStorageKeyFromUrl = (url: string): string | null => {
    const marker = '/object/public/property-images/';
    const idx = url.indexOf(marker);
    return idx !== -1 ? url.substring(idx + marker.length) : null;
  };

  const duplicateImages = async (originalImages: string[]): Promise<string[]> => {
    if (!originalImages || originalImages.length === 0) return [];
    
    const duplicatedImageUrls: string[] = [];
    
    for (const imageUrl of originalImages) {
      try {
        const originalKey = getStorageKeyFromUrl(imageUrl);
        if (!originalKey) {
          console.warn('Could not extract storage key from URL:', imageUrl);
          continue;
        }

        // Download the original image
        const { data: imageData, error: downloadError } = await adminSupabase.storage
          .from('property-images')
          .download(originalKey);

        if (downloadError) {
          console.error('Error downloading image:', downloadError);
          continue;
        }

        // Generate a new filename for the copy
        const fileExtension = originalKey.split('.').pop() || 'jpg';
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2);
        const newFileName = `duplicated/${timestamp}-${randomId}.${fileExtension}`;

        // Upload the image copy
        const { error: uploadError } = await adminSupabase.storage
          .from('property-images')
          .upload(newFileName, imageData);

        if (uploadError) {
          console.error('Error uploading image copy:', uploadError);
          continue;
        }

        // Get the public URL for the new image
        const { data: urlData } = adminSupabase.storage
          .from('property-images')
          .getPublicUrl(newFileName);

        duplicatedImageUrls.push(urlData.publicUrl);
      } catch (error) {
        console.error('Error duplicating image:', error);
      }
    }

    return duplicatedImageUrls;
  };

  const handleDuplicate = async (originalProperty: Property) => {
    try {
      toast({
        title: "Duplicating...",
        description: "Copying property and images, please wait...",
      });

      // Duplicate images first
      const duplicatedImages = await duplicateImages(originalProperty.images || []);

      // Create a new property object with core essential fields
      const duplicatedProperty = {
        title: `${originalProperty.title} - Copy`,
        description: originalProperty.description,
        property_type: originalProperty.property_type,
        bhk: originalProperty.bhk,
        price: originalProperty.price,
        location: originalProperty.location,
        city: originalProperty.city,
        carpet_area: originalProperty.carpet_area,
        amenities: originalProperty.amenities,
        possession_status: originalProperty.possession_status,
        parking_spaces: originalProperty.parking_spaces,
        floor_number: originalProperty.floor_number,
        total_floors: originalProperty.total_floors,
        age_of_property: originalProperty.age_of_property,
        facing_direction: originalProperty.facing_direction,
        images: duplicatedImages, // Use the duplicated images
        submitted_by_user: false,
        approval_status: 'pending',
        listing_status: 'Inactive',
        agent_name: originalProperty.agent_name,
        agent_phone: originalProperty.agent_phone,
        built_year: originalProperty.built_year,
        verification_status: 'unverified',
        verification_score: 0,
        user_id: null,
        transaction_type: originalProperty.transaction_type,
        property_category: originalProperty.property_category,
        is_featured: false,
        contact_number: originalProperty.contact_number,
        bathrooms: originalProperty.bathrooms,
      };

      const { error } = await adminSupabase
        .from('properties')
        .insert([duplicatedProperty]);

      if (error) throw error;

      // Refresh the properties lists
      fetchProperties();
      fetchUserProperties();

      toast({
        title: "Success",
        description: `Property duplicated successfully with ${duplicatedImages.length} images copied`,
      });
    } catch (error) {
      console.error('Error duplicating property:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate property",
        variant: "destructive",
      });
    }
  };

  const handleApproveProperty = async (id: string, approve: boolean) => {
    try {
      const newStatus = approve ? 'approved' : 'rejected';
      const listingStatus = approve ? 'Active' : 'Hidden';
      
      const { error } = await adminSupabase
        .from('properties')
        .update({ 
          approval_status: newStatus,
          listing_status: listingStatus
        })
        .eq('id', id);

      if (error) throw error;
      
      // Update the userProperties state to reflect the change
      setUserProperties(prev => 
        prev.map(property => 
          property.id === id 
            ? { ...property, approval_status: newStatus, listing_status: listingStatus }
            : property
        )
      );
      
      toast({
        title: "Success",
        description: `Property ${approve ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error approving property:', error);
      toast({
        title: "Error",
        description: `Failed to ${approve ? 'approve' : 'reject'} property`,
        variant: "destructive",
      });
    }
  };

  const openPropertyInNewTab = (propertyId: string) => {
    window.open(`/property/${propertyId}`, '_blank');
  };

  // Filter functions
  const filteredProperties = properties.filter(property => {
    const searchLower = searchTerm.toLowerCase();
    return (
      property.title.toLowerCase().includes(searchLower) ||
      property.location.toLowerCase().includes(searchLower) ||
      property.city.toLowerCase().includes(searchLower)
    );
  });

  const filteredUserProperties = userProperties.filter(property => {
    const searchLower = searchTerm.toLowerCase();
    return (
      property.title.toLowerCase().includes(searchLower) ||
      property.location.toLowerCase().includes(searchLower) ||
      property.city.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const stats = {
    total: properties.length,
    active: properties.filter(p => p.listing_status === 'Active').length,
    inactive: properties.filter(p => p.listing_status === 'Inactive').length,
    sold: properties.filter(p => p.listing_status === 'Sold').length,
  };

  const userStats = {
    total: userProperties.length,
    pending: userProperties.filter(p => p.approval_status === 'pending').length,
    approved: userProperties.filter(p => p.approval_status === 'approved').length,
    rejected: userProperties.filter(p => p.approval_status === 'rejected').length,
  };

  // Chart data
  const statusData = [
    { name: 'Active', value: stats.active },
    { name: 'Inactive', value: stats.inactive },
    { name: 'Sold', value: stats.sold },
  ];

  const monthlyData = [
    { month: 'Jan', listings: 12, sales: 8, inquiries: 45 },
    { month: 'Feb', listings: 19, sales: 12, inquiries: 62 },
    { month: 'Mar', listings: 15, sales: 9, inquiries: 54 },
    { month: 'Apr', listings: 22, sales: 14, inquiries: 71 },
    { month: 'May', listings: 18, sales: 11, inquiries: 58 },
    { month: 'Jun', listings: 25, sales: 16, inquiries: 83 },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
<ConversationalAdminPropertyForm 
  isOpen={showForm && !editingProperty}
  onClose={() => setShowForm(false)}
  onSave={() => {
    setShowForm(false);
    fetchProperties();
    fetchUserProperties();
  }}
/>
<AdminPropertyFormDialog
  isOpen={showForm && !!editingProperty}
  onClose={() => {
    setShowForm(false);
    setEditingProperty(null);
  }}
  property={editingProperty}
  onSave={() => {
    setShowForm(false);
    setEditingProperty(null);
    fetchProperties();
    fetchUserProperties();
  }}
/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">PropertyShodh - Manage your listings and assigned leads</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              size="sm"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
              <span className="sm:hidden">Home</span>
            </Button>
            <Button 
              onClick={() => navigate('/admin/users')} 
              variant="outline"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              size="sm"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Manage Users</span>
              <span className="sm:hidden">Users</span>
            </Button>
<Button 
  onClick={() => { setEditingProperty(null); setShowForm(true); }} 
  className="flex items-center justify-center gap-2 w-full sm:w-auto"
  size="sm"
>
  <Plus className="h-4 w-4" />
  <span className="hidden sm:inline">Add Property</span>
  <span className="sm:hidden">Add</span>
</Button>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="hover-scale transition-all duration-200 border-0 shadow-md bg-gradient-to-br from-card to-card/80">
            <CardHeader className="pb-2 px-3 sm:px-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Admin Properties</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="hover-scale transition-all duration-200 border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardHeader className="pb-2 px-3 sm:px-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Active Listings</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="hover-scale transition-all duration-200 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardHeader className="pb-2 px-3 sm:px-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Sold Properties</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.sold}</div>
            </CardContent>
          </Card>
          <Card className="hover-scale transition-all duration-200 border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
            <CardHeader className="pb-2 px-3 sm:px-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">User Pending</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{userStats.pending}</div>
            </CardContent>
          </Card>
          <Card className="hover-scale transition-all duration-200 border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20">
            <CardHeader className="pb-2 px-3 sm:px-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">User Approved</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{userStats.approved}</div>
            </CardContent>
          </Card>
          {/* Removed Search Inquiries and Property Interest cards */}
        </div>

        {/* Tabs for Properties and Inquiries */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger 
              value="analytics" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="properties" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Admin Properties</span>
              <span className="sm:hidden">Admin</span>
              <span className="text-xs opacity-70">({properties.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="user-properties" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">By Users</span>
              <span className="sm:hidden">Users</span>
              <span className="text-xs opacity-70">({userProperties.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="crm" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Columns3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">CRM</span>
              <span className="sm:hidden">CRM</span>
            </TabsTrigger>
            <TabsTrigger 
              value="verification" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Verification</span>
              <span className="sm:hidden">Verify</span>
            </TabsTrigger>
            {/* Removed Inquiries, Search History, Property Interest, Saved, Featured, Market Intel tabs */}
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Monthly Performance Chart */}
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="month" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="listings" fill="#10B981" name="New Listings" />
                        <Bar dataKey="sales" fill="#3B82F6" name="Sales" />
                        <Bar dataKey="inquiries" fill="#8B5CF6" name="Inquiries" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Property Status Distribution */}
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Property Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inquiry Trend */}
            <Card className="border border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Inquiry Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="inquiries" stroke="#8B5CF6" strokeWidth={3} name="Total Inquiries" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crm" className="mt-4 sm:mt-6">
            <CRMKanban />
          </TabsContent>
          {/* Removed Saved Tab */}

          <TabsContent value="properties" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
              <Input
                placeholder="Search properties by title, location, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:max-w-md"
              />
            </div>

            {/* Properties List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <Card key={property.id} className="border border-border/80 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex gap-4">
                        {/* Property Image Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images[0]} 
                              alt={property.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">No Image</div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Property Details */}
                        <div className="flex-1 min-w-0 space-y-4">
                          {/* Header - Mobile Friendly */}
                          <div className="flex flex-col space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <h3 className="text-lg sm:text-xl font-semibold line-clamp-2 leading-tight">{property.title}</h3>
                                  <div className="flex gap-2 flex-wrap">
                                    <Badge variant={
                                      property.listing_status === 'Active' ? 'default' :
                                      property.listing_status === 'Sold' ? 'secondary' : 'outline'
                                    } className="text-xs whitespace-nowrap">
                                      {property.listing_status === 'Inactive' ? 'Hidden' : property.listing_status}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-medium">Price:</span> {formatINRShort(property.price, language)}
                                  </div>
                                  <div className="break-words">
                                    <span className="font-medium">Location:</span> {property.location}
                                  </div>
                                </div>

                                <div className="mt-2 text-sm text-muted-foreground">
                                  <span className="font-medium">Listed by:</span> Admin
                                </div>
                              </div>
                            </div>

                            {/* Actions - Mobile Optimized */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border/50">
                              <div className="flex flex-wrap gap-2">
                                <PropertyInterestDropdown 
                                  propertyId={property.id}
                                  propertyTitle={property.title}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openPropertyInNewTab(property.id)}
                                  title="Open in new tab"
                                  className="flex-shrink-0"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                   <span className="sr-only">Open</span>
                                 </Button>
                                 <AlertDialog>
                                   <AlertDialogTrigger asChild>
                                     <Button
                                       variant={property.is_featured ? "default" : "outline"}
                                       size="sm"
                                       title={property.is_featured ? "Remove from featured" : "Feature property"}
                                       className={property.is_featured ? "bg-yellow-600 hover:bg-yellow-700 text-white" : ""}
                                     >
                                       <Star className={`h-4 w-4 ${property.is_featured ? "fill-current" : ""}`} />
                                       <span className="sr-only">{property.is_featured ? "Unfeature" : "Feature"}</span>
                                     </Button>
                                   </AlertDialogTrigger>
                                   <AlertDialogContent className="bg-yellow-50/90 border-yellow-200">
                                     <AlertDialogHeader>
                                       <AlertDialogTitle className="text-yellow-800">
                                         {property.is_featured ? "Remove Featured Status" : "Feature Property"}
                                       </AlertDialogTitle>
                                       <AlertDialogDescription className="text-yellow-700">
                                         {property.is_featured 
                                           ? "This will remove the property from featured listings."
                                           : "This will feature the property for 1 week and automatically approve it. Featured properties appear at the top of search results."
                                         }
                                       </AlertDialogDescription>
                                     </AlertDialogHeader>
                                     <AlertDialogFooter>
                                       <AlertDialogCancel className="border-yellow-200 text-yellow-800 hover:bg-yellow-100">
                                         Cancel
                                       </AlertDialogCancel>
                                       <AlertDialogAction
                                         onClick={() => handleFeatureProperty(property.id, property.is_featured)}
                                         className="bg-yellow-600 hover:bg-yellow-700"
                                       >
                                         {property.is_featured ? "Remove Feature" : "Feature Property"}
                                       </AlertDialogAction>
                                     </AlertDialogFooter>
                                   </AlertDialogContent>
                                 </AlertDialog>
                               </div>
                              
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                <Button
                                  variant={property.listing_status === 'Active' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleStatusChange(property.id, 'Active')}
                                  className="text-xs flex-1 sm:flex-none min-w-[70px]"
                                >
                                  Active
                                </Button>
                                <Button
                                  variant={property.listing_status === 'Sold' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleStatusChange(property.id, 'Sold')}
                                  className="text-xs flex-1 sm:flex-none min-w-[70px]"
                                >
                                  Sold
                                </Button>
                                <Button
                                  variant={property.listing_status === 'Inactive' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleStatusChange(property.id, 'Inactive')}
                                  className="text-xs flex-1 sm:flex-none min-w-[70px]"
                                >
                                  Hidden
                                </Button>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDuplicate(property)}
                                  className="flex-1 sm:flex-none"
                                  title="Duplicate this property"
                                >
                                  <Copy className="h-4 w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Duplicate</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingProperty(property);
                                    setShowForm(true);
                                  }}
                                  className="flex-1 sm:flex-none"
                                >
                                  <Edit className="h-4 w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(property.id)}
                                  className="flex-1 sm:flex-none text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Delete</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No properties found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="user-properties" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
              <Input
                placeholder="Search user properties by title, location, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:max-w-md"
              />
            </div>

            {/* User Properties List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUserProperties.map((property) => (
                  <Card key={property.id} className="border border-border/80 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex gap-4">
                        {/* Property Image Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images[0]} 
                              alt={property.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">No Image</div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Property Details */}
                        <div className="flex-1 min-w-0 space-y-4">
                          {/* Header - Mobile Friendly */}
                          <div className="flex flex-col space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-2">
                                  <h3 className="text-lg sm:text-xl font-semibold line-clamp-2">{property.title}</h3>
                                  <div className="flex gap-2 flex-wrap">
                                    <Badge variant={
                                      property.approval_status === 'approved' ? 'default' :
                                      property.approval_status === 'pending' ? 'secondary' : 'destructive'
                                    } className="text-xs whitespace-nowrap">
                                      {property.approval_status === 'pending' ? 'Pending Review' : 
                                       property.approval_status === 'approved' ? 'Approved' : 'Rejected'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                                      User Submitted
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-medium">Price:</span> {formatINRShort(property.price, language)}
                                  </div>
                                  <div className="break-words">
                                    <span className="font-medium">Location:</span> {property.location}
                                  </div>
                                </div>

                                <div className="mt-2 text-sm text-muted-foreground">
                                  <span className="font-medium">Listed by:</span> {(property as any).profiles?.full_name || 'User'}
                                </div>

                                <div className="mt-2 text-sm text-muted-foreground">
                                  <span className="font-medium">Submitted:</span> {new Date(property.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            {/* Actions - Mobile Optimized */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border/50">
                              <div className="flex flex-wrap gap-2">
                                <PropertyInterestDropdown 
                                  propertyId={property.id}
                                  propertyTitle={property.title}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openPropertyInNewTab(property.id)}
                                  title="Open in new tab"
                                  className="flex-shrink-0"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                   <span className="sr-only">Open</span>
                                 </Button>
                                 <AlertDialog>
                                   <AlertDialogTrigger asChild>
                                     <Button
                                       variant={property.is_featured ? "default" : "outline"}
                                       size="sm"
                                       title={property.is_featured ? "Remove from featured" : "Feature property"}
                                       className={property.is_featured ? "bg-yellow-600 hover:bg-yellow-700 text-white" : ""}
                                     >
                                       <Star className={`h-4 w-4 ${property.is_featured ? "fill-current" : ""}`} />
                                       <span className="sr-only">{property.is_featured ? "Unfeature" : "Feature"}</span>
                                     </Button>
                                   </AlertDialogTrigger>
                                   <AlertDialogContent className="bg-yellow-50/90 border-yellow-200">
                                     <AlertDialogHeader>
                                       <AlertDialogTitle className="text-yellow-800">
                                         {property.is_featured ? "Remove Featured Status" : "Feature Property"}
                                       </AlertDialogTitle>
                                       <AlertDialogDescription className="text-yellow-700">
                                         {property.is_featured 
                                           ? "This will remove the property from featured listings."
                                           : "This will feature the property for 1 week and automatically approve it. Featured properties appear at the top of search results."
                                         }
                                       </AlertDialogDescription>
                                     </AlertDialogHeader>
                                     <AlertDialogFooter>
                                       <AlertDialogCancel className="border-yellow-200 text-yellow-800 hover:bg-yellow-100">
                                         Cancel
                                       </AlertDialogCancel>
                                       <AlertDialogAction
                                         onClick={() => handleFeatureProperty(property.id, property.is_featured)}
                                         className="bg-yellow-600 hover:bg-yellow-700"
                                       >
                                         {property.is_featured ? "Remove Feature" : "Feature Property"}
                                       </AlertDialogAction>
                                     </AlertDialogFooter>
                                   </AlertDialogContent>
                                 </AlertDialog>
                               </div>
                              
                              {property.approval_status === 'pending' && (
                                <div className="flex flex-wrap gap-2">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                                      >
                                        Approve
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-green-50/90 border-green-200">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-green-800">Approve Property</AlertDialogTitle>
                                        <AlertDialogDescription className="text-green-700">
                                          This will approve the property and make it active. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="border-green-200 text-green-800 hover:bg-green-100">
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleApproveProperty(property.id, true)}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          Approve Property
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1 sm:flex-none"
                                      >
                                        Reject
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-red-50/90 border-red-200">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-red-800">Reject Property</AlertDialogTitle>
                                        <AlertDialogDescription className="text-red-700">
                                          This will reject the property and hide it from listings. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="border-red-200 text-red-800 hover:bg-red-100">
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleApproveProperty(property.id, false)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Reject Property
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                              
                              {property.approval_status === 'approved' && (
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                  <Button
                                    variant={property.listing_status === 'Active' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusChange(property.id, 'Active')}
                                    className="text-xs flex-1 sm:flex-none min-w-[70px]"
                                  >
                                    Active
                                  </Button>
                                  <Button
                                    variant={property.listing_status === 'Sold' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusChange(property.id, 'Sold')}
                                    className="text-xs flex-1 sm:flex-none min-w-[70px]"
                                  >
                                    Sold
                                  </Button>
                                  <Button
                                    variant={property.listing_status === 'Inactive' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusChange(property.id, 'Inactive')}
                                    className="text-xs flex-1 sm:flex-none min-w-[70px]"
                                  >
                                    Hidden
                                  </Button>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDuplicate(property)}
                                  className="flex-1 sm:flex-none"
                                  title="Duplicate this property"
                                >
                                  <Copy className="h-4 w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Duplicate</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingProperty(property);
                                    setShowForm(true);
                                  }}
                                  className="flex-1 sm:flex-none"
                                >
                                  <Edit className="h-4 w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(property.id)}
                                  className="flex-1 sm:flex-none text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Delete</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No properties found</p>
              </div>
            )}
          </TabsContent>

          {/* Removed duplicate user-properties tab content */}

          {/* Removed Inquiries Tab */}
          {/* Removed Property Interest Tab */}
          {/* Removed Search History Tab */}

          <TabsContent value="verification" className="mt-4 sm:mt-6">
            <VerificationManagement />
          </TabsContent>

          {/* Removed Featured Tab */}
          {/* Removed Market Intelligence Tab */}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;