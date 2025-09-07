import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, full_name } = await req.json();

    if (!user_id || !email) {
      return new Response(JSON.stringify({ error: 'User ID and email are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking existing profile:', fetchError);
      throw fetchError;
    }

    if (existingProfile) {
      return new Response(JSON.stringify({ message: 'Profile already exists' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Insert new profile using service role key to bypass RLS
    const { data, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: user_id,
        email: email,
        full_name: full_name || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting new profile:', insertError);
      throw insertError;
    }

    return new Response(JSON.stringify({ message: 'Profile created successfully', profile: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });

  } catch (error) {
    console.error('Edge Function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});