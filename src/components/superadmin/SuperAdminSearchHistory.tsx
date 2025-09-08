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
  metadata: any | null;
}

interface ProfileMap {
  [user_id: string]: { full_name?: string | null; email?: string | null };
}

export default function SuperAdminSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchActivity[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('SuperAdminSearchHistory: useEffect triggered');
    const load = async () => {
      console.log('SuperAdminSearchHistory: load function started');
      try {
        const { data: activities, error: activitiesError } = await adminSupabase
          .from('user_activities')
          .select('id, created_at, user_id, search_query, metadata')
          .eq('activity_type', 'search')
          .not('search_query', 'is', null)
          .order('created_at', { ascending: false });
        
        console.log('SuperAdminSearchHistory: Fetched user_activities (search). Data:', activities, 'Error:', activitiesError);
        if (activitiesError) throw activitiesError;

        const uniqueUserIds = Array.from(new Set((activities || []).map(a => a.user_id)));
        console.log('SuperAdminSearchHistory: Unique User IDs:', uniqueUserIds);

        if (uniqueUserIds.length) {
          const { data: profs, error: profilesError } = await adminSupabase
            .from('profiles')
            .select('user_id, full_name, email')
            .in('user_id', uniqueUserIds as string[]);
          console.log('SuperAdminSearchHistory: Fetched profiles. Data:', profs, 'Error:', profilesError);
          if (profilesError) console.error('Error fetching profiles:', profilesError);
          const map: ProfileMap = {};
          (profs || []).forEach(p => { map[p.user_id] = { full_name: (p as any).full_name, email: (p as any).email }; });
          setProfiles(map);
        }

        setSearchHistory((activities as any) || []);
        console.log('SuperAdminSearchHistory: Search history set:', (activities || []).length);
      } catch (e) {
        console.error('SuperAdminSearchHistory: Error in load function:', e);
      } finally {
        setLoading(false);
        console.log('SuperAdminSearchHistory: Loading set to false');
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading search history…</div>;

  return (
    <div className="space-y-3">
      {searchHistory.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">No search history yet.</div>
      ) : (
        searchHistory.map((activity) => {
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
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{prof.full_name || 'User'}</span>
                        {prof.email && <span className="ml-1 text-xs">({prof.email})</span>}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
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