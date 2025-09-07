import React, { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Phone, MessageSquare, User, Trash2 } from 'lucide-react';

interface UserActivityWithProfile {
  id: string;
  user_id: string;
  activity_type: string;
  property_id: string | null;
  search_query: string | null;
  metadata: any; // Assuming metadata can be any JSONB structure
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
  } | null;
}

const SuperAdminSearchHistory: React.FC = () => {
  const [searchHistory, setSearchHistory] = useState<UserActivityWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from('user_activities')
        .select(`
          *,
          profiles!fk_user_id_profiles (
            full_name,
            email,
            phone_number
          )
        `)
        .eq('activity_type', 'search')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSearchHistory(data as UserActivityWithProfile[] || []);
    } catch (error) {
      console.error('Error fetching search history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch search history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSearchEntry = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this search history entry?')) return;

    try {
      const { error } = await adminSupabase
        .from('user_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;
      
      fetchSearchHistory();
      toast({
        title: "Success",
        description: "Search history entry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting search history entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete search history entry",
        variant: "destructive",
      });
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, this is PropertyShodh. Following up on your search inquiry.`);
    const formatted = phone.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${formatted}?text=${message}`, '_blank');
  };

  const filteredSearchHistory = searchHistory.filter(search => {
    const searchLower = searchTerm.toLowerCase();
    return (
      search.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      search.profiles?.email?.toLowerCase().includes(searchLower) ||
      search.profiles?.phone_number?.toLowerCase().includes(searchLower) ||
      search.search_query?.toLowerCase().includes(searchLower) ||
      JSON.stringify(search.metadata?.filters || {}).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">User Search History</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by user name, email, phone, or search query..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading search history...</p>
            </div>
          ) : filteredSearchHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No search history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSearchHistory.map((search) => (
                <Card key={search.id} className="border border-border/80 shadow-sm">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {search.profiles?.full_name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Email: {search.profiles?.email || 'N/A'}
                        </p>
                        {search.profiles?.phone_number && (
                          <p className="text-sm text-muted-foreground">
                            Phone: {search.profiles.phone_number}
                          </p>
                        )}
                        {search.profiles?.phone_number && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCall(search.profiles!.phone_number!)}
                              className="flex items-center gap-1"
                            >
                              <Phone className="h-4 w-4" /> Call
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWhatsApp(search.profiles!.phone_number!, search.profiles?.full_name || 'User')}
                              className="flex items-center gap-1"
                            >
                              <MessageSquare className="h-4 w-4" /> WhatsApp
                            </Button>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          Search Details:
                        </h4>
                        {search.search_query && (
                          <p className="text-sm text-muted-foreground">
                            Query: <span className="font-medium">{search.search_query}</span>
                          </p>
                        )}
                        {search.metadata?.filters && (
                          <div className="text-xs text-muted-foreground space-y-1 mt-2">
                            {search.metadata.filters.transactionType && search.metadata.filters.transactionType !== 'all' && (
                              <p>Type: {search.metadata.filters.transactionType}</p>
                            )}
                            {search.metadata.filters.propertyCategory && search.metadata.filters.propertyCategory !== 'all' && (
                              <p>Category: {search.metadata.filters.propertyCategory}</p>
                            )}
                            {search.metadata.filters.city && search.metadata.filters.city !== 'all' && (
                              <p>City: {search.metadata.filters.city}</p>
                            )}
                            {search.metadata.filters.location && search.metadata.filters.location !== 'all' && (
                              <p>Location: {search.metadata.filters.location}</p>
                            )}
                            {search.metadata.filters.bhkType && search.metadata.filters.bhkType !== 'all' && (
                              <p>BHK: {search.metadata.filters.bhkType}</p>
                            )}
                            {search.metadata.filters.priceRange && (
                              <p>Price Range: {search.metadata.filters.priceRange}</p>
                            )}
                            {search.metadata.filters.selectedAreas && search.metadata.filters.selectedAreas.length > 0 && (
                              <p>Areas: {search.metadata.filters.selectedAreas.join(', ')}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between items-start md:items-end">
                        <div className="text-xs text-muted-foreground">
                          Searched: {new Date(search.created_at).toLocaleString()}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSearchEntry(search.id)}
                          className="mt-2 md:mt-0"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Entry
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminSearchHistory;