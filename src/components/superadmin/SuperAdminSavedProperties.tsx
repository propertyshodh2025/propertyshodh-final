import React, { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bookmark, ExternalLink, Trash2, User } from 'lucide-react';
import { Property } from '@/types/database';
import { formatINRShort } from '@/lib/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserActivityWithProfileAndProperty {
  id: string;
  user_id: string;
  activity_type: string;
  property_id: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
  } | null;
  properties: Property | null;
}

const SuperAdminSavedProperties: React.FC = () => {
  const [savedProperties, setSavedProperties] = useState<UserActivityWithProfileAndProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchSavedProperties();
  }, []);

  const fetchSavedProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from('user_activities')
        .select(`
          *,
          profiles!fk_user_id_profiles (
            full_name,
            email,
            phone_number
          ),
          properties!fk_property_id_properties (
            id, title, location, price, images
          )
        `)
        .eq('activity_type', 'property_saved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedProperties(data as UserActivityWithProfileAndProperty[] || []);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch saved properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSavedProperty = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this saved property entry?')) return;

    try {
      const { error } = await adminSupabase
        .from('user_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;
      
      fetchSavedProperties();
      toast({
        title: "Success",
        description: "Saved property entry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting saved property:', error);
      toast({
        title: "Error",
        description: "Failed to delete saved property entry",
        variant: "destructive",
      });
    }
  };

  const openPropertyInNewTab = (propertyId: string) => {
    window.open(`/property/${propertyId}`, '_blank');
  };

  const filteredSavedProperties = savedProperties.filter(activity => {
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      activity.profiles?.email?.toLowerCase().includes(searchLower) ||
      activity.profiles?.phone_number?.toLowerCase().includes(searchLower) ||
      activity.properties?.title?.toLowerCase().includes(searchLower) ||
      activity.properties?.location?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Saved Properties by Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by user name, email, phone, or property title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading saved properties...</p>
            </div>
          ) : filteredSavedProperties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No saved properties found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSavedProperties.map((activity) => (
                <Card key={activity.id} className="border border-border/80 shadow-sm">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {activity.profiles?.full_name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Email: {activity.profiles?.email || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Phone: {activity.profiles?.phone_number || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Bookmark className="h-4 w-4 text-muted-foreground" />
                          Property Saved:
                        </h4>
                        {activity.properties ? (
                          <>
                            <p className="text-sm font-semibold">{activity.properties.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.properties.location}</p>
                            <p className="text-xs text-muted-foreground">
                              Price: {formatINRShort(activity.properties.price, language)}
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => openPropertyInNewTab(activity.properties!.id)}
                              className="p-0 h-auto text-xs flex items-center gap-1"
                            >
                              View Property <ExternalLink className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Property not found or deleted.</p>
                        )}
                      </div>
                      <div className="flex flex-col justify-between items-start md:items-end">
                        <div className="text-xs text-muted-foreground">
                          Saved: {new Date(activity.created_at).toLocaleString()}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSavedProperty(activity.id)}
                          className="mt-2 md:mt-0"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Entry
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminSavedProperties;