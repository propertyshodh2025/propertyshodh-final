import React, { useEffect, useMemo, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatINRShort } from '@/lib/locale';

interface AdminPropertyLite {
  id: string;
  title: string;
  location: string;
  price: number;
  is_featured: boolean;
  featured_at: string | null;
  featured_until: string | null;
  images?: string[] | null;
  approval_status?: string | null;
  listing_status?: string | null;
}

const presets = [
  { key: '2d', label: '2 days', ms: 2 * 24 * 60 * 60 * 1000 },
  { key: '1w', label: '1 week', ms: 7 * 24 * 60 * 60 * 1000 },
  { key: '1m', label: '1 month', ms: 30 * 24 * 60 * 60 * 1000 },
];

const FeaturePropertiesManager: React.FC = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [properties, setProperties] = useState<AdminPropertyLite[]>([]);
  const [search, setSearch] = useState('');
  const [customUntil, setCustomUntil] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  const load = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('properties')
        .select('id,title,location,price,is_featured,featured_at,featured_until,images,approval_status,listing_status')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setProperties((data as any) || []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load properties', variant: 'destructive' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return properties.filter(p =>
      p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    );
  }, [properties, search]);

  const featureFor = async (id: string, durationMs: number) => {
    setLoadingIds(prev => ({ ...prev, [id]: true }));
    try {
      const now = new Date();
      const until = new Date(now.getTime() + durationMs).toISOString();
      const { error } = await adminSupabase
        .from('properties')
        .update({ 
          is_featured: true, 
          featured_at: now.toISOString(), 
          featured_until: until,
          approval_status: 'approved',
          listing_status: 'Active'
        })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Featured', description: 'Property featured and approved successfully' });
      await load();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to feature property', variant: 'destructive' });
    } finally {
      setLoadingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const featureUntil = async (id: string, untilIso: string) => {
    if (!untilIso) return;
    setLoadingIds(prev => ({ ...prev, [id]: true }));
    try {
      const now = new Date().toISOString();
      const { error } = await adminSupabase
        .from('properties')
        .update({ 
          is_featured: true, 
          featured_at: now, 
          featured_until: new Date(untilIso).toISOString(),
          approval_status: 'approved',
          listing_status: 'Active'
        })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Featured', description: 'Property featured and approved with custom duration' });
      await load();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to set custom duration', variant: 'destructive' });
    } finally {
      setLoadingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const unfeature = async (id: string) => {
    setLoadingIds(prev => ({ ...prev, [id]: true }));
    try {
      const { error } = await adminSupabase
        .from('properties')
        .update({ is_featured: false, featured_until: null })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Updated', description: 'Property unfeatured' });
      await load();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to unfeature property', variant: 'destructive' });
    } finally {
      setLoadingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const isExpired = (p: AdminPropertyLite) => {
    return p.is_featured && p.featured_until ? new Date(p.featured_until) < new Date() : false;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Feature Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search by title or location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <Card key={p.id} className="border-border/70">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{p.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{p.location}</p>
                      <p className="text-sm font-medium">{formatINRShort(p.price, language)}</p>
                    </div>
                    <div className="text-right">
                      {p.is_featured ? (
                        <Badge variant={isExpired(p) ? 'destructive' : 'default'}>
                          {isExpired(p) ? 'Expired' : 'Featured'}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not featured</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {presets.map((pr) => (
                      <Button
                        key={pr.key}
                        variant="outline"
                        size="sm"
                        disabled={loadingIds[p.id]}
                        onClick={() => featureFor(p.id, pr.ms)}
                      >
                        {pr.label}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="datetime-local"
                      value={customUntil[p.id] || ''}
                      onChange={(e) => setCustomUntil(prev => ({ ...prev, [p.id]: e.target.value }))}
                      className="max-w-[220px]"
                    />
                    <Button
                      size="sm"
                      disabled={loadingIds[p.id] || !customUntil[p.id]}
                      onClick={() => featureUntil(p.id, customUntil[p.id])}
                    >
                      Set Until
                    </Button>
                    {p.is_featured && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loadingIds[p.id]}
                        onClick={() => unfeature(p.id)}
                      >
                        Unfeature
                      </Button>
                    )}
                  </div>

                  {p.is_featured && (
                    <p className="text-xs text-muted-foreground">
                      Until: {p.featured_until ? new Date(p.featured_until).toLocaleString() : 'No expiry'}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturePropertiesManager;
