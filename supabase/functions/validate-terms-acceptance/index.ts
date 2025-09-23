import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, user_id } = await req.json()
    
    // Get the current user from the JWT token
    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Security: Ensure user can only check their own terms acceptance status
    if (user.id !== user_id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - can only check own terms acceptance' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      )
    }

    // Fetch user profile with terms acceptance status
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('mobile_verified, phone_number, terms_accepted, privacy_policy_accepted, terms_accepted_at, privacy_policy_accepted_at, onboarding_completed')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // If user has completed onboarding, they are always considered fully verified
    const isFullyVerified = Boolean(profile.onboarding_completed) || 
                           (Boolean(profile.mobile_verified) && 
                            Boolean(profile.phone_number) &&
                            Boolean(profile.terms_accepted) && 
                            Boolean(profile.privacy_policy_accepted))

    if (action === 'validate') {
      return new Response(
        JSON.stringify({
          success: true,
          verified: isFullyVerified,
          details: {
            mobile_verified: Boolean(profile.mobile_verified),
            phone_number_provided: Boolean(profile.phone_number),
            terms_accepted: Boolean(profile.terms_accepted),
            privacy_policy_accepted: Boolean(profile.privacy_policy_accepted),
            onboarding_completed: Boolean(profile.onboarding_completed),
            terms_accepted_at: profile.terms_accepted_at,
            privacy_policy_accepted_at: profile.privacy_policy_accepted_at
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'enforce') {
      // This endpoint can be used by protected routes to enforce terms acceptance
      if (!isFullyVerified) {
        return new Response(
          JSON.stringify({ 
            error: 'Terms acceptance and mobile verification required',
            redirect_to_verification: true,
            missing_requirements: {
              mobile_verification: !Boolean(profile.mobile_verified) || !Boolean(profile.phone_number),
              terms_acceptance: !Boolean(profile.terms_accepted),
              privacy_policy_acceptance: !Boolean(profile.privacy_policy_accepted),
              onboarding_completed: !Boolean(profile.onboarding_completed)
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, verified: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "validate" or "enforce"' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Error in validate-terms-acceptance function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})