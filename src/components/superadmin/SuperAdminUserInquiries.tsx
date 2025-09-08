import React, { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, User, Trash2 } from 'lucide-react';

interface UserInquiry {
  id: string;
  name: string;
  phone: string;
  purpose: string | null;
  property_type: string | null;
  budget_range: string | null;
  location: string | null;
  bedrooms: string | null;
  created_at: string;
}

const SuperAdminUserInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from('user_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inquiries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this general inquiry?')) return;

    try {
      const { error } = await adminSupabase
        .from('user_inquiries')
        .delete()
        .eq('id', inquiryId);

      if (error) throw error;
      
      fetchInquiries();
      toast({
        title: "Success",
        description: "General inquiry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to delete general inquiry",
        variant: "destructive",
      });
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, this is PropertyShodh. Following up on your general inquiry.`);
    const formatted = phone.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${formatted}?text=${message}`, '_blank');
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const searchLower = searchTerm.toLowerCase();
    return (
      inquiry.name.toLowerCase().includes(searchLower) ||
      inquiry.phone.toLowerCase().includes(searchLower) ||
      inquiry.purpose?.toLowerCase().includes(searchLower) ||
      inquiry.property_type?.toLowerCase().includes(searchLower) ||
      inquiry.location?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">General User Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, phone, purpose, property type, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading general inquiries...</p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No general inquiries found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => (
                <Card key={inquiry.id} className="border border-border/80 shadow-sm">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {inquiry.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Phone: {inquiry.phone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Purpose: {inquiry.purpose || 'N/A'}
                        </p>
                        {inquiry.phone && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCall(inquiry.phone)}
                              className="flex items-center gap-1"
                            >
                              <Phone className="h-4 w-4" /> Call
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWhatsApp(inquiry.phone, inquiry.name)}
                              className="flex items-center gap-1"
                            >
                              <MessageSquare className="h-4 w-4" /> WhatsApp
                            </Button>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Property Preferences:</h4>
                        <p className="text-sm text-muted-foreground">
                          Type: {inquiry.property_type || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Budget: {inquiry.budget_range || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Location: {inquiry.location || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Bedrooms: {inquiry.bedrooms || 'N/A'}
                        </p>
                      </div>
                      <div className="flex flex-col justify-between items-start md:items-end">
                        <div className="text-xs text-muted-foreground">
                          Submitted: {new Date(inquiry.created_at).toLocaleString()}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteInquiry(inquiry.id)}
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

export default SuperAdminUserInquiries;