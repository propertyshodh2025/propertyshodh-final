import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MobileVerificationGuardProps {
  children: React.ReactNode;
}

export const MobileVerificationGuard: React.FC<MobileVerificationGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const location = useLocation();

  // Allow these routes without mobile verification
  const allowedRoutes = ["/", "/search", "/properties", "/property"];
  const isAllowedRoute = allowedRoutes.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (loading) return;
      
      if (!user) {
        setIsVerified(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("mobile_verified, phone_number, terms_accepted, privacy_policy_accepted, onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("Profile verification check error", error);
          setIsVerified(false);
          return;
        }

        // If user has completed onboarding, they are automatically verified
        if (data?.onboarding_completed) {
          setIsVerified(true);
          return;
        }
        
        const isMobileVerified = Boolean(data?.mobile_verified) && Boolean(data?.phone_number);
        const isTermsAccepted = Boolean(data?.terms_accepted);
        const isPrivacyAccepted = Boolean(data?.privacy_policy_accepted);
        
        // User is fully verified only if mobile is verified AND terms are accepted
        const verified = isMobileVerified && isTermsAccepted && isPrivacyAccepted;
        setIsVerified(verified);
      } catch (e) {
        console.warn("Profile verification check failed", e);
        setIsVerified(false);
      }
    };

    checkVerificationStatus();
  }, [user, loading]);

  // Still loading
  if (loading || (user && isVerified === null)) {
    return <div>Loading...</div>;
  }

  // Not logged in - allow access
  if (!user) {
    return <>{children}</>;
  }

  // Logged in but not verified and trying to access protected routes
  if (user && isVerified === false && !isAllowedRoute) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg shadow-lg max-w-md mx-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Verification Required</h2>
          <p className="text-muted-foreground mb-6">
            You must verify your mobile number and accept our Terms of Service and Privacy Policy to access this area.
          </p>
          <Button onClick={() => window.location.href = "/"} className="w-full">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // All good - allow access
  return <>{children}</>;
};