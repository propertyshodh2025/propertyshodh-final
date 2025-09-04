import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Activity } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminActivity {
  id: string;
  admin_id: string;
  admin_username: string;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  details: any | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const AdminActivities: React.FC = () => {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_admin_activities');

      if (error) {
        console.error('Error fetching admin activities:', error);
        toast({
          title: t('error'),
          description: error.message || t('failed_to_fetch_admin_activities'),
          variant: 'destructive',
        });
      } else {
        setActivities(data || []);
      }
      setLoading(false);
    };

    fetchActivities();
  }, []);

  return (
    <div className="space-y-8">
      <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity size={20} />
            <TranslatableText text="Admin Activities" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><TranslatableText text="Timestamp" /></TableHead>
                    <TableHead><TranslatableText text="Admin" /></TableHead>
                    <TableHead><TranslatableText text="Action Type" /></TableHead>
                    <TableHead><TranslatableText text="Target Type" /></TableHead>
                    <TableHead><TranslatableText text="Target ID" /></TableHead>
                    <TableHead><TranslatableText text="Details" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        <TranslatableText text="No activities found." />
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="text-sm">{new Date(activity.created_at).toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-sm">{activity.admin_username}</TableCell>
                        <TableCell className="text-sm">{activity.action_type}</TableCell>
                        <TableCell className="text-sm">{activity.target_type || t('N/A')}</TableCell>
                        <TableCell className="text-sm">{activity.target_id ? activity.target_id.slice(0, 8) + '...' : t('N/A')}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">
                          {activity.details ? JSON.stringify(activity.details) : t('N/A')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivities;