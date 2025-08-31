import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminSupabase } from '@/lib/adminSupabase';
import { formatDateTime, formatRelativeTime } from '@/lib/dateUtils';
import { 
  Activity, 
  User, 
  Home, 
  Shield, 
  Search, 
  Filter, 
  Calendar,
  Eye,
  RefreshCw,
  Download
} from 'lucide-react';

interface AdminActivity {
  id: string;
  admin_id: string;
  admin_username: string;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface AdminActivityFeedProps {
  className?: string;
}

export function AdminActivityFeed({ className }: AdminActivityFeedProps) {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAdmin, setFilterAdmin] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchActivities();
    
    // Set up real-time subscription
    const channel = adminSupabase
      .channel('admin-activities-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_activities'
      }, () => {
        // Refresh activities when new activity is added
        fetchActivities();
      })
      .subscribe();

    return () => {
      adminSupabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async (loadMore = false) => {
    try {
      setLoading(!loadMore);
      
      const { data, error } = await adminSupabase.rpc('get_admin_activities', {
        _admin_id: filterAdmin !== 'all' ? filterAdmin : null,
        _action_type: filterType !== 'all' ? filterType : null,
        _limit: 50,
        _offset: loadMore ? page * 50 : 0
      });

      if (error) throw error;

      if (loadMore) {
        setActivities(prev => [...prev, ...(data || [])]);
      } else {
        setActivities(data || []);
        setPage(0);
      }

      setHasMore((data || []).length === 50);
    } catch (error) {
      console.error('Error fetching admin activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchActivities(true);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'login':
      case 'logout':
        return <Shield className="h-4 w-4" />;
      case 'create_property':
      case 'update_property':
      case 'delete_property':
      case 'approve_property':
        return <Home className="h-4 w-4" />;
      case 'create_admin':
      case 'update_admin':
      case 'deactivate_admin':
        return <User className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'create_property':
      case 'create_admin':
        return 'bg-blue-100 text-blue-800';
      case 'update_property':
      case 'update_admin':
      case 'approve_property':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete_property':
      case 'deactivate_admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (actionType: string) => {
    return actionType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getActivityDescription = (activity: AdminActivity) => {
    const details = activity.details || {};
    
    switch (activity.action_type) {
      case 'login':
        return `Logged in`;
      case 'logout':
        return `Logged out`;
      case 'create_property':
        return `Created property "${details.propertyTitle}"`;
      case 'update_property':
        return `Updated property "${details.propertyTitle}"`;
      case 'delete_property':
        return `Deleted property "${details.propertyTitle}"`;
      case 'approve_property':
        return `${details.approved ? 'Approved' : 'Rejected'} property "${details.propertyTitle}"`;
      case 'create_admin':
        return `Created admin "${details.username}" with role ${details.role}`;
      case 'update_admin':
        const action = details.changes?.action || 'updated';
        return `${action.charAt(0).toUpperCase() + action.slice(1)} admin "${details.username}"`;
      case 'deactivate_admin':
        return `Deactivated admin "${details.username}"`;
      default:
        return activity.action_type;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.admin_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getActivityDescription(activity).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const exportActivities = async () => {
    try {
      const { data, error } = await adminSupabase.rpc('get_admin_activities', {
        _limit: 1000,
        _offset: 0
      });

      if (error) throw error;

      const csvContent = [
        ['Timestamp', 'Admin', 'Action', 'Target Type', 'Description', 'IP Address'].join(','),
        ...data.map((activity: AdminActivity) => [
          formatDateTime(activity.created_at),
          activity.admin_username,
          getActionLabel(activity.action_type),
          activity.target_type || 'N/A',
          getActivityDescription(activity),
          activity.ip_address || 'N/A'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-activities-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting activities:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Admin Activities
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchActivities()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportActivities}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="create_property">Create Property</SelectItem>
              <SelectItem value="update_property">Update Property</SelectItem>
              <SelectItem value="delete_property">Delete Property</SelectItem>
              <SelectItem value="approve_property">Approve Property</SelectItem>
              <SelectItem value="create_admin">Create Admin</SelectItem>
              <SelectItem value="update_admin">Update Admin</SelectItem>
              <SelectItem value="deactivate_admin">Deactivate Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {loading && activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading activities...
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities found
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className={`p-2 rounded-full ${getActionColor(activity.action_type)}`}>
                  {getActionIcon(activity.action_type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {activity.admin_username}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getActionLabel(activity.action_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatRelativeTime(activity.created_at)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {getActivityDescription(activity)}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{formatDateTime(activity.created_at)}</span>
                    {activity.ip_address && (
                      <span>IP: {activity.ip_address}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {hasMore && !loading && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={loadMore}>
                Load More Activities
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}