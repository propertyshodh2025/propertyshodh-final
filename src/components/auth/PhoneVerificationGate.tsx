import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedMobileVerificationDialog } from "@/components/auth/EnhancedMobileVerificationDialog";

// Renders nothing, but ensures phone verification dialog is shown for new/unverified users
// Now also ensures Terms of Service and Privacy Policy acceptance
export const PhoneVerificationGate: React.FC = () => {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkProfile = useCallback(async () => {
    if (loading || isChecking) return;
    if (!user) {
      setOpen(false);
      setChecked(true);
      return;
    }

    setIsChecking(true);
    
    try {
      console.log(`🔍 [VERIFICATION CHECK] Checking for user: ${user.id}`);
      console.log(`🔍 [USER INFO] Email: ${user.email}`);
      
      // Always fetch fresh data from database - no caching
      const { data, error } = await supabase
        .from("profiles")
        .select("mobile_verified, phone_number, terms_accepted, privacy_policy_accepted, email, onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ [DB ERROR] Profile check failed:", error);
        console.log("🛠️ [ACTION] Showing dialog due to DB error");
        setOpen(true);
        setChecked(true);
        return;
      }

      // Handle case where profile doesn't exist yet
      if (!data) {
        console.log(`⚠️ [MISSING PROFILE] No profile exists for user ${user.id}`);
        console.log("🛠️ [ACTION] Showing dialog for new user");
        setOpen(true);
        setChecked(true);
        return;
      }

      // CRITICAL: Check if user has completed onboarding - if so, NEVER show the dialog again
      if (data.onboarding_completed) {
        console.log(`🎉 [ONBOARDING COMPLETED] User ${user.id} has completed onboarding - NEVER SHOWING DIALOG AGAIN`);
        console.log(`✅ [PERMANENT SKIP] Onboarding popup will never appear for this user again`);
        setOpen(false);
        setChecked(true);
        return;
      }

      // Log current verification status from database
      console.log(`📋 [PROFILE DATA] Status for user ${user.id}:`, {
        mobile_verified: data.mobile_verified,
        phone_number: data.phone_number ? '***' + data.phone_number.slice(-4) : null,
        terms_accepted: data.terms_accepted,
        privacy_policy_accepted: data.privacy_policy_accepted,
        onboarding_completed: data.onboarding_completed,
        email: data.email
      });

      // Check all verification requirements
      const isMobileVerified = Boolean(data.mobile_verified) && Boolean(data.phone_number);
      const isTermsAccepted = Boolean(data.terms_accepted);
      const isPrivacyAccepted = Boolean(data.privacy_policy_accepted);
      
      // User is fully verified if ALL conditions are met
      const isFullyVerified = isMobileVerified && isTermsAccepted && isPrivacyAccepted;
      
      console.log(`📊 [VERIFICATION RESULT]:`, {
        mobile_verified: isMobileVerified,
        terms_accepted: isTermsAccepted,
        privacy_accepted: isPrivacyAccepted,
        fully_verified: isFullyVerified
      });
      
      if (isFullyVerified) {
        console.log(`✅ [SUCCESS] User is fully verified - NO DIALOG`);
        setOpen(false);
      } else {
        console.log(`❌ [INCOMPLETE] User needs verification - SHOWING DIALOG`);
        setOpen(true);
      }
    } catch (e) {
      console.error("💥 [FATAL ERROR] Profile check failed:", e);
      console.log("🛠️ [ACTION] Showing dialog due to error");
      setOpen(true);
    } finally {
      setChecked(true);
      setIsChecking(false);
    }
  }, [user, loading, isChecking]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  const handleVerificationComplete = useCallback(() => {
    console.log(`🎊 [VERIFICATION COMPLETE] User ${user?.id} finished verification`);
    console.log(`🔄 [ACTION] Re-checking verification status from database...`);
    
    // Force a fresh check from database after verification
    setChecked(false);
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
