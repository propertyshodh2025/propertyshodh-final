import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOTP(otp: string, phone: string): Promise<string> {
  const pepper = Deno.env.get("OTP_PEPPER") || "default_pepper_change_me";
  const encoder = new TextEncoder();
  const data = encoder.encode(`${pepper}:${phone}:${otp}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sendSMSvisFast2SMS(phone: string, otp: string): Promise<boolean> {
  const apiKey = Deno.env.get("FAST2SMS_API_KEY");
  
  if (!apiKey) {
    console.log("⚠️ Fast2SMS API key not configured, using development mode");
    return true; // Return true for development
  }

  try {
    const url = new URL("https://www.fast2sms.com/dev/bulkV2");
    url.searchParams.set("authorization", apiKey);
    url.searchParams.set("route", "otp");
    url.searchParams.set("variables_values", otp);
    url.searchParams.set("flash", "0");
    url.searchParams.set("numbers", phone);
    url.searchParams.set("schedule_time", ""); // Add the missing schedule_time parameter

    console.log(`📱 Sending OTP ${otp} to ${phone}`);
    console.log(`🔗 Fast2SMS URL: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      }
    });

    console.log(`📡 Fast2SMS Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`Fast2SMS API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      return false;
    }

    const result = await response.json();
    console.log("📋 Fast2SMS response:", JSON.stringify(result, null, 2));
    
    // Check if the SMS was sent successfully
    if (result.return === true || result.return === "true") {
      console.log("✅ SMS sent successfully via Fast2SMS");
      return true;
    } else {
      console.error("❌ Fast2SMS indicated failure:", result);
      return false;
    }
  } catch (error) {
    console.error("💥 Fast2SMS error:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== OTP SEND REQUEST STARTED ===");
    
    const { phone, purpose = "verify_mobile" } = await req.json();
    console.log(`📞 Phone: ${phone}, Purpose: ${purpose}`);

    if (!phone || !/^\d{10}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number. Must be 10 digits." }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(`🔢 Generated OTP: ${otp}`);

    // Hash OTP for storage
    const otpHash = await hashOTP(otp, phone);
    console.log("🔐 OTP hashed successfully");

    // Store in database
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    const { error: dbError } = await supabase
      .from("phone_otps")
      .insert({
        phone,
        purpose,
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || "unknown"
      });

    if (dbError) {
      console.error("💾 Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store OTP" }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("💾 OTP stored in database");

    // Send SMS
    const smsSent = await sendSMSvisFast2SMS(phone, otp);
    
    if (smsSent) {
      console.log("✅ SMS sent successfully");
      console.log("=== OTP SEND REQUEST COMPLETED SUCCESSFULLY ===");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP sent successfully",
          // Include OTP in response for development mode
          ...(Deno.env.get("FAST2SMS_API_KEY") ? {} : { dev_otp: otp })
        }), 
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      console.error("❌ SMS sending failed");
      console.log("=== OTP SEND REQUEST FAILED ===");
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Failed to send SMS",
          message: "Could not deliver OTP to your phone number. Please check your phone number and try again."
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

  } catch (error) {
    console.error("=== FATAL ERROR ===");
    console.error("Error:", error);
    console.error("Stack:", error.stack);

    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});