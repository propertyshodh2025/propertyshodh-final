import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OneTimeOnboardingDialog } from "./OneTimeOnboardingDialog";

/**
 * OnboardingGuard - Shows the onboarding dialog for users who haven't completed it
 * 
 * This component:
 * 1. Checks if user has completed onboarding (from database or localStorage)
 * 2. Shows onboarding dialog only once per user
 * 3. Never shows the dialog again after completion
 * 4. Handles both new and existing users seamlessly
 */
export const OnboardingGuard: React.FC = () => {
  const { user, loading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    if (loading) return;
    
    // Not logged in - no onboarding needed
    if (!user) {
      setNeedsOnboarding(false);
      setChecking(false);
      return;
    }

    // 🚨 EMERGENCY FIX: Check multiple localStorage keys to ensure popup never shows for completed users
    const localStorageKey = `onboarding_completed_${user.id}`;
    const completedLocally = localStorage.getItem(localStorageKey);
    
    // Also check if user manually disabled popup
    const manuallyDisabled = localStorage.getItem(`popup_disabled_${user.id}`);
    const emergencyBypass = localStorage.getItem(`emergency_skip_${user.id}`);
    const neverShow = localStorage.getItem(`never_show_onboarding_${user.id}`);
    const userVerified = localStorage.getItem(`user_verified_${user.id}`);
    
    // Global emergency overrides
    const globalDisabled = localStorage.getItem('global_popup_disabled');
    const emergencyOverride = localStorage.getItem('emergency_override');
    
    if (completedLocally === 'true' || manuallyDisabled === 'true' || emergencyBypass === 'true' || 
        neverShow === 'true' || userVerified === 'true' || globalDisabled === 'true' || emergencyOverride === 'true') {
      console.log(`✅ [ONBOARDING SKIP] User ${user.id} - popup permanently blocked`);
      console.log(`🚫 [POPUP BLOCKED] Multiple override flags detected - onboarding will NEVER show`);
      console.log(`🗺️ [FLAGS] completed=${completedLocally}, disabled=${manuallyDisabled}, emergency=${emergencyBypass}, never=${neverShow}, verified=${userVerified}, global=${globalDisabled}, override=${emergencyOverride}`);
      setNeedsOnboarding(false);
      setChecking(false);
      return;
    }

    setChecking(true);

    try {
      console.log(`🔍 [ONBOARDING CHECK] Checking onboarding status for user: ${user.id}`);
      
      // Check database for onboarding completion
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarding_completed, mobile_verified, terms_accepted, privacy_policy_accepted, phone_number")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.warn("⚠️ [ONBOARDING CHECK] Profile check error:", error);
        // If we can't check, assume onboarding is needed
        setNeedsOnboarding(true);
        setChecking(false);
        return;
      }

      // No profile exists - definitely needs onboarding
      if (!profile) {
        console.log(`📝 [ONBOARDING NEEDED] No profile exists for user ${user.id}`);
        setNeedsOnboarding(true);
        setChecking(false);
        return;
      }

      // Check if onboarding is completed
      const isOnboardingComplete = Boolean(profile.onboarding_completed);
      
      // Also check legacy completion (all requirements met)
      const isLegacyComplete = Boolean(
        profile.mobile_verified && 
        profile.terms_accepted && 
        profile.privacy_policy_accepted && 
        profile.phone_number
      );

      if (isOnboardingComplete || isLegacyComplete) {
        console.log(`✅ [ONBOARDING COMPLETE] User ${user.id} has completed onboarding`);
        
        // Cache completion status locally for future visits
        localStorage.setItem(localStorageKey, 'true');
        
        // If legacy complete but not marked as onboarding complete, update database
        if (isLegacyComplete && !isOnboardingComplete) {
          console.log(`🔄 [LEGACY UPDATE] Updating onboarding_completed flag for user ${user.id}`);
          await supabase
            .from("profiles")
            .update({ onboarding_completed: true })
            .eq("user_id", user.id);
        }
        
        setNeedsOnboarding(false);
      } else {
        console.log(`❌ [ONBOARDING NEEDED] User ${user.id} needs onboarding:`, {
          onboarding_completed: isOnboardingComplete,
          mobile_verified: Boolean(profile.mobile_verified),
          terms_accepted: Boolean(profile.terms_accepted),
          privacy_policy_accepted: Boolean(profile.privacy_policy_accepted),
          phone_number_exists: Boolean(profile.phone_number)
        });
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error("💥 [ONBOARDING CHECK] Error checking onboarding status:", error);
      // On error, assume onboarding is needed to be safe
      setNeedsOnboarding(true);
    } finally {
      setChecking(false);
    }
  }, [user, loading]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  const handleOnboardingComplete = useCallback(() => {
    console.log(`🎉 [ONBOARDING COMPLETE] User ${user?.id} completed onboarding`);
    
    // Mark as completed in localStorage immediately
    if (user?.id) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    
    // Hide the dialog
    setNeedsOnboarding(false);
    
    // Optional: Refresh the page to ensure clean state
    // window.location.reload();
  }, [user]);

  // Don't render anything while checking or if not needed
  if (checking || !needsOnboarding) {
    return null;
  }

  return (
    <OneTimeOnboardingDialog
      open={needsOnboarding}
      onComplete={handleOnboardingComplete}
    />
  );
};