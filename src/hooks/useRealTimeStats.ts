import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseStats {
  total_properties: number;
  pending_properties: number;
  verified_properties: number;
  total_users: number;
  recent_inquiries: number;
  active_sessions: number;
}

interface LiveActivity {
  id: string;
  activity_type: string;
  created_at: string;
  user_id?: string;
  property_id?: string;
  metadata?: any;
}

interface SystemMetrics {
  db_connections: number;
  avg_response_time: number;
  queries_per_second: number;
  storage_used: number;
  bandwidth_usage: number;
}

export const useRealTimeStats = () => {
  const [dbStats, setDbStats] = useState<DatabaseStats>({
    total_properties: 0,
    pending_properties: 0,
    verified_properties: 0,
    total_users: 0,
    recent_inquiries: 0,
    active_sessions: 0
  });

  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    db_connections: 0,
    avg_response_time: 0,
    queries_per_second: 0,
    storage_used: 0,
    bandwidth_usage: 0
  });

  const [loading, setLoading] = useState(true);

  const fetchDatabaseStats = async () => {
    try {
      // Get property stats
      const { data: properties } = await supabase
        .from('properties')
        .select('approval_status, verification_status');

      // Get user stats  
      const { data: users } = await supabase
        .from('profiles')
        .select('id');

      // Get recent inquiries (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: inquiries } = await supabase
        .from('property_inquiries')
        .select('id')
        .gte('created_at', yesterday.toISOString());

      const totalProperties = properties?.length || 0;
      const pendingProperties = properties?.filter(p => p.approval_status === 'pending').length || 0;
      const verifiedProperties = properties?.filter(p => p.verification_status === 'verified').length || 0;

      setDbStats({
        total_properties: totalProperties,
        pending_properties: pendingProperties,
        verified_properties: verifiedProperties,
        total_users: users?.length || 0,
        recent_inquiries: inquiries?.length || 0,
        active_sessions: Math.floor(Math.random() * 50) + 10 // Simulated for now
      });

      // Simulate system metrics with realistic values
      setSystemMetrics({
        db_connections: Math.floor(Math.random() * 20) + 5,
        avg_response_time: Math.floor(Math.random() * 100) + 50,
        queries_per_second: Math.floor(Math.random() * 200) + 100,
        storage_used: Math.floor(Math.random() * 20) + 30,
        bandwidth_usage: Math.floor(Math.random() * 500) + 200
      });

    } catch (error) {
      console.error('Error fetching database stats:', error);
    }
  };

  const fetchLiveActivities = async () => {
    try {
      // Get recent user activities
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setLiveActivities(activities || []);
    } catch (error) {
      console.error('Error fetching live activities:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchDatabaseStats(), fetchLiveActivities()]);
      setLoading(false);
    };

    init();

    // Set up real-time subscriptions
    const activitiesChannel = supabase
      .channel('user_activities_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'user_activities' },
        (payload) => {
          setLiveActivities(prev => [payload.new as LiveActivity, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    const propertiesChannel = supabase
      .channel('properties_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        () => {
          fetchDatabaseStats(); // Refresh stats when properties change
        }
      )
      .subscribe();

    // Update metrics every 5 seconds
    const metricsInterval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        db_connections: Math.floor(Math.random() * 20) + 5,
        avg_response_time: Math.floor(Math.random() * 100) + 50,
        queries_per_second: Math.floor(Math.random() * 200) + 100,
        bandwidth_usage: Math.floor(Math.random() * 500) + 200
      }));
    }, 5000);

    // Refresh stats every 30 seconds
    const statsInterval = setInterval(fetchDatabaseStats, 30000);

    return () => {
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(propertiesChannel);
      clearInterval(metricsInterval);
      clearInterval(statsInterval);
    };
  }, []);

  return {
    dbStats,
    liveActivities,
    systemMetrics,
    loading,
    refresh: () => {
      fetchDatabaseStats();
      fetchLiveActivities();
    }
  };
};