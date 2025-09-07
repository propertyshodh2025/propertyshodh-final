import React, { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, Home, User, Trash2 } from 'lucide-react';
import { formatINRShort } from '@/lib/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface PropertyInquiry {
  id: string;
  property_id: string;
  user_name: string;
  user_phone: string;
  inquiry_type: string;
  message: string | null;
  created_at: string;
  is_verified: boolean;
  properties: {
    title: string;
    price: number;
    location: string;
  } | null;
}

const SuperAdminPropertyInterest: React.FC = () => {
  const [propertyInquiries, setPropertyInquiries] = useState<PropertyInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchPropertyInquiries();
  }, []);

  const fetchPropertyInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from('property_inquiries')
        .select(`
          *,
          properties!property_inquiries_property_id_fkey (
            title,
            price,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPropertyInquiries(data || []);
    } catch (error) {
      console.error('Error fetching property inquiries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch property inquiries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePropertyInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this property inquiry?')) return;

    try {
      const { error } = await adminSupabase
        .from('property_inquiries')
        .delete()
        .eq('id', inquiryId);

      if (error) throw error;
      
      fetchPropertyInquiries();
      toast({
        title: "Success",
        description: "Property inquiry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting property inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to delete property inquiry",
        variant: "destructive",
      });
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, this is PropertyShodh. Following up on your property inquiry.`);
    const formatted = phone.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${formatted}?text=${message}`, '_blank');
  };

  const filteredPropertyInquiries = propertyInquiries.filter(inquiry => {
    const searchLower = searchTerm.toLowerCase();
    return (
      inquiry.user_name.toLowerCase().includes(searchLower) ||
      inquiry.user_phone.toLowerCase().includes(searchLower) ||
      inquiry.inquiry_type.toLowerCase().includes(searchLower) ||
      inquiry.message?.toLowerCase().includes(searchLower) ||
      inquiry.properties?.title?.toLowerCase().includes(searchLower) ||
      inquiry.properties?.location?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Property Interest Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by user name, phone, inquiry type, or property title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading property inquiries...</p>
            </div>
          ) : filteredPropertyInquiries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No property inquiries found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPropertyInquiries.map((inquiry) => (
                <Card key={inquiry.id} className="border border-border/80 shadow-sm">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {inquiry.user_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Phone: {inquiry.user_phone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Interest: {inquiry.inquiry_type}
                        </p>
                        {inquiry.message && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Message: {inquiry.message}
                          </p>
                        )}
                        {inquiry.user_phone && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCall(inquiry.user_phone)}
                              className="flex items-center gap-1"
                            >
                              <Phone className="h-4 w-4" /> Call
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWhatsApp(inquiry.user_phone, inquiry.user_name)}
                              className="flex items-center gap-1"
                            >
                              <MessageSquare className="h-4 w-4" /> WhatsApp
                            </Button>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          Property Details:
                        </h4>
                        {inquiry.properties ? (
                          <>
                            <p className="text-sm font-semibold">{inquiry.properties.title}</p>
                            <p className="text-xs text-muted-foreground">{inquiry.properties.location}</p>
                            <p className="text-xs text-muted-foreground">
                              Price: {formatINRShort(inquiry.properties.price, language)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Property not found or deleted.</p>
                        )}
                      </div>
                      <div className="flex flex-col justify-between items-start md:items-end">
                        <div className="text-xs text-muted-foreground">
                          Submitted: {new Date(inquiry.created_at).toLocaleString()}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePropertyInquiry(inquiry.id)}
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

export default SuperAdminPropertyInterest;