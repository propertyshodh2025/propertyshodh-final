import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedMobileVerificationDialog } from "@/components/auth/EnhancedMobileVerificationDialog";

// Renders nothing, but ensures phone verification dialog is shown for new/unverified users
// Now also ensures Terms of Service and Privacy Policy acceptance
export const PhoneVerificationGate: React.FC = () => {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const checkInProgressRef = useRef(false);
  const lastCheckedUserRef = useRef<string | null>(null);
  const verificationStatusCache = useRef<{ [userId: string]: boolean }>({});

  const checkProfile = useCallback(async () => {
    if (loading || checkInProgressRef.current) return;
    if (!user) {
      setOpen(false);
      setChecked(true);
      return;
    }

    // If we already checked this user and they were verified, don't check again
    if (lastCheckedUserRef.current === user.id && verificationStatusCache.current[user.id] === true) {
      setOpen(false);
      setChecked(true);
      return;
    }

    // If we're checking the same user again too quickly, skip
    if (lastCheckedUserRef.current === user.id && Date.now() - (verificationStatusCache.current[`${user.id}_timestamp`] || 0) < 5000) {
      return;
    }

    checkInProgressRef.current = true;
    
    try {
      console.log(`🔍 Checking verification status for user: ${user.id}`);
      
      // Fetch profile including terms acceptance status
      const { data, error } = await supabase
        .from("profiles")
        .select("mobile_verified, phone_number, terms_accepted, privacy_policy_accepted")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.warn("❌ Profile check error", error);
        // If we can't check verification status, show dialog to be safe
        setOpen(true);
        setChecked(true);
        return;
      }

      console.log(`📋 Profile data:`, {
        mobile_verified: data?.mobile_verified,
        phone_number: data?.phone_number ? '***' + data.phone_number.slice(-4) : 'null',
        terms_accepted: data?.terms_accepted,
        privacy_policy_accepted: data?.privacy_policy_accepted
      });

      const isMobileVerified = Boolean(data?.mobile_verified) && Boolean(data?.phone_number);
      const isTermsAccepted = Boolean(data?.terms_accepted);
      const isPrivacyAccepted = Boolean(data?.privacy_policy_accepted);
      
      // Show dialog if any of the mandatory requirements are not met
      const isFullyVerified = isMobileVerified && isTermsAccepted && isPrivacyAccepted;
      
      // Cache the verification status
      verificationStatusCache.current[user.id] = isFullyVerified;
      verificationStatusCache.current[`${user.id}_timestamp`] = Date.now();
      lastCheckedUserRef.current = user.id;
      
      console.log(`✅ Verification check complete:`, {
        isMobileVerified,
        isTermsAccepted,
        isPrivacyAccepted,
        isFullyVerified,
        shouldShowDialog: !isFullyVerified
      });
      
      if (!isFullyVerified) {
        console.log(`🚨 User not fully verified, showing dialog`);
        setOpen(true);
      } else {
        console.log(`🎉 User fully verified, no dialog needed`);
        setOpen(false);
      }
    } catch (e) {
      console.warn("💥 Profile check failed", e);
      // If verification check fails, show dialog to be safe
      setOpen(true);
    } finally {
      setChecked(true);
      checkInProgressRef.current = false;
    }
  }, [user, loading]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  const handleVerificationComplete = useCallback(() => {
    console.log(`🎊 Verification completed for user: ${user?.id}`);
    if (user) {
      // Mark user as verified in cache
      verificationStatusCache.current[user.id] = true;
      verificationStatusCache.current[`${user.id}_timestamp`] = Date.now();
    }
    setOpen(false);
  }, [user]);

  if (!checked) return null;

  return (
    <EnhancedMobileVerificationDialog
      open={open}
      onOpenChange={() => {}} // Prevent closing the dialog
      onComplete={handleVerificationComplete}
      mandatory={true}
    />
  );
};
