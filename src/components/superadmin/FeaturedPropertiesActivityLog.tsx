import React, { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Star, TrendingUp, Eye, Filter, Download } from 'lucide-react';
import { formatINRShort } from '@/lib/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface FeaturedPropertyActivity {
  id: string;
  property_id: string;
  admin_id?: string;
  action: 'featured' | 'unfeatured' | 'extended' | 'expired' | 'scheduled';
  package_type?: string;
  duration_days?: number;
  revenue: number;
  notes?: string;
  created_at: string;
  featured_from?: string;
  featured_until?: string;
  previous_package?: string;
  system_action: boolean;
  
  // Joined data
  property_title?: string;
  property_location?: string;
  property_city?: string;
  property_price?: number;
  admin_username?: string;
}

const ACTION_COLORS = {
  featured: 'bg-green-100 text-green-800',
  unfeatured: 'bg-red-100 text-red-800',
  extended: 'bg-blue-100 text-blue-800',
  expired: 'bg-orange-100 text-orange-800',
  scheduled: 'bg-purple-100 text-purple-800',
};

const ACTION_ICONS = {
  featured: Star,
  unfeatured: Star,
  extended: Clock,
  expired: Clock,
  scheduled: Calendar,
};

const FeaturedPropertiesActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<FeaturedPropertyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('7days');
  const [filterSystemActions, setFilterSystemActions] = useState<boolean>(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchActivities();
  }, [filterAction, filterDateRange, filterSystemActions]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let query = adminSupabase
        .from('featured_properties_log')
        .select(`
          *,
          properties!inner(title, location, city, price),
          admin_credentials(username)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filterAction !== 'all') {
        query = query.eq('action', filterAction);
      }

      if (filterSystemActions) {
        query = query.eq('system_action', false);
      }

      // Date range filter
      const now = new Date();
      let dateFilter: Date | null = null;
      switch (filterDateRange) {
        case '1day':
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7days':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      if (dateFilter) {
        query = query.gte('created_at', dateFilter.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data
      const transformedData = data?.map((activity: any) => ({
        ...activity,
        property_title: activity.properties?.title,
        property_location: activity.properties?.location,
        property_city: activity.properties?.city,
        property_price: activity.properties?.price,
        admin_username: activity.admin_credentials?.username,
      })) || [];

      setActivities(transformedData);
    } catch (error: any) {
      console.error('Error fetching activity log:', error);
      
      // Check if the table doesn't exist
      if (error?.code === '42P01') {
        toast({
          title: "Database Setup Required",
          description: "Featured properties log table needs to be created. Please run the database migration.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch activity log",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.property_title?.toLowerCase().includes(searchLower) ||
      activity.property_location?.toLowerCase().includes(searchLower) ||
      activity.property_city?.toLowerCase().includes(searchLower) ||
      activity.admin_username?.toLowerCase().includes(searchLower) ||
      activity.notes?.toLowerCase().includes(searchLower)
    );
  });

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Property',
      'Location', 
      'Action',
      'Package',
      'Duration (Days)',
      'Revenue',
      'Admin',
      'Notes'
    ];

    const csvData = filteredActivities.map(activity => [
      new Date(activity.created_at).toLocaleString(),
      activity.property_title || '',
      `${activity.property_location}, ${activity.property_city}`,
      activity.action,
      activity.package_type || 'Custom',
      activity.duration_days || '',
      activity.revenue,
      activity.system_action ? 'System' : (activity.admin_username || ''),
      activity.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `featured-properties-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionDescription = (activity: FeaturedPropertyActivity) => {
    switch (activity.action) {
      case 'featured':
        return `Property featured ${activity.package_type ? `with ${activity.package_type} package` : ''} for ${activity.duration_days || 'unlimited'} days`;
      case 'unfeatured':
        return 'Property removed from featured listings';
      case 'extended':
        return `Featured duration extended by ${activity.duration_days} days`;
      case 'expired':
        return 'Featured listing automatically expired';
      case 'scheduled':
        return `Property scheduled to be featured on ${activity.featured_from ? new Date(activity.featured_from).toLocaleDateString() : 'specified date'}`;
      default:
        return activity.action;
    }
  };

  const getTotalStats = () => {
    return {
      totalActivities: filteredActivities.length,
      totalRevenue: filteredActivities.reduce((sum, activity) => sum + (activity.revenue || 0), 0),
      featuredCount: filteredActivities.filter(a => a.action === 'featured').length,
      unfeaturedCount: filteredActivities.filter(a => a.action === 'unfeatured').length,
      systemActions: filteredActivities.filter(a => a.system_action).length,
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Activities</p>
                <p className="text-lg font-bold">{stats.totalActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Featured</p>
                <p className="text-lg font-bold">{stats.featuredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Star className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Unfeatured</p>
                <p className="text-lg font-bold">{stats.unfeaturedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Revenue</p>
                <p className="text-lg font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">System Actions</p>
                <p className="text-lg font-bold">{stats.systemActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Featured Properties Activity Log</CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="unfeatured">Unfeatured</SelectItem>
                <SelectItem value="extended">Extended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1day">Last 24 hours</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={filterSystemActions ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSystemActions(!filterSystemActions)}
            >
              {filterSystemActions ? "Show All" : "Hide System Actions"}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading activity log...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No activities found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => {
                const ActionIcon = ACTION_ICONS[activity.action];
                return (
                  <Card key={activity.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-lg ${ACTION_COLORS[activity.action]}`}>
                            <ActionIcon className="h-4 w-4" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm line-clamp-1">
                                {activity.property_title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {activity.property_location}, {activity.property_city}
                                {activity.property_price && (
                                  <span> • {formatINRShort(activity.property_price, language)}</span>
                                )}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <Badge variant={activity.action === 'featured' ? 'default' : 'secondary'}>
                                {activity.action}
                              </Badge>
                              {activity.revenue > 0 && (
                                <p className="text-xs font-medium text-green-600 mt-1">
                                  +₹{activity.revenue.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {getActionDescription(activity)}
                          </p>
                          
                          {activity.notes && (
                            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                              {activity.notes}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(activity.created_at).toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {activity.system_action 
                                  ? 'System' 
                                  : (activity.admin_username || 'Unknown Admin')
                                }
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {activity.package_type && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.package_type}
                                </Badge>
                              )}
                              {activity.duration_days && (
                                <span>{activity.duration_days} days</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturedPropertiesActivityLog;