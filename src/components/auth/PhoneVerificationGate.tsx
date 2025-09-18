import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedMobileVerificationDialog } from "@/components/auth/EnhancedMobileVerificationDialog";

// Renders nothing, but ensures phone verification dialog is shown for new/unverified users
// Now also ensures Terms of Service and Privacy Policy acceptance
export const PhoneVerificationGate: React.FC = () => {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (loading) return;
      if (!user) {
        setOpen(false);
        setChecked(true);
        return;
      }

      try {
        // Fetch profile including terms acceptance status
        const { data, error } = await supabase
          .from("profiles")
          .select("mobile_verified, phone_number, terms_accepted, privacy_policy_accepted")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("Profile check error", error);
          // If we can't check verification status, show dialog to be safe
          setOpen(true);
          setChecked(true);
          return;
        }

        const isMobileVerified = Boolean(data?.mobile_verified) && Boolean(data?.phone_number);
        const isTermsAccepted = Boolean(data?.terms_accepted);
        const isPrivacyAccepted = Boolean(data?.privacy_policy_accepted);
        
        // Show dialog if any of the mandatory requirements are not met
        const isFullyVerified = isMobileVerified && isTermsAccepted && isPrivacyAccepted;
        
        if (!isFullyVerified) {
          setOpen(true);
        }
      } catch (e) {
        console.warn("Profile check failed", e);
        // If verification check fails, show dialog to be safe
        setOpen(true);
      } finally {
        setChecked(true);
      }
    };

    checkProfile();
  }, [user, loading]);

  if (!checked) return null;

  return (
    <EnhancedMobileVerificationDialog
      open={open}
      onOpenChange={() => {}} // Prevent closing the dialog
      onComplete={() => {
        setOpen(false);
      }}
      mandatory={true}
    />
  );
};
