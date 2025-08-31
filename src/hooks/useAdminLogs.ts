import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_type?: string;
  target_id?: string;
  details?: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface PropertyActivity {
  id: string;
  title: string;
  approval_status: string;
  verification_status: string;
  created_at: string;
  user_id: string;
}

interface UserActivity {
  id: string;
  activity_type: string;
  property_id?: string;
  search_query?: string;
  created_at: string;
  user_id: string;
}

export const useAdminLogs = () => {
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [propertyActivities, setPropertyActivities] = useState<PropertyActivity[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminLogs = async () => {
    try {
      const { data: logs } = await supabase
        .from('admin_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      setAdminLogs(logs || []);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
    }
  };

  const fetchPropertyActivities = async () => {
    try {
      const { data: properties } = await supabase
        .from('properties')
        .select('id, title, approval_status, verification_status, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

      setPropertyActivities(properties || []);
    } catch (error) {
      console.error('Error fetching property activities:', error);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      setUserActivities(activities || []);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchAdminLogs(),
        fetchPropertyActivities(),
        fetchUserActivities()
      ]);
      setLoading(false);
    };

    init();

    // Set up real-time subscriptions for live updates
    const adminLogsChannel = supabase
      .channel('admin_activities_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_activities' },
        (payload) => {
          setAdminLogs(prev => [payload.new as AdminLog, ...prev.slice(0, 14)]);
        }
      )
      .subscribe();

    const propertiesChannel = supabase
      .channel('properties_logs_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        () => {
          fetchPropertyActivities();
        }
      )
      .subscribe();

    const userActivitiesChannel = supabase
      .channel('user_activities_logs_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_activities' },
        (payload) => {
          setUserActivities(prev => [payload.new as UserActivity, ...prev.slice(0, 14)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(adminLogsChannel);
      supabase.removeChannel(propertiesChannel);
      supabase.removeChannel(userActivitiesChannel);
    };
  }, []);

  const formatLogEntry = (log: AdminLog | PropertyActivity | UserActivity): string => {
    const timestamp = new Date(log.created_at).toLocaleTimeString();
    
    if ('action_type' in log) {
      // Admin log - provide detailed description
      const details = log.details || {};
      
      switch (log.action_type) {
        case 'login':
          return `${timestamp} admin login: ${details.username || 'unknown'}`;
        case 'logout':
          return `${timestamp} admin logout: ${details.username || 'unknown'}`;
        case 'create_admin':
          return `${timestamp} admin created: "${details.username}" role=${details.role}`;
        case 'update_admin':
          const action = details.changes?.action || 'updated';
          return `${timestamp} admin ${action}: "${details.username}"`;
        case 'deactivate_admin':
          return `${timestamp} admin deactivated: "${details.username}"`;
        case 'create_property':
          return `${timestamp} property created: "${details.propertyTitle}"`;
        case 'update_property':
          return `${timestamp} property updated: "${details.propertyTitle}"`;
        case 'delete_property':
          return `${timestamp} property deleted: "${details.propertyTitle}"`;
        case 'approve_property':
          const status = details.approved ? 'approved' : 'rejected';
          return `${timestamp} property ${status}: "${details.propertyTitle}"`;
        default:
          return `${timestamp} admin action: ${log.action_type} ${details.username || log.target_type || ''}`;
      }
    } else if ('approval_status' in log) {
      // Property activity
      return `${timestamp} property[${log.id.slice(0, 8)}]: "${log.title}" status=${log.approval_status} verification=${log.verification_status}`;
    } else {
      // User activity
      return `${timestamp} user[${log.user_id.slice(0, 8)}]: ${log.activity_type} ${log.property_id ? `property=${log.property_id.slice(0, 8)}` : ''} ${log.search_query ? `query="${log.search_query}"` : ''}`;
    }
  };

  const getAllLogs = () => {
    const allLogs = [
      ...adminLogs.map(log => ({ ...log, type: 'admin' as const })),
      ...propertyActivities.map(log => ({ ...log, type: 'property' as const })),
      ...userActivities.map(log => ({ ...log, type: 'user' as const }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return allLogs.slice(0, 20);
  };

  return {
    adminLogs,
    propertyActivities,
    userActivities,
    loading,
    formatLogEntry,
    getAllLogs,
    refresh: () => {
      fetchAdminLogs();
      fetchPropertyActivities();
      fetchUserActivities();
    }
  };
};