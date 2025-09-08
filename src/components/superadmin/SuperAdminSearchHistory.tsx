import { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User } from 'lucide-react';
import { formatRelativeTime } from '@/lib/dateUtils';

interface SearchActivity {
  id: string;
  created_at: string;
  user_id: string;
  search_query: string | null;
  metadata: any;
}

interface ProfileMap {
  [user_id: string]: { full_name?: string | null; email?: string | null };
}

export default function SuperAdminSearchHistory() {
  const [searchActivities, setSearchActivities] = useState<SearchActivity[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Superadmin can view all user activities
        const { data: activities, error } = await adminSupabase
          .from('user_activities')
          .select('id, created_at, user_id, search_query, metadata')
          .eq('activity_type', 'search_query')
          .not('search_query', 'is', null)
          .order('created_at', { ascending: false });
        if (error) throw error;

        const uniqueUserIds = Array.from(new Set((activities || []).map(a => a.user_id)));

        if (uniqueUserIds.length) {
          const { data: profs } = await adminSupabase
            .from('profiles')
            .select('user_id, full_name, email')
            .in('user_id', uniqueUserIds as string[]);
          const map: ProfileMap = {};
          (profs || []).forEach(p => { map[p.user_id] = { full_name: (p as any).full_name, email: (p as any).email }; });
          setProfiles(map);
        }

        setSearchActivities((activities as any) || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading search history…</div>;

  return (
    <div className="space-y-3">
      {searchActivities.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">No search activities yet.</div>
      ) : (
        searchActivities.map((activity) => {
          const prof = profiles[activity.user_id] || {};
          return (
            <Card key={activity.id} className="border border-border/60 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{activity.search_query}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{prof.full_name || 'User'} {prof.email ? `(${prof.email})` : ''}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Searched {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline">Search</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}