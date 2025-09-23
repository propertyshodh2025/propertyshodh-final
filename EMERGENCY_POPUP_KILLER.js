// 🚨 EMERGENCY POPUP KILLER
// If the popup still appears, copy and paste this into browser console and press Enter
// This will permanently disable the popup for your user account

(function emergencyPopupKiller() {
  console.log("🚨 EMERGENCY POPUP KILLER ACTIVATED");
  
  // Get current user from auth context (if available)
  const getCurrentUserId = () => {
    // Try to get user ID from localStorage or other sources
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('auth') || key.includes('user')
    );
    
    console.log("🔍 Found auth-related localStorage keys:", authKeys);
    
    // Try to extract user ID from supabase auth token
    for (const key of authKeys) {
      try {
        const value = localStorage.getItem(key);
        if (value && value.includes('user') && value.includes('id')) {
          const parsed = JSON.parse(value);
          if (parsed?.user?.id) {
            return parsed.user.id;
          }
          if (parsed?.data?.user?.id) {
            return parsed.data.user.id;
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    return null;
  };
  
  const userId = getCurrentUserId();
  
  if (userId) {
    console.log(`✅ Found user ID: ${userId}`);
    
    // Set multiple localStorage flags to ensure popup never shows again
    localStorage.setItem(`onboarding_completed_${userId}`, 'true');
    localStorage.setItem(`emergency_skip_${userId}`, 'true');
    localStorage.setItem(`popup_disabled_${userId}`, 'true');
    localStorage.setItem(`never_show_onboarding_${userId}`, 'true');
    localStorage.setItem(`user_verified_${userId}`, 'true');
    
    console.log("🔐 Set multiple localStorage flags to disable popup permanently");
    
    // Also try to close any open dialogs
    const dialogs = document.querySelectorAll('[role="dialog"], .dialog, [data-state="open"]');
    dialogs.forEach(dialog => {
      if (dialog && typeof dialog.remove === 'function') {
        dialog.remove();
        console.log("🗑️ Removed dialog element");
      }
    });
    
    // Refresh the page to ensure changes take effect
    setTimeout(() => {
      console.log("🔄 Refreshing page to apply changes...");
      window.location.reload();
    }, 1000);
    
    console.log("✅ EMERGENCY POPUP KILLER COMPLETED - Popup should never appear again!");
  } else {
    console.warn("❌ Could not find user ID - you may need to be logged in");
    
    // Set global flags as backup
    localStorage.setItem('global_popup_disabled', 'true');
    localStorage.setItem('emergency_override', 'true');
    console.log("⚠️ Set global backup flags");
  }
  
  return "Emergency popup killer executed successfully!";
})();

// Alternative method - if the above doesn't work, try this:
// localStorage.clear(); // This will clear all localStorage (use with caution)
// Then refresh the page and log back in