import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText, Shield, User, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VerificationBadge from '@/components/VerificationBadge';
import { adminSupabase } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatINRShort } from '@/lib/locale';
interface VerificationRequest {
  id: string;
  property_id: string;
  full_name: string;
  contact_number: string;
  email_address: string;
  ownership_type: string;
  construction_status: string;
  property_condition: string;
  title_clear: boolean;
  actual_photos_uploaded: boolean;
  completeness_score: number;
  verification_notes: string | null;
  created_at: string;
  properties: {
    title: string;
    location: string;
    price: number;
    verification_status: string;
  } | null;
}

const VerificationManagement: React.FC = () => {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('property_verification_details')
        .select(`
          *,
          properties (
            title,
            location,
            price,
            verification_status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched verification requests:', data);
      
      // Filter out requests with null properties
      const validRequests = (data || []).filter(request => request.properties !== null);
      console.log('Valid requests after filtering:', validRequests);
      
      setVerificationRequests(validRequests);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch verification requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (requestId: string, propertyId: string, action: 'approve' | 'reject') => {
    setIsApproving(true);
    try {
      // Update property verification status
      const newStatus = action === 'approve' ? 'verified' : 'rejected';
      
      const { error: propertyError } = await adminSupabase
        .from('properties')
        .update({ 
          verification_status: newStatus,
          verification_submitted_at: new Date().toISOString(),
          verification_completed_at: new Date().toISOString()
        })
        .eq('id', propertyId);

      if (propertyError) throw propertyError;

      // Update verification details with admin notes
      const { error: verificationError } = await adminSupabase
        .from('property_verification_details')
        .update({ 
          verification_notes: adminNotes || null
        })
        .eq('id', requestId);

      if (verificationError) throw verificationError;

      // Refresh the list
      await fetchVerificationRequests();
      
      toast({
        title: "Success",
        description: `Property verification ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <VerificationBadge status="verified" size="sm" />;
      case 'rejected':
        return <VerificationBadge status="rejected" size="sm" />;
      case 'pending':
        return <VerificationBadge status="pending" size="sm" />;
      default:
        return <VerificationBadge status="unverified" size="sm" />;
    }
  };

  const pendingRequests = verificationRequests.filter(req => 
    req.properties && (
      req.properties.verification_status === 'pending' || 
      req.properties.verification_status === 'unverified'
    )
  );
  
  const processedRequests = verificationRequests.filter(req => 
    req.properties && (
      req.properties.verification_status === 'verified' || 
      req.properties.verification_status === 'rejected'
    )
  );
  
  console.log('Pending requests:', pendingRequests);
  console.log('Processed requests:', processedRequests);

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading verification requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Property Verification Management</h2>
          <p className="text-muted-foreground">Review and approve property verification requests</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
            {pendingRequests.length} Pending
          </Badge>
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            {processedRequests.filter(r => r.properties?.verification_status === 'verified').length} Approved
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock size={16} />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="processed" className="flex items-center gap-2">
            <Shield size={16} />
            Processed ({processedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending verification requests</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{request.properties?.title || 'Unknown Property'}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {request.properties?.location || 'Unknown Location'}
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          {request.full_name}
                        </div>
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                          Score: {request.completeness_score}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.properties?.verification_status || 'unverified')}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <FileText size={16} className="mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Shield size={20} />
                              Property Verification Review
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedRequest && (
                            <div className="space-y-6">
                              {/* Property Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <MapPin size={16} />
                                      Property Details
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                     <div className="flex justify-between">
                                       <span className="text-muted-foreground">Title:</span>
                                       <span className="font-medium">{selectedRequest.properties?.title || 'Unknown'}</span>
                                     </div>
                                     <div className="flex justify-between">
                                       <span className="text-muted-foreground">Location:</span>
                                       <span className="font-medium">{selectedRequest.properties?.location || 'Unknown'}</span>
                                     </div>
                                     <div className="flex justify-between">
                                       <span className="text-muted-foreground">Price:</span>
                                       <span className="font-medium">{formatINRShort(selectedRequest.properties?.price || 0, language)}</span>
                                     </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <User size={16} />
                                      Contact Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Name:</span>
                                      <span className="font-medium">{selectedRequest.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Phone:</span>
                                      <span className="font-medium">{selectedRequest.contact_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Email:</span>
                                      <span className="font-medium">{selectedRequest.email_address}</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Verification Details */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <FileText size={16} />
                                    Verification Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                      <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Ownership Type:</span>
                                        <span className="font-medium">{selectedRequest.ownership_type}</span>
                                      </div>
                                      <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Construction Status:</span>
                                        <span className="font-medium">{selectedRequest.construction_status}</span>
                                      </div>
                                      <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Property Condition:</span>
                                        <span className="font-medium">{selectedRequest.property_condition}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Title Clear:</span>
                                        <span className={`font-medium ${selectedRequest.title_clear ? 'text-green-600' : 'text-red-600'}`}>
                                          {selectedRequest.title_clear ? 'Yes' : 'No'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Actual Photos:</span>
                                        <span className={`font-medium ${selectedRequest.actual_photos_uploaded ? 'text-green-600' : 'text-red-600'}`}>
                                          {selectedRequest.actual_photos_uploaded ? 'Uploaded' : 'Not Uploaded'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Completeness Score:</span>
                                        <Badge variant="secondary">
                                          {selectedRequest.completeness_score}%
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Admin Notes */}
                              <div className="space-y-4">
                                <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                                <Textarea
                                  id="admin-notes"
                                  placeholder="Add any notes about this verification..."
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRequest(null);
                                    setAdminNotes('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleVerificationAction(selectedRequest.id, selectedRequest.property_id, 'reject')}
                                  disabled={isApproving}
                                >
                                  <XCircle size={16} className="mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  onClick={() => handleVerificationAction(selectedRequest.id, selectedRequest.property_id, 'approve')}
                                  disabled={isApproving}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle size={16} className="mr-2" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          {processedRequests.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Shield size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No processed verification requests</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            processedRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                       <CardTitle className="text-lg">{request.properties?.title || 'Unknown Property'}</CardTitle>
                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
                         <div className="flex items-center gap-1">
                           <MapPin size={14} />
                           {request.properties?.location || 'Unknown Location'}
                         </div>
                         <div className="flex items-center gap-1">
                           <User size={14} />
                           {request.full_name}
                         </div>
                         <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                           Score: {request.completeness_score}%
                         </Badge>
                       </div>
                       {request.verification_notes && (
                         <div className="text-sm text-muted-foreground">
                           <strong>Admin Notes:</strong> {request.verification_notes}
                         </div>
                       )}
                     </div>
                     <div className="flex items-center gap-2">
                       {getStatusBadge(request.properties?.verification_status || 'unverified')}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VerificationManagement;