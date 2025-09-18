import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Phone, Shield, FileText, Eye, AlertTriangle } from 'lucide-react';
import { SimpleTermsOfService } from './SimpleTermsOfService';
import { SimplePrivacyPolicy } from './SimplePrivacyPolicy';

interface EnhancedMobileVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  mandatory?: boolean;
}

type Step = 'terms' | 'phone' | 'otp';
type PolicyType = 'terms' | 'privacy' | null;

export const EnhancedMobileVerificationDialog: React.FC<EnhancedMobileVerificationDialogProps> = ({
  open,
  onOpenChange,
  onComplete,
  mandatory = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('terms');
  const [policyView, setPolicyView] = useState<PolicyType>(null);
  const countryCode = '+91' as const;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Terms and Privacy Policy acceptance states
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Validation for terms step
  const canProceedFromTerms = termsAccepted && privacyAccepted;

  const sendOtp = async () => {
    const isValid = /^\d{10}$/.test(phoneNumber);
    if (!isValid) {
      toast({
        title: "Invalid number",
        description: "Enter a valid 10-digit Indian mobile number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log(`🚀 Sending OTP to phone: ${phoneNumber}`);
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: phoneNumber, purpose: 'verify_mobile' }
      });
      
      console.log('📡 Edge Function Response:', { data, error });
      console.log('📋 Response Data Details:', JSON.stringify(data, null, 2));
      
      if (error) {
        console.error('❌ Edge Function Error:', error);
        throw error;
      }

      if (data?.success === true) {
        console.log('✅ OTP sent successfully');
        setStep('otp');
        toast({
          title: "OTP Sent",
          description: `Code sent to ${countryCode}${phoneNumber}${data.otp ? ` (Dev: ${data.otp})` : ''}`,
        });
      } else {
        console.error('❌ Edge Function indicated failure:', data);
        throw new Error(data?.message || data?.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('💥 Error sending OTP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log(`🔐 Verifying OTP for phone: ${phoneNumber}`);
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: phoneNumber, otp, purpose: 'verify_mobile' }
      });
      if (error) throw error;

      if (data?.verified) {
        console.log(`✅ OTP verification successful for user: ${user?.id}`);
        console.log(`📝 Profile should now be fully updated by server`);
        
        // Wait a moment for database to be fully updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify the profile was actually updated by the server
        const { data: verifyData, error: verifyError } = await supabase
          .from('profiles')
          .select('mobile_verified, terms_accepted, privacy_policy_accepted, phone_number')
          .eq('user_id', user?.id)
          .single();
          
        if (verifyError) {
          console.warn('⚠️ Could not verify profile update:', verifyError);
        } else {
          console.log('🔄 Profile verification status after server update:', verifyData);
          
          const isFullyVerified = verifyData.mobile_verified && 
                                 verifyData.terms_accepted && 
                                 verifyData.privacy_policy_accepted &&
                                 verifyData.phone_number;
          
          if (isFullyVerified) {
            console.log('🎉 User is now fully verified!');
          } else {
            console.warn('⚠️ User verification incomplete:', verifyData);
          }
        }

        toast({
          title: "Success",
          description: "Mobile number verified successfully!",
        });
        onComplete();
        if (!mandatory) {
          onOpenChange(false);
        }
      } else {
        throw new Error(data?.message || 'Invalid OTP');
      }
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      toast({
        title: "Error",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Never allow closing when mandatory
    if (!loading && !mandatory) {
      setStep('terms');
      setPhoneNumber('');
      setOtp('');
      setTermsAccepted(false);
      setPrivacyAccepted(false);
      setPolicyView(null);
      onOpenChange(false);
    }
  };

  const handleBackFromPhone = () => {
    setStep('terms');
    setPhoneNumber('');
  };

  const handleBackFromOtp = () => {
    setStep('phone');
    setOtp('');
  };

  const handleProceedToPhone = () => {
    if (!canProceedFromTerms) {
      toast({
        title: "Acceptance Required",
        description: "You must accept both Terms of Service and Privacy Policy to continue",
        variant: "destructive",
      });
      return;
    }
    setStep('phone');
  };

  // Show policy viewer
  if (policyView) {
    return (
      <Dialog open={open} onOpenChange={mandatory ? undefined : handleClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] z-[60]" onPointerDownOutside={mandatory ? (e) => e.preventDefault() : undefined} onEscapeKeyDown={mandatory ? (e) => e.preventDefault() : undefined}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {policyView === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {policyView === 'terms' ? <SimpleTermsOfService /> : <SimplePrivacyPolicy />}
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setPolicyView(null)} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={mandatory ? undefined : handleClose}>
      <DialogContent className="sm:max-w-md z-[60]" onPointerDownOutside={mandatory ? (e) => e.preventDefault() : undefined} onEscapeKeyDown={mandatory ? (e) => e.preventDefault() : undefined}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            {step === 'terms' ? 'Welcome to PropertyShodh!' : 
             step === 'phone' ? 'Verify Mobile Number' : 
             'Enter Verification Code'}
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            {step === 'terms' ? 'Before we start, please accept our Terms of Service and Privacy Policy' :
             step === 'phone' ? 'Please verify your mobile number to complete your account setup' : 
             `We've sent a verification code to ${countryCode}${phoneNumber}`}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'terms' && (
            <>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200">Mandatory Acceptance</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You must accept both our Terms of Service and Privacy Policy to use PropertyShodh. 
                      This step cannot be skipped.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                    className="mt-1"
                  />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="terms" className="text-sm font-medium leading-relaxed cursor-pointer">
                      I have read and agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setPolicyView('terms')}
                        className="text-blue-600 hover:text-blue-800 underline font-semibold"
                      >
                        Terms of Service
                      </button>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPolicyView('terms')}
                      className="w-full flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Read Terms of Service
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="privacy" 
                    checked={privacyAccepted}
                    onCheckedChange={(checked) => setPrivacyAccepted(!!checked)}
                    className="mt-1"
                  />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="privacy" className="text-sm font-medium leading-relaxed cursor-pointer">
                      I have read and agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setPolicyView('privacy')}
                        className="text-blue-600 hover:text-blue-800 underline font-semibold"
                      >
                        Privacy Policy
                      </button>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPolicyView('privacy')}
                      className="w-full flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Read Privacy Policy
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleProceedToPhone}
                className={`w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 ${
                  !canProceedFromTerms ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!canProceedFromTerms}
              >
                Continue to Mobile Verification
              </Button>

              {!canProceedFromTerms && (
                <p className="text-xs text-center text-red-600 dark:text-red-400">
                  You must accept both Terms of Service and Privacy Policy to continue
                </p>
              )}
            </>
          )}

          {step === 'phone' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Mobile Number
                </Label>
                <div className="flex">
                  <div className="flex items-center px-3 py-2 border border-r-0 border-input bg-muted rounded-l-md">
                    <span className="text-sm font-medium">{countryCode}</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhoneNumber(v);
                    }}
                    placeholder="10-digit mobile number"
                    className="flex-1 rounded-l-none"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBackFromPhone}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={sendOtp}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400"
                  disabled={loading || phoneNumber.length !== 10}
                >
                  {loading ? "Sending OTP..." : "Send Verification Code"}
                </Button>
              </div>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Verification Code
                </Label>
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6} 
                    value={otp} 
                    onChange={setOtp}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBackFromOtp}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={verifyOtp}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Didn't receive the code?{' '}
                <button
                  onClick={handleBackFromOtp}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Try again
                </button>
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};