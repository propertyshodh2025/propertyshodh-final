import { useState, useEffect } from 'react';
import { Phone, MessageCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { adminSupabase, isAdminAuthenticated } from '@/lib/adminSupabase';
import { Badge } from '@/components/ui/badge';

interface PropertyInterest {
  id: string;
  user_name: string;
  user_phone: string;
  created_at: string;
  inquiry_type: string;
  message?: string;
  is_verified: boolean;
}

interface PropertyInterestDropdownProps {
  propertyId: string;
  propertyTitle: string;
}

export function PropertyInterestDropdown({ propertyId, propertyTitle }: PropertyInterestDropdownProps) {
  const [interests, setInterests] = useState<PropertyInterest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInterests();
    
    // Set up real-time subscription for property inquiries
    const channel = supabase
      .channel('property-inquiries-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'property_inquiries',
          filter: `property_id=eq.${propertyId}`
        },
        () => {
          // Refetch interests when there's any change
          fetchInterests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId]);

  const fetchInterests = async () => {
    setLoading(true);
    try {
      // Use admin client if admin is authenticated, otherwise regular client
      const client = isAdminAuthenticated() ? adminSupabase : supabase;
      
      const { data, error } = await client
        .from('property_inquiries')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInterests(data || []);
    } catch (error) {
      console.error('Error fetching property interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = (phoneNumber: string, userName: string) => {
    const message = `Hi ${userName}, I saw your interest in our property "${propertyTitle}". Let me know if you have any questions!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/91${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  if (interests.length === 0) {
    return (
      <Badge variant="outline" className="text-xs">
        0 interests
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs flex items-center gap-1"
          disabled={loading}
        >
          {loading ? 'Loading...' : `${interests.length} ${interests.length === 1 ? 'person' : 'people'} interested`}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="p-2">
          <h4 className="font-medium text-sm mb-2">Interested People</h4>
          {interests.map((interest) => (
            <div key={interest.id} className="border rounded-lg p-3 mb-2 last:mb-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{interest.user_name}</p>
                    <Badge variant={interest.is_verified ? "default" : "secondary"} className="text-xs">
                      {interest.is_verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{interest.user_phone}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(interest.created_at)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCall(interest.user_phone)}
                    className="h-8 w-8 p-0"
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleWhatsApp(interest.user_phone, interest.user_name)}
                    className="h-8 w-8 p-0"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {interest.message && (
                <p className="text-xs text-muted-foreground border-t pt-2">
                  Message: {interest.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}