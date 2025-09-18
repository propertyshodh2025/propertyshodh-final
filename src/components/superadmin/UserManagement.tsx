import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Home, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  MessageCircle,
  MapPin,
  IndianRupee,
  Activity,
  Calendar,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { adminSupabase } from '@/lib/adminSupabase';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatNumberWithLocale } from '@/lib/locale';

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  created_at: string;
  property_id?: string;
  search_query?: string;
  metadata?: any;
}

interface Property {
  id: string;
  title: string;
  property_type: string;
  location: string;
  price: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserActivities(selectedUser);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from('profiles')
        .select('user_id, full_name, email, phone_number, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async (userId: string) => {
    setActivitiesLoading(true);
    try {
      // Fetch user activities
      const { data: activitiesData } = await adminSupabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch property details for activities that have property_id
      const propertyIds = activitiesData?.filter(a => a.property_id).map(a => a.property_id) || [];
      let propertiesData: Property[] = [];
      
      if (propertyIds.length > 0) {
        const { data } = await adminSupabase
          .from('properties')
          .select('id, title, property_type, location, price')
          .in('id', propertyIds);
        propertiesData = data || [];
      }

      // Create properties lookup
      const propertiesMap = propertiesData.reduce((acc, prop) => {
        acc[prop.id] = prop;
        return acc;
      }, {} as Record<string, Property>);

      setActivities(activitiesData || []);
      setProperties(propertiesMap);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user activities",
        variant: "destructive",
      });
    } finally {
      setActivitiesLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'property_listed':
        return <Home className="w-4 h-4 text-blue-600" />;
      case 'property_inquiry':
        return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'search':
        return <Search className="w-4 h-4 text-purple-600" />;
      case 'property_approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'property_rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'verification_submitted':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'verification_approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'verification_rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'property_viewed':
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityBadgeVariant = (activityType: string) => {
    switch (activityType) {
      case 'property_approved':
      case 'verification_approved':
        return 'default';
      case 'property_rejected':
      case 'verification_rejected':
        return 'destructive';
      case 'verification_submitted':
        return 'secondary';
      case 'property_listed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getActivityTitle = (activity: UserActivity) => {
    const property = activity.property_id ? properties[activity.property_id] : null;
    const propertyTitle = activity.metadata?.property_title || property?.title || 'Property';

    switch (activity.activity_type) {
      case 'property_listed':
        return `Listed "${propertyTitle}"`;
      case 'property_inquiry':
        return `Inquiry on "${propertyTitle}"`;
      case 'search':
        return `Searched for "${activity.search_query}"`;
      case 'property_approved':
        return `"${propertyTitle}" approved`;
      case 'property_rejected':
        return `"${propertyTitle}" rejected`;
      case 'verification_submitted':
        return `Verification submitted for "${propertyTitle}"`;
      case 'verification_approved':
        return `"${propertyTitle}" verification approved`;
      case 'verification_rejected':
        return `"${propertyTitle}" verification rejected`;
      case 'property_viewed':
        return `Viewed "${propertyTitle}"`;
      default:
        return activity.activity_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getActivityDescription = (activity: UserActivity) => {
    const property = activity.property_id ? properties[activity.property_id] : null;
    
    switch (activity.activity_type) {
      case 'property_listed':
        return `${activity.metadata?.property_type} in ${activity.metadata?.location} for ₹${activity.metadata?.price?.toLocaleString()}`;
      case 'search':
        return 'Property search performed';
      case 'property_inquiry':
        return `${activity.metadata?.inquiry_type || 'General'} inquiry submitted`;
      case 'verification_submitted':
        return 'Property verification documents submitted for review';
      default:
        return property ? `${property.property_type} in ${property.location}` : 'Activity performed';
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number?.includes(searchTerm)
  );

  const selectedUserData = selectedUser ? users.find(u => u.user_id === selectedUser) : null;

  return (
    <div className="space-y-6">
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold">User Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Users ({filteredUsers.length})
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                User Activities
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Users List */}
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                      <Card 
                        key={user.user_id} 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedUser === user.user_id 
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                        }`}
                        onClick={() => setSelectedUser(user.user_id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                  {user.full_name || 'No Name'}
                                </h3>
                                {selectedUser === user.user_id && (
                                  <Badge variant="default" className="text-xs">
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {user.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">{user.email}</span>
                                  </div>
                                )}
                                {user.phone_number && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{user.phone_number}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              {!selectedUser ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Select a User</h3>
                  <p className="text-gray-500">Choose a user from the Users tab to view their activities</p>
                </div>
              ) : (
                <>
              {selectedUserData && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900 dark:text-blue-300">
                          {selectedUserData.full_name || 'No Name'}
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          {selectedUserData.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activitiesLoading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No activities found for this user</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {getActivityTitle(activity)}
                            </h4>
                            <Badge variant={getActivityBadgeVariant(activity.activity_type)} className="text-xs">
                              {activity.activity_type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {getActivityDescription(activity)}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </span>
                            
                            {activity.metadata?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.metadata.location}
                              </span>
                            )}
                            
                            {activity.metadata?.price && (
                              <span className="flex items-center gap-1">
                                <IndianRupee className="w-3 h-3" />
                                {formatNumberWithLocale(activity.metadata.price, language)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;