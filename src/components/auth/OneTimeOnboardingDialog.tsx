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
import { Phone, Shield, FileText, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { SimpleTermsOfService } from './SimpleTermsOfService';
import { SimplePrivacyPolicy } from './SimplePrivacyPolicy';

interface OneTimeOnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

type Step = 'welcome' | 'terms' | 'phone' | 'otp' | 'success';
type PolicyView = 'terms' | 'privacy' | null;

export const OneTimeOnboardingDialog: React.FC<OneTimeOnboardingDialogProps> = ({
  open,
  onComplete,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('welcome');
  const [policyView, setPolicyView] = useState<PolicyView>(null);
  
  // Form state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const countryCode = '+91';

  // Send OTP
  const sendOtp = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast({
        title: "Invalid number",
        description: "Enter a valid 10-digit Indian mobile number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: phoneNumber, purpose: 'onboarding' }
      });
      
      if (error) throw error;

      if (data?.success) {
        setStep('otp');
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${countryCode}${phoneNumber}${data.dev_otp ? ` (Dev: ${data.dev_otp})` : ''}`,
        });
      } else {
        throw new Error(data?.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and complete onboarding
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
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: phoneNumber, otp, purpose: 'onboarding' }
      });
      
      if (error) throw error;

      if (data?.verified) {
        // Mark onboarding as completed in localStorage immediately
        if (user?.id) {
          localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
        }
        
        setStep('success');
        
        toast({
          title: "Welcome to PropertyShodh!",
          description: "Your account setup is complete. You're ready to explore properties!",
        });

        // Auto-close after success message
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        throw new Error(data?.message || 'Invalid OTP');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Policy viewer
  if (policyView) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] z-[60]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {policyView === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
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
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md z-[60]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            {step === 'welcome' ? 'Welcome to PropertyShodh!' : 
             step === 'terms' ? 'Accept Terms & Privacy Policy' :
             step === 'phone' ? 'Verify Mobile Number' : 
             step === 'otp' ? 'Enter Verification Code' :
             'Setup Complete!'}
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            {step === 'welcome' ? 'Let\'s get your account set up in just a few quick steps' :
             step === 'terms' ? 'Please read and accept our Terms of Service and Privacy Policy' :
             step === 'phone' ? 'We need to verify your mobile number for security' : 
             step === 'otp' ? `Enter the code sent to ${countryCode}${phoneNumber}` :
             'You\'re all set to start exploring properties!'}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Welcome Step */}
          {step === 'welcome' && (
            <>
              <div className="rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-green-800 dark:text-green-200">One-Time Setup</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      This setup is required only once. After completion, you'll never see this again, even if you log out and back in.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">What we'll do:</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Accept Terms of Service & Privacy Policy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Verify your mobile number</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setStep('terms')}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400"
                >
                  Get Started
                </Button>
              </div>
            </>
          )}

          {/* Terms Acceptance Step */}
          {step === 'terms' && (
            <>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200">Legal Requirements</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You must accept both documents to use PropertyShodh. This cannot be skipped.
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
                        Terms of Service and Disclaimer
                      </button>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPolicyView('terms')}
                      className="w-full flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Read Terms of Service & Disclaimer
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

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('welcome')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep('phone')}
                  className={`flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 ${
                    !termsAccepted || !privacyAccepted ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!termsAccepted || !privacyAccepted}
                >
                  Continue
                </Button>
              </div>

              {(!termsAccepted || !privacyAccepted) && (
                <p className="text-xs text-center text-red-600 dark:text-red-400">
                  You must accept both Terms of Service & Disclaimer and Privacy Policy to continue
                </p>
              )}
            </>
          )}

          {/* Phone Verification Step */}
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
                  onClick={() => setStep('terms')}
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
                  {loading ? "Sending..." : "Send Code"}
                </Button>
              </div>
            </>
          )}

          {/* OTP Verification Step */}
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
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
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
                  {loading ? "Verifying..." : "Complete Setup"}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Didn't receive the code?{' '}
                <button
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Try again
                </button>
              </p>
            </>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">Setup Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Your account is ready. You can now explore properties and all features.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};