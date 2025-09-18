import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Phone, Shield } from 'lucide-react';

interface MobileVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  mandatory?: boolean;
}


export const MobileVerificationDialog: React.FC<MobileVerificationDialogProps> = ({
  open,
  onOpenChange,
  onComplete,
  mandatory = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const countryCode = '+91' as const;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  


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

      // Check if the Edge Function indicates success
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
        console.log(`✅ OTP verified successfully`);
        
        // Small delay to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast({
          title: "Success",
          description: "Mobile number verified successfully!",
        });
        onComplete();
        // Only close if not mandatory, otherwise let parent handle
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
      setStep('phone');
      setPhoneNumber('');
      setOtp('');
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
  };

  return (
    <Dialog open={open} onOpenChange={mandatory ? undefined : handleClose}>
      <DialogContent className="sm:max-w-md z-[60]" onPointerDownOutside={mandatory ? (e) => e.preventDefault() : undefined} onEscapeKeyDown={mandatory ? (e) => e.preventDefault() : undefined}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            {step === 'phone' ? 'Verify Mobile Number' : 'Enter Verification Code'}
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            {step === 'phone' 
              ? 'Please verify your mobile number to complete your account setup'
              : `We've sent a verification code to ${countryCode}${phoneNumber}`
            }
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'phone' ? (
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

              <Button
                onClick={sendOtp}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400"
                disabled={loading || phoneNumber.length !== 10}
              >
                {loading ? "Sending OTP..." : "Send Verification Code"}
              </Button>
            </>
          ) : (
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
                  onClick={handleBack}
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
                  onClick={handleBack}
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