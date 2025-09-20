import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toHex(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashOTP(otp: string, phone: string, pepper: string) {
  const data = new TextEncoder().encode(`${pepper}:${phone}:${otp}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, purpose = "verify_mobile" } = await req.json();
    console.log(`🚀 [VERIFY-OTP] Starting verification - Phone: ${phone}, Purpose: ${purpose}`);
    if (!/^[0-9]{10}$/.test(phone) || !/^[0-9]{6}$/.test(otp)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const OTP_PEPPER = Deno.env.get("OTP_PEPPER") || "default_pepper_change_me";

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return new Response(JSON.stringify({ error: "Missing server configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const hash = await hashOTP(otp, phone, OTP_PEPPER);

    const { data: rows, error } = await supabase
      .from("phone_otps")
      .select("id, expires_at, consumed")
      .eq("phone", phone)
      .eq("otp_hash", hash)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Lookup error:", error);
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const row = rows?.[0];
    if (!row) {
      // Increment attempts on latest entry for phone
      await supabase
        .from("phone_otps")
        .update({ attempts: (1) })
        .eq("phone", phone)
        .order("created_at", { ascending: false })
        .limit(1);

      return new Response(JSON.stringify({ verified: false, message: "Invalid OTP" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (row.consumed) {
      return new Response(JSON.stringify({ verified: false, message: "OTP already used" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new Date(row.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ verified: false, message: "OTP expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark consumed
    await supabase.from("phone_otps").update({ consumed: true }).eq("id", row.id);

    // If user JWT present, update profile
    const authHeader = req.headers.get("Authorization");
    const jwt = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (jwt) {
      const userClient = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data: userData } = await userClient.auth.getUser(jwt);
      const uid = userData?.user?.id;
      const userEmail = userData?.user?.email;
      if (uid) {
        console.log(`📝 [VERIFY-OTP] Creating/updating profile for user: ${uid} (${userEmail}) with phone: +91${phone}`);
        console.log(`📝 [VERIFY-OTP] Purpose: ${purpose}`);
        
        // For onboarding purpose, complete all requirements in one go
        if (purpose === 'onboarding') {
          console.log(`✅ [ONBOARDING] Completing full onboarding for user: ${uid}`);
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert(
              {
                user_id: uid,
                email: userEmail,
                phone_number: `+91${phone}`,
                mobile_verified: true,
                terms_accepted: true,
                privacy_policy_accepted: true,
                terms_accepted_at: new Date().toISOString(),
                privacy_policy_accepted_at: new Date().toISOString(),
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
            
          if (profileError) {
            console.error("❌ [ONBOARDING] Error completing onboarding:", profileError);
          } else {
            console.log("🎉 [ONBOARDING] Full onboarding completed successfully!");
          }
        } else {
          // Legacy verify_mobile purpose - only verify mobile
          console.log(`📱 [MOBILE-ONLY] Updating mobile verification for user: ${uid}`);
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert(
              {
                user_id: uid,
                email: userEmail,
                phone_number: `+91${phone}`,
                mobile_verified: true,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
            
          if (profileError) {
            console.error("❌ [MOBILE-ONLY] Error updating mobile verification:", profileError);
          } else {
            console.log("✅ [MOBILE-ONLY] Mobile verification updated successfully");
          }
        }
      } else {
        console.warn("⚠️ [VERIFY-OTP] No user ID found in JWT - profile will not be updated");
      }
    } else {
      console.warn("⚠️ [VERIFY-OTP] No JWT token found - profile will not be updated");
    }

    return new Response(JSON.stringify({ verified: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-otp error:", e);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
