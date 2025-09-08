import { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '@/lib/dateUtils';

interface SavedItem {
  id: string;
  created_at: string;
  user_id: string;
  property_id: string;
}

interface ProfileMap {
  [user_id: string]: { full_name?: string | null; phone_number?: string | null };
}

interface PropertyMap {
  [property_id: string]: { id: string; title: string; location: string | null; city: string | null };
}

export default function SuperAdminSavedProperties() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [properties, setProperties] = useState<PropertyMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('SuperAdminSavedProperties: useEffect triggered');
    const load = async () => {
      console.log('SuperAdminSavedProperties: load function started');
      try {
        // Superadmin can view all user activities
        const { data: acts, error: actsError } = await adminSupabase
          .from('user_activities')
          .select('id, created_at, user_id, property_id')
          .eq('activity_type', 'property_saved')
          .not('property_id', 'is', null)
          .order('created_at', { ascending: false });
        
        console.log('SuperAdminSavedProperties: Fetched user_activities. Data:', acts, 'Error:', actsError);
        if (actsError) throw actsError;

        const uniqueUserIds = Array.from(new Set((acts || []).map(a => a.user_id)));
        const uniquePropIds = Array.from(new Set((acts || []).map(a => a.property_id).filter(Boolean)));
        console.log('SuperAdminSavedProperties: Unique User IDs:', uniqueUserIds);
        console.log('SuperAdminSavedProperties: Unique Property IDs:', uniquePropIds);

        if (uniqueUserIds.length) {
          const { data: profs, error: profsError } = await adminSupabase
            .from('profiles')
            .select('user_id, full_name, phone_number')
            .in('user_id', uniqueUserIds as string[]);
          console.log('SuperAdminSavedProperties: Fetched profiles. Data:', profs, 'Error:', profsError);
          if (profsError) console.error('Error fetching profiles:', profsError);

          const map: ProfileMap = {};
          (profs || []).forEach(p => { map[p.user_id] = { full_name: (p as any).full_name, phone_number: (p as any).phone_number }; });
          setProfiles(map);
        }

        if (uniquePropIds.length) {
          const { data: props, error: propsError } = await adminSupabase
            .from('properties')
            .select('id, title, location, city')
            .in('id', uniquePropIds as string[]);
          console.log('SuperAdminSavedProperties: Fetched properties. Data:', props, 'Error:', propsError);
          if (propsError) console.error('Error fetching properties:', propsError);

          const map: PropertyMap = {};
          (props || []).forEach(p => { map[p.id] = { id: p.id, title: (p as any).title, location: (p as any).location, city: (p as any).city }; });
          setProperties(map);
        }

        setItems((acts as any) || []);
        console.log('SuperAdminSavedProperties: Items set:', (acts || []).length);
      } catch (e) {
        console.error('SuperAdminSavedProperties: Error in load function:', e);
      } finally {
        setLoading(false);
        console.log('SuperAdminSavedProperties: Loading set to false');
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading saved properties…</div>;

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">No saved properties yet.</div>
      ) : (
        items.map((it) => {
          const prof = profiles[it.user_id] || {};
          const prop = properties[it.property_id] || { title: 'Property', location: null, city: null } as any;
          return (
            <Card key={it.id} className="border border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-medium">{prop?.title}</span>
                    <span className="text-muted-foreground"> {prop?.location ? `• ${prop.location}` : ''} {prop?.city ? `• ${prop.city}` : ''}</span>
                  </div>
                  <Badge variant="outline">Saved</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-muted-foreground">
                    By: <span className="text-foreground">{prof.full_name || 'User'}</span>
                    {prof.phone_number ? <span> • {prof.phone_number}</span> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(it.created_at)}</span>
                    <Button variant="outline" size="sm" onClick={() => window.open(`/property/${it.property_id}`, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}