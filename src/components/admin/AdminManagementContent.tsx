import React, { useState, useEffect } from "react";
import { adminSupabase } from "@/lib/adminSupabase";
import { formatDateTime } from "@/lib/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Users, Activity, Phone, Mail, User, MessageCircle, ExternalLink } from "lucide-react";

interface UserData {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  mobile_verified: boolean;
  created_at: string;
  activities: UserActivity[];
  secondary_contacts: SecondaryContact[];
}

interface UserActivity {
  id: string;
  inquiry_type?: string;
  activity_type?: string;
  property_id: string;
  user_name: string;
  user_phone: string;
  message: string | null;
  created_at: string;
  property_title?: string;
}

interface SecondaryContact {
  id: string;
  contact_number: string;
  contact_type: string;
}

export default function AdminUsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      // Fetch all user profiles
      const { data: profiles } = await adminSupabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!profiles) return;

      // Fetch activities (property inquiries) for all users
      const { data: inquiries } = await adminSupabase
        .from("property_inquiries")
        .select(`
          *,
          properties(title)
        `);

      // Fetch user listed properties
      const { data: listedProperties } = await adminSupabase
        .from("properties")
        .select("id, title, created_at, contact_number, user_id");

      // Fetch actual user activities from user_activities table
      const { data: userActivities } = await adminSupabase
        .from("user_activities")
        .select(`
          *,
          properties(title)
        `);

      // Fetch secondary contacts
      const { data: secondaryContacts } = await adminSupabase
        .from("user_secondary_contacts")
        .select("*");

      // Combine data - match activities by phone number and user_id
      const usersWithData = profiles.map(profile => {
        const userInquiries = inquiries?.filter(activity => 
          activity.user_phone === profile.phone_number
        ).map(activity => ({
          ...activity,
          property_title: activity.properties?.title,
          activity_type: 'inquiry'
        })) || [];

        const userListedProperties = listedProperties?.filter(property => 
          property.contact_number === profile.phone_number || property.user_id === profile.user_id
        ).map(property => ({
          id: property.id,
          property_id: property.id,
          user_name: profile.full_name || profile.email || 'Unknown',
          user_phone: profile.phone_number,
          message: null,
          created_at: property.created_at,
          property_title: property.title,
          activity_type: 'listed_property'
        })) || [];

        // Get actual user activities from user_activities table
        const actualUserActivities = userActivities?.filter(activity => 
          activity.user_id === profile.user_id
        ).map(activity => ({
          id: activity.id,
          property_id: activity.property_id,
          user_name: profile.full_name || profile.email || 'Unknown',
          user_phone: profile.phone_number,
          message: activity.search_query || JSON.stringify(activity.metadata) || null,
          created_at: activity.created_at,
          property_title: activity.properties?.title || activity.metadata?.property_title || 'N/A',
          activity_type: activity.activity_type,
          search_query: activity.search_query,
          metadata: activity.metadata
        })) || [];

        return {
          ...profile,
          activities: [...userInquiries, ...userListedProperties, ...actualUserActivities].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ),
          secondary_contacts: secondaryContacts?.filter(contact => contact.user_id === profile.user_id) || []
        };
      });

      setUsers(usersWithData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeLabel = (activity: UserActivity) => {
    if (activity.activity_type === 'listed_property') return 'Listed Property';
    if (activity.activity_type === 'property_listed') return 'Property Listed';
    if (activity.activity_type === 'property_inquiry') return 'Property Inquiry';
    if (activity.activity_type === 'verification_submitted') return 'Verification Submitted';
    if (activity.activity_type === 'search') return 'Property Search';
    
    switch (activity.inquiry_type) {
      case 'interest':
        return 'Showed Interest';
      case 'inquiry':
        return 'Made Inquiry';
      default:
        return activity.activity_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || activity.inquiry_type || 'Activity';
    }
  };

  const getActivityTypeBadge = (activity: UserActivity) => {
    if (activity.activity_type === 'listed_property' || activity.activity_type === 'property_listed') return 'outline';
    if (activity.activity_type === 'verification_submitted') return 'secondary';
    if (activity.activity_type === 'search') return 'outline';
    
    switch (activity.inquiry_type) {
      case 'interest':
        return 'default';
      case 'inquiry':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = (phoneNumber: string) => {
    window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}`, '_blank');
  };

  const handlePropertyRedirect = (propertyId: string) => {
    window.open(`/property/${propertyId}`, '_blank');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {users.length} Total Users
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">User Activities</TabsTrigger>
          <TabsTrigger value="contacts">Contact Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Mobile Status</TableHead>
                    <TableHead>Activities</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {user.full_name || "Not set"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {user.phone_number || "Not set"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.mobile_verified ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge variant="secondary">Not Verified</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.activities.length} activities
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(user.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              user.activities.length > 0 && (
                <Card key={user.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{user.full_name || user.email} - Activities</span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {user.phone_number && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCall(user.phone_number)}
                              className="flex items-center gap-1"
                            >
                              <Phone className="h-3 w-3" />
                              Call
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWhatsApp(user.phone_number)}
                              className="flex items-center gap-1"
                            >
                              <MessageCircle className="h-3 w-3" />
                              WhatsApp
                            </Button>
                          </>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {user.activities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <Activity className="h-4 w-4" />
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getActivityTypeBadge(activity) as any}>
                                  {getActivityTypeLabel(activity)}
                                </Badge>
                                {activity.property_title && (
                                  <span className="text-sm text-muted-foreground">
                                    on "{activity.property_title}"
                                  </span>
                                )}
                                {activity.message && (
                                  <span className="text-sm text-muted-foreground">
                                    - "{activity.message}"
                                  </span>
                                )}
                              </div>
                            </div>
                           </div>
                          <div className="flex items-center gap-2">
                            {activity.activity_type === 'listed_property' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePropertyRedirect(activity.property_id)}
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Property
                              </Button>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(activity.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {user.full_name || user.email} - Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Primary Contact</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{user.phone_number || "Not set"}</span>
                          {user.mobile_verified && (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {user.secondary_contacts.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Secondary Contacts</h4>
                        <div className="space-y-2">
                          {user.secondary_contacts.map((contact) => (
                            <div key={contact.id} className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{contact.contact_number}</span>
                              <Badge variant="outline">{contact.contact_type}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}