import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MobileVerificationDialog } from "@/components/auth/MobileVerificationDialog";

// Renders nothing, but ensures phone verification dialog is shown for new/unverified users
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
        // Fetch profile
        const { data, error } = await supabase
          .from("profiles")
          .select("mobile_verified, phone_number")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("Profile check error", error);
          // If we can't check verification status, show dialog to be safe
          setOpen(true);
          setChecked(true);
          return;
        }

        const isVerified = Boolean(data?.mobile_verified) && Boolean(data?.phone_number);
        
        // Always show dialog if not verified - no session storage bypass
        if (!isVerified) {
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
    <MobileVerificationDialog
      open={open}
      onOpenChange={() => {}} // Prevent closing the dialog
      onComplete={() => {
        setOpen(false);
      }}
      mandatory={true}
    />
  );
};
