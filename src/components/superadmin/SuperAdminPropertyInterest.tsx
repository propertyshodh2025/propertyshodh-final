import { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, MessageSquare, Phone, User } from 'lucide-react';
import { formatRelativeTime } from '@/lib/dateUtils';

interface PropertyInquiry {
  id: string;
  created_at: string;
  property_id: string;
  user_name: string;
  user_phone: string;
  inquiry_type: string;
  message: string | null;
  is_verified: boolean;
}

interface PropertyMap {
  [property_id: string]: { title: string; location: string | null; city: string | null };
}

export default function SuperAdminPropertyInterest() {
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [properties, setProperties] = useState<PropertyMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('SuperAdminPropertyInterest: useEffect triggered');
    const load = async () => {
      console.log('SuperAdminPropertyInterest: load function started');
      try {
        // --- DIAGNOSTIC STEP: Check is_admin_request() directly ---
        const { data: isAdminReq, error: isAdminReqError } = await adminSupabase.rpc('is_admin_request');
        console.log('SuperAdminPropertyInterest: is_admin_request() result:', isAdminReq, 'Error:', isAdminReqError);
        // --- END DIAGNOSTIC STEP ---

        // Superadmin can view all property inquiries
        const { data: inquiriesData, error: inquiriesError } = await adminSupabase
          .from('property_inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log('SuperAdminPropertyInterest: Fetched property_inquiries. Data:', inquiriesData, 'Error:', inquiriesError);
        if (inquiriesError) throw inquiriesError;

        const uniquePropertyIds = Array.from(new Set((inquiriesData || []).map(i => i.property_id)));
        console.log('SuperAdminPropertyInterest: Unique Property IDs:', uniquePropertyIds);

        if (uniquePropertyIds.length) {
          const { data: props, error: propsError } = await adminSupabase
            .from('properties')
            .select('id, title, location, city')
            .in('id', uniquePropertyIds as string[]);
          console.log('SuperAdminPropertyInterest: Fetched properties. Data:', props, 'Error:', propsError);
          if (propsError) console.error('Error fetching properties:', propsError);

          const map: PropertyMap = {};
          (props || []).forEach(p => { map[p.id] = { title: (p as any).title, location: (p as any).location, city: (p as any).city }; });
          setProperties(map);
        }

        setInquiries((inquiriesData as any) || []);
        console.log('SuperAdminPropertyInterest: Inquiries set:', (inquiriesData || []).length);
      } catch (e) {
        console.error('SuperAdminPropertyInterest: Error in load function:', e);
      } finally {
        setLoading(false);
        console.log('SuperAdminPropertyInterest: Loading set to false');
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading property inquiries…</div>;

  return (
    <div className="space-y-3">
      {inquiries.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">No property inquiries yet.</div>
      ) : (
        inquiries.map((inquiry) => {
          const prop = properties[inquiry.property_id] || { title: 'Unknown Property', location: null, city: null };
          return (
            <Card key={inquiry.id} className="border border-border/60 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{prop.title}</span>
                      {prop.location && <span className="text-xs text-muted-foreground">({prop.location})</span>}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{inquiry.user_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{inquiry.user_phone}</span>
                      </div>
                      {inquiry.message && (
                        <div className="flex items-start gap-1">
                          <MessageSquare className="h-3 w-3 mt-1" />
                          <p className="text-xs italic">{inquiry.message}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Inquired {formatRelativeTime(inquiry.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline">{inquiry.inquiry_type}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}