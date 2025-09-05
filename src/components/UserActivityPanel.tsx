import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Search, 
  Home, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  MessageCircle,
  MapPin,
  IndianRupee
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import TranslatableText from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatNumberWithLocale } from '@/lib/locale';

interface UserActivity {
  id: string;
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

export const UserActivityPanel = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    if (user) {
      fetchUserActivities();
    }
  }, [user]);

  const fetchUserActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch user activities
      const { data: activitiesData } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch property details for activities that have property_id
      const propertyIds = activitiesData?.filter(a => a.property_id).map(a => a.property_id) || [];
      let propertiesData: Property[] = [];
      
      if (propertyIds.length > 0) {
        const { data } = await supabase
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
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <TranslatableText text="Your Activity" context="user:dashboard:activities" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <TranslatableText text="Your Activity" context="user:dashboard:activities" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600"><TranslatableText text="No activities yet" context="user:dashboard:activities" /></p>
            <p className="text-sm text-gray-500 mt-1">
              <TranslatableText text="Your property listings, searches, and interactions will appear here" context="user:dashboard:activities" />
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        <TranslatableText text={getActivityTitle(activity)} context="user:dashboard:activities:title" />
                      </h4>
                      <Badge variant={getActivityBadgeVariant(activity.activity_type)} className="text-xs">
                        <TranslatableText text={activity.activity_type.replace(/_/g, ' ')} context="user:dashboard:activities:type" />
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      <TranslatableText text={getActivityDescription(activity)} context="user:dashboard:activities:desc" />
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
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
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};