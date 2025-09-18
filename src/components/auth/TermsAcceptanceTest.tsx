import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTermsValidation } from '@/hooks/useTermsValidation';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedMobileVerificationDialog } from './EnhancedMobileVerificationDialog';
import { CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export const TermsAcceptanceTest: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, isVerified, details, error, refetch } = useTermsValidation();
  const [showDialog, setShowDialog] = useState(false);

  const getStatusIcon = (status: boolean | null | undefined) => {
    if (status === true) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === false) return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusBadge = (status: boolean | null | undefined, label: string) => {
    if (status === true) return <Badge variant="default" className="bg-green-100 text-green-800">{label}: ✓</Badge>;
    if (status === false) return <Badge variant="destructive">{label}: ✗</Badge>;
    return <Badge variant="secondary">{label}: ?</Badge>;
  };

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>Please sign in to test terms acceptance flow.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Terms Acceptance Test Dashboard
            {getStatusIcon(isVerified)}
          </CardTitle>
          <CardDescription>
            This dashboard shows the current terms acceptance status and allows testing of the flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <Alert>
              <Clock className="w-4 h-4" />
              <AlertDescription>Loading verification status...</AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Status Overview */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Overall Status</h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(isVerified)}
                  <span className={`font-medium ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {isVerified === true ? 'Fully Verified' : 
                     isVerified === false ? 'Verification Required' : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">User ID</h3>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
              </div>
            </div>
          )}

          {/* Detailed Status */}
          {details && (
            <div className="space-y-3">
              <h3 className="font-semibold">Detailed Status</h3>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(details.mobile_verified, 'Mobile Verified')}
                {getStatusBadge(details.phone_number_provided, 'Phone Number')}
                {getStatusBadge(details.terms_accepted, 'Terms of Service')}
                {getStatusBadge(details.privacy_policy_accepted, 'Privacy Policy')}
              </div>

              {(details.terms_accepted_at || details.privacy_policy_accepted_at) && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {details.terms_accepted_at && (
                    <p>Terms accepted: {new Date(details.terms_accepted_at).toLocaleString()}</p>
                  )}
                  {details.privacy_policy_accepted_at && (
                    <p>Privacy policy accepted: {new Date(details.privacy_policy_accepted_at).toLocaleString()}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
            
            <Button 
              onClick={() => setShowDialog(true)} 
              variant="default" 
              size="sm"
              disabled={isVerified === true}
            >
              {isVerified === true ? 'Already Verified' : 'Start Verification Process'}
            </Button>
          </div>

          {/* Security Notes */}
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Security Features:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Server-side validation prevents client-side bypassing</li>
                <li>Terms acceptance is mandatory and cannot be skipped</li>
                <li>Dialog cannot be closed without completing the process</li>
                <li>Mobile verification and terms acceptance are linked</li>
                <li>All validation is done through secure Edge Functions</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <EnhancedMobileVerificationDialog
        open={showDialog}
        onOpenChange={() => {}} // Prevent closing during test
        onComplete={() => {
          setShowDialog(false);
          refetch(); // Refresh status after completion
        }}
        mandatory={true}
      />
    </div>
  );
};