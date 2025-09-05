import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPropertyForm } from "@/components/UserPropertyForm";
import NotificationPanel from "@/components/NotificationPanel";
import PropertyVerificationForm from "@/components/PropertyVerificationForm";
import { UserActivityPanel } from "@/components/UserActivityPanel";
import { useSavedProperties } from "@/contexts/SavedPropertiesContext";
import { Plus, Phone, Edit2, Trash2, ArrowLeft, User, Home, ContactIcon, Calendar, MapPin, IndianRupee, Eye, Bell, Clock, X, Activity, DollarSign, Star, Heart, Settings, LogOut } from "lucide-react";
import TranslatableText from "@/components/TranslatableText";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatNumberWithLocale } from "@/lib/locale";
import { useNavigate, useSearchParams } from "react-router-dom";

interface UserProfile {
  full_name: string;
  email: string;
  phone_number: string;
  mobile_verified: boolean;
}

interface SecondaryContact {
  id: string;
  contact_number: string;
  contact_type: string;
}

interface UserProperty {
  id: string;
  title: string;
  property_type: string;
  price: number;
  location: string;
  approval_status: string;
  verification_status: string;
  listing_status?: string;
  created_at: string;
  interest_count?: number;
  is_featured?: boolean;
}

export default function UserDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [secondaryContacts, setSecondaryContacts] = useState<SecondaryContact[]>([]);
  const [userProperties, setUserProperties] = useState<UserProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [newContact, setNewContact] = useState({ number: "", type: "secondary" });
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [verificationProperty, setVerificationProperty] = useState<UserProperty | null>(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const { savedProperties } = useSavedProperties();
  const { language } = useLanguage();
  
  // Get the initial tab from URL params
  const initialTab = searchParams.get('tab') || 'properties';

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setProfile(profile);
      if (profile) {
        setNewName(profile.full_name || "");
      }

      // Fetch secondary contacts
      const { data: contacts } = await supabase
        .from('user_secondary_contacts')
        .select('*')
        .eq('user_id', user.id);
      
      setSecondaryContacts(contacts || []);

      // Fetch user properties with inquiry counts
      const { data: properties } = await supabase
        .from('properties')
        .select(`
          *,
          property_inquiries(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (properties) {
        const propertiesWithCounts = properties.map(property => ({
          ...property,
          interest_count: property.property_inquiries?.[0]?.count || 0
        }));
        setUserProperties(propertiesWithCounts);
      }

      // Fetch verification requests for user properties
      const { data: verifications } = await supabase
        .from('property_verification_details')
        .select('*')
        .eq('submitted_by_user_id', user.id);
      
      setVerificationRequests(verifications || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error loading data",
        description: "Please refresh the page to try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNameUpdate = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: newName })
        .eq("user_id", user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, full_name: newName } : null);
      setEditingName(false);
      toast({ title: "Name updated successfully" });
    } catch (error) {
      toast({ title: "Error updating name", variant: "destructive" });
    }
  };

  const handleAddSecondaryContact = async () => {
    try {
      const { error } = await supabase
        .from("user_secondary_contacts")
        .insert({
          user_id: user?.id,
          contact_number: newContact.number,
          contact_type: newContact.type
        });

      if (error) throw error;

      fetchUserData();
      setNewContact({ number: "", type: "secondary" });
      setShowContactDialog(false);
      toast({ title: "Contact added successfully" });
    } catch (error) {
      toast({ title: "Error adding contact", variant: "destructive" });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('user_secondary_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setSecondaryContacts(prev => prev.filter(contact => contact.id !== contactId));
      toast({
        title: "Contact deleted",
        description: "Secondary contact has been removed successfully"
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setUserProperties(prev => prev.filter(property => property.id !== propertyId));
      toast({
        title: "Property deleted",
        description: "Property has been removed successfully"
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsSold = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ listing_status: 'sold' })
        .eq('id', propertyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      fetchUserData(); // Refresh data
      toast({
        title: "Property marked as sold",
        description: "Property status has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: "Failed to update property status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsAvailable = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ listing_status: 'active' })
        .eq('id', propertyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      fetchUserData(); // Refresh data
      toast({
        title: "Property marked as available",
        description: "Your property is now available for sale/rent."
      });
    } catch (error) {
      console.error('Error marking property as available:', error);
      toast({
        title: "Error",
        description: "Failed to mark property as available. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRequestFeatured = async (propertyId: string) => {
    try {
      // Check if there's already a pending request
      const { data: existingRequest } = await supabase
        .from('property_feature_requests')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequest) {
        toast({
          title: "Request already exists",
          description: "You already have a pending feature request for this property.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('property_feature_requests')
        .insert({
          property_id: propertyId,
          user_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Feature request submitted",
        description: "Your request to feature this property has been submitted for admin review."
      });
    } catch (error) {
      console.error('Error requesting featured status:', error);
      toast({
        title: "Error",
        description: "Failed to submit feature request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelVerification = async (propertyId: string) => {
    try {
      // Delete the verification request
      const { error: deleteError } = await supabase
        .from('property_verification_details')
        .delete()
        .eq('property_id', propertyId)
        .eq('submitted_by_user_id', user?.id);

      if (deleteError) throw deleteError;

      // Update property verification status back to unverified
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          verification_status: 'unverified',
          verification_submitted_at: null,
          verification_score: 0
        })
        .eq('id', propertyId);

      if (updateError) throw updateError;

      // Refresh data
      fetchUserData();
      
      toast({
        title: "Verification cancelled",
        description: "Your verification request has been cancelled. You can now submit a new one."
      });
    } catch (error) {
      console.error('Error cancelling verification:', error);
      toast({
        title: "Error",
        description: "Failed to cancel verification. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getVerificationRequest = (propertyId: string) => {
    return verificationRequests.find(req => req.property_id === propertyId);
  };

  const renderVerificationButton = (property: any) => {
    const verificationRequest = getVerificationRequest(property.id);
    const hasActiveRequest = verificationRequest && property.verification_status === 'pending';
    
    if (property.verification_status === 'verified') {
      return (
        <div className="space-y-2">
          <Badge className="bg-green-100 text-green-800 border-green-200 w-full justify-center">
            ✓ <TranslatableText text="Verified Property" context="user:dashboard:verify" />
          </Badge>
          <p className="text-xs text-gray-500 text-center">
            <TranslatableText text="Call office for changes: +91-XXX-XXX-XXXX" context="user:dashboard:verify" />
          </p>
        </div>
      );
    }

    if (hasActiveRequest) {
      return (
        <div className="space-y-2">
          <Badge variant="secondary" className="w-full justify-center">
            <Clock className="w-3 h-3 mr-1" />
            <TranslatableText text="Under Review" context="user:dashboard:verify" />
          </Badge>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
              onClick={() => {
                setVerificationProperty(property);
                setShowVerificationForm(true);
              }}
            >
              <TranslatableText text="Edit Request" context="user:dashboard:verify" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleCancelVerification(property.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      );
    }

    if (property.verification_status === 'rejected') {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => {
            setVerificationProperty(property);
            setShowVerificationForm(true);
          }}
        >
          <TranslatableText text="Resubmit Verification" context="user:dashboard:verify" />
        </Button>
      );
    }

    // Default: unverified with no active request
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-green-600 border-green-200 hover:bg-green-50"
        onClick={() => {
          setVerificationProperty(property);
          setShowVerificationForm(true);
        }}
      >
        <TranslatableText text="Get Verified" context="user:dashboard:verify" />
      </Button>
    );
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account."
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600"><TranslatableText text="Loading your dashboard..." context="user:dashboard" /></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 px-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline"><TranslatableText text="Back to Home" context="user:dashboard" /></span>
                <span className="sm:hidden"><TranslatableText text="Back" context="user:dashboard" /></span>
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900"><TranslatableText text="Dashboard" context="user:dashboard" /></h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block"><TranslatableText text="Welcome back," context="user:dashboard" /> {profile?.full_name || user?.email?.split('@')[0]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatNumberWithLocale(userProperties.length, language)}</p>
                <p className="text-xs text-gray-600 hidden sm:block"><TranslatableText text="Properties" context="user:dashboard" /></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Overview Cards - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm"><TranslatableText text="Total Properties" context="user:dashboard:metrics" /></p>
                  <p className="text-3xl font-bold">{formatNumberWithLocale(userProperties.length, language)}</p>
                </div>
                <Home className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm"><TranslatableText text="Approved Properties" context="user:dashboard:metrics" /></p>
                  <p className="text-3xl font-bold">{formatNumberWithLocale(userProperties.filter(p => p.approval_status === 'approved').length, language)}</p>
                </div>
                <Eye className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm"><TranslatableText text="Total Inquiries" context="user:dashboard:metrics" /></p>
                  <p className="text-3xl font-bold">{formatNumberWithLocale(userProperties.reduce((sum, p) => sum + (p.interest_count || 0), 0), language)}</p>
                </div>
                <ContactIcon className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={initialTab} className="space-y-6">
          {/* Mobile: Horizontal Scrollable Tabs */}
          <div className="block sm:hidden overflow-x-auto">
            <TabsList className="inline-flex w-max bg-white shadow-sm rounded-lg p-1 min-w-full">
              <TabsTrigger value="properties" className="flex items-center gap-2 px-3 py-2 whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Home className="w-4 h-4" />
                <span><TranslatableText text="Properties" context="user:dashboard:tab" /> ({formatNumberWithLocale(userProperties.length, language)})</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2 px-3 py-2 whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Heart className="w-4 h-4" />
                <span><TranslatableText text="Saved" context="user:dashboard:tab" /> ({formatNumberWithLocale(savedProperties.length, language)})</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 px-3 py-2 whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Bell className="w-4 h-4" />
                <span><TranslatableText text="Notifications" context="user:dashboard:tab" /></span>
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2 px-3 py-2 whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Activity className="w-4 h-4" />
                <span><TranslatableText text="Activities" context="user:dashboard:tab" /></span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2 px-3 py-2 whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <User className="w-4 h-4" />
                <span><TranslatableText text="Profile" context="user:dashboard:tab" /></span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Desktop: Grid Tabs */}
          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm rounded-lg p-1">
              <TabsTrigger value="properties" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Home className="w-4 h-4" />
                <span className="hidden md:inline"><TranslatableText text="Properties" context="user:dashboard:tab" /> ({formatNumberWithLocale(userProperties.length, language)})</span>
                <span className="md:hidden"><TranslatableText text="Props" context="user:dashboard:tab" /></span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Heart className="w-4 h-4" />
                <span className="hidden md:inline"><TranslatableText text="Saved" context="user:dashboard:tab" /> ({formatNumberWithLocale(savedProperties.length, language)})</span>
                <span className="md:hidden"><TranslatableText text="Saved" context="user:dashboard:tab" /></span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Bell className="w-4 h-4" />
                <span className="hidden md:inline"><TranslatableText text="Notifications" context="user:dashboard:tab" /></span>
                <span className="md:hidden"><TranslatableText text="Notifs" context="user:dashboard:tab" /></span>
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Activity className="w-4 h-4" />
                <span className="hidden md:inline"><TranslatableText text="Activities" context="user:dashboard:tab" /></span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <User className="w-4 h-4" />
                <span className="hidden md:inline"><TranslatableText text="Profile & Contacts" context="user:dashboard:tab" /></span>
                <span className="md:hidden"><TranslatableText text="Profile" context="user:dashboard:tab" /></span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="space-y-6">

            {/* Profile Information */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="w-5 h-5" />
                  <TranslatableText text="Profile Information" context="user:dashboard:profile" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700"><TranslatableText text="Full Name" context="user:dashboard:profile" /></Label>
                    {editingName ? (
                      <div className="flex gap-2">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Enter your name"
                          className="flex-1"
                        />
                        <Button onClick={handleNameUpdate} size="sm" className="bg-green-600 hover:bg-green-700"><TranslatableText text="Save" context="user:dashboard:profile" /></Button>
                        <Button onClick={() => setEditingName(false)} variant="outline" size="sm"><TranslatableText text="Cancel" context="user:dashboard:profile" /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                        <span className="flex-1 text-gray-900">{profile?.full_name || <TranslatableText text="Not set" context="user:dashboard:profile" />}</span>
                        <Button onClick={() => setEditingName(true)} size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700"><TranslatableText text="Email Address" context="user:dashboard:profile" /></Label>
                    <div className="p-3 border rounded-lg bg-gray-50 text-gray-900">
                      {profile?.email || user?.email}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700"><TranslatableText text="Mobile Number" context="user:dashboard:profile" /></Label>
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="flex-1 text-gray-900">{profile?.phone_number ? formatNumberWithLocale(profile.phone_number, language) : <TranslatableText text="Not set" context="user:dashboard:profile" />}</span>
                        {profile?.mobile_verified ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200"><TranslatableText text="✓ Verified" context="user:dashboard:profile" /></Badge>
                        ) : (
                          <Badge variant="secondary"><TranslatableText text="Not Verified" context="user:dashboard:profile" /></Badge>
                        )}
                      </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700"><TranslatableText text="Account Status" context="user:dashboard:profile" /></Label>
                    <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-800 font-medium"><TranslatableText text="Active" context="user:dashboard:profile" /></span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ContactIcon className="w-5 h-5" />
                  <TranslatableText text="Contact Information" context="user:dashboard:contacts" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Primary Contact */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block"><TranslatableText text="Primary Contact" context="user:dashboard:contacts" /></Label>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{profile?.phone_number ? formatNumberWithLocale(profile.phone_number, language) : <TranslatableText text="Not set" context="user:dashboard:contacts" />}</p>
                        <p className="text-sm text-gray-600"><TranslatableText text="Primary mobile number" context="user:dashboard:contacts" /></p>
                      </div>
                    </div>
                      {profile?.mobile_verified ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <TranslatableText text="✓ Verified" context="user:dashboard:contacts" />
                        </Badge>
                      ) : (
                        <Badge variant="secondary"><TranslatableText text="Not Verified" context="user:dashboard:contacts" /></Badge>
                      )}
                  </div>
                </div>

                {/* Secondary Contacts */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-gray-700"><TranslatableText text="Secondary Contacts" context="user:dashboard:contacts" /></Label>
                    <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="h-4 w-4 mr-2" />
                          <TranslatableText text="Add Contact" context="user:dashboard:contacts" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle><TranslatableText text="Add Secondary Contact" context="user:dashboard:contacts" /></DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium"><TranslatableText text="Contact Number" context="user:dashboard:contacts" /></Label>
                            <Input
                              value={newContact.number}
                              onChange={(e) => setNewContact(prev => ({ ...prev, number: e.target.value }))}
                              placeholder="Enter contact number"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium"><TranslatableText text="Contact Type" context="user:dashboard:contacts" /></Label>
                            <Select value={newContact.type} onValueChange={(value) => setNewContact(prev => ({ ...prev, type: value }))}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="secondary"><TranslatableText text="Secondary" context="user:dashboard:contacts" /></SelectItem>
                                <SelectItem value="work"><TranslatableText text="Work" context="user:dashboard:contacts" /></SelectItem>
                                <SelectItem value="home"><TranslatableText text="Home" context="user:dashboard:contacts" /></SelectItem>
                                <SelectItem value="alternate"><TranslatableText text="Alternate" context="user:dashboard:contacts" /></SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                            <Button onClick={handleAddSecondaryContact} className="w-full bg-blue-600 hover:bg-blue-700">
                              <TranslatableText text="Add Contact" context="user:dashboard:contacts" />
                            </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {secondaryContacts.length === 0 ? (
                    <div className="text-center py-6 border rounded-lg bg-gray-50">
                      <ContactIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm"><TranslatableText text="No secondary contacts added yet" context="user:dashboard:contacts" /></p>
                      <p className="text-xs text-gray-500 mt-1"><TranslatableText text="Add additional contact numbers for better reach" context="user:dashboard:contacts" /></p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {secondaryContacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Phone className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                               <p className="font-medium text-gray-900">{formatNumberWithLocale(contact.contact_number, language)}</p>
                               <Badge variant="outline" className="text-xs">
                                 <TranslatableText text={contact.contact_type} context="user:dashboard:contacts:type" />
                               </Badge>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDeleteContact(contact.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900"><TranslatableText text="My Properties" context="user:dashboard:properties" /></h2>
                <p className="text-gray-600"><TranslatableText text="Manage your property listings and track inquiries" context="user:dashboard:properties" /></p>
              </div>
              <Button 
                onClick={() => setShowPropertyForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                <TranslatableText text="List New Property" context="user:dashboard:properties" />
              </Button>
            </div>

            {userProperties.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2"><TranslatableText text="No Properties Listed Yet" context="user:dashboard:properties" /></h3>
                    <p className="text-gray-600 mb-6"><TranslatableText text="Start listing your properties to reach thousands of potential buyers and renters." context="user:dashboard:properties" /></p>
                    <Button 
                      onClick={() => setShowPropertyForm(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <TranslatableText text="List Your First Property" context="user:dashboard:properties" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {userProperties.map((property) => (
                  <Card key={property.id} className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1"><TranslatableText text={property.title} context="user:dashboard:properties:title" /></h3>
                              <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm"><TranslatableText text={`${property.property_type} in ${property.location}`} context="user:dashboard:properties:meta" /></span>
                              </div>
                            </div>
                            <Badge 
                              variant={
                                property.approval_status === 'approved' ? 'default' :
                                property.approval_status === 'rejected' ? 'destructive' : 'secondary'
                              }
                              className="text-xs"
                            >
                              <TranslatableText text={property.approval_status.charAt(0).toUpperCase() + property.approval_status.slice(1)} context="user:dashboard:properties:status" />
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1 text-green-600 font-bold">
                              <IndianRupee className="w-4 h-4" />
                              <span className="text-lg">{formatNumberWithLocale(property.price.toLocaleString(), language)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span><TranslatableText text="Listed" context="user:dashboard:properties" /> {formatNumberWithLocale(new Date(property.created_at).toLocaleDateString(), language)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="lg:text-right space-y-3">
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="text-2xl font-bold text-orange-600">{formatNumberWithLocale(property.interest_count || 0, language)}</div>
                            <div className="text-xs text-orange-600"><TranslatableText text="Inquiries Received" context="user:dashboard:properties" /></div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full lg:w-auto"
                              onClick={() => navigate(`/property/${property.id}`)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              <TranslatableText text="View Details" context="user:dashboard:properties" />
                            </Button>
                            <div className="flex gap-2">
                              {(property.listing_status === 'sold' || property.listing_status === 'Sold') ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleMarkAsAvailable(property.id)}
                                >
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  <TranslatableText text="Mark as Available" context="user:dashboard:properties" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                                  onClick={() => handleMarkAsSold(property.id)}
                                >
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  <TranslatableText text="Mark as Sold" context="user:dashboard:properties" />
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            {/* Feature Request Button */}
                            {(property.listing_status === 'active' || property.listing_status === 'Active') && property.approval_status === 'approved' && !property.is_featured && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRequestFeatured(property.id)}
                                className="w-full text-purple-600 border-purple-200 hover:bg-purple-50 mt-2"
                              >
                                <Star className="w-3 h-3 mr-1" />
                                <TranslatableText text="Request to be Featured" context="user:dashboard:properties" />
                              </Button>
                            )}
                            
                            {property.is_featured && (
                              <Badge className="w-full mt-2 bg-purple-100 text-purple-800 border-purple-200 justify-center">
                                ⭐ <TranslatableText text="Featured Property" context="user:dashboard:properties" />
                              </Badge>
                            )}
                            {renderVerificationButton(property)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900"><TranslatableText text="Saved Properties" context="user:dashboard:saved" /></h2>
                <p className="text-gray-600"><TranslatableText text="Properties you've saved for later viewing" context="user:dashboard:saved" /></p>
              </div>
            </div>

            {savedProperties.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2"><TranslatableText text="No Saved Properties" context="user:dashboard:saved" /></h3>
                    <p className="text-gray-600 mb-6"><TranslatableText text="You haven't saved any properties yet. Start exploring properties and save the ones you like!" context="user:dashboard:saved" /></p>
                    <Button 
                      onClick={() => navigate('/properties')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      <TranslatableText text="Browse Properties" context="user:dashboard:saved" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {savedProperties.map((property) => (
                  <Card key={property.id} className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1"><TranslatableText text={property.title} context="user:dashboard:saved:title" /></h3>
                              <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm"><TranslatableText text={`${property.property_type} in ${property.location}`} context="user:dashboard:saved:meta" /></span>
                              </div>
                            </div>
                            <Badge 
                              variant={
                                property.verification_status === 'verified' ? 'default' :
                                property.verification_status === 'pending' ? 'secondary' : 'outline'
                              }
                              className="text-xs"
                            >
                              {property.verification_status === 'verified' ? <TranslatableText text="✓ Verified" context="user:dashboard:saved" /> : 
                               property.verification_status === 'pending' ? <TranslatableText text="Under Review" context="user:dashboard:saved" /> : <TranslatableText text="Unverified" context="user:dashboard:saved" />}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1 text-green-600 font-bold">
                              <IndianRupee className="w-4 h-4" />
                              <span className="text-lg">{formatNumberWithLocale(property.price.toLocaleString(), language)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span><TranslatableText text="Listed" context="user:dashboard" /> {formatNumberWithLocale(new Date(property.created_at).toLocaleDateString(), language)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="lg:text-right space-y-3">
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full lg:w-auto"
                              onClick={() => navigate(`/property/${property.id}`)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              <TranslatableText text="View Details" context="user:dashboard:saved" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <UserActivityPanel />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationPanel onNotificationClick={(propertyId) => {
              // Navigate to property details
              navigate(`/property/${propertyId}`);
            }} />
          </TabsContent>

        </Tabs>

        {showPropertyForm && (
          <UserPropertyForm
            isOpen={showPropertyForm}
            onClose={() => {
              setShowPropertyForm(false);
              fetchUserData(); // Refresh data after closing form
            }}
          />
        )}

        {showVerificationForm && verificationProperty && (
          <PropertyVerificationForm
            isOpen={showVerificationForm}
            onClose={() => {
              setShowVerificationForm(false);
              setVerificationProperty(null);
              fetchUserData(); // Refresh data after verification
            }}
            propertyId={verificationProperty.id}
            existingProperty={verificationProperty}
          />
        )}
      </div>
    </div>
  );
}