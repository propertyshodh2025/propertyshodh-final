import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Read .env file manually
const envFile = fs.readFileSync('.env', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    let val = value.join('=').trim();
    // Remove quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
      val = val.slice(1, -1);
    }
    envVars[key.trim()] = val;
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Available env vars:', Object.keys(envVars));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserVerificationStatus() {
  try {
    console.log('🔍 Checking user verification status in database...\n');
    
    // First, check if we can access auth users (this might fail due to RLS)
    console.log('🔐 Checking auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.log('❌ Cannot access auth.users (expected - requires service role):', authError.message);
    } else {
      console.log(`👥 Found ${authUsers?.users?.length || 0} auth users`);
    }
    
    // Check table structure and permissions
    console.log('\n🗃️  Checking profiles table...');
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        email,
        phone_number,
        mobile_verified,
        terms_accepted,
        privacy_policy_accepted,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      console.log('This could indicate:');
      console.log('  1. RLS policies preventing access');
      console.log('  2. Table does not exist');
      console.log('  3. Columns missing from table');
      return;
    }

    console.log(`📊 Found ${profiles?.length || 0} user profiles:\n`);

    if (!profiles || profiles.length === 0) {
      console.log('❌ No profiles found in the database');
      console.log('This means either:');
      console.log('  1. No users have signed up yet');
      console.log('  2. Profiles are not being created automatically');
      console.log('  3. RLS policies are blocking access');
      
      // Try to check if the table exists at all
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.log('🚨 Table access test failed:', countError.message);
      } else {
        console.log(`📋 Table exists and has ${count || 0} total rows`);
      }
      return;
    }

    profiles.forEach((profile, index) => {
      const isFullyVerified = profile.mobile_verified && 
                             profile.phone_number && 
                             profile.terms_accepted && 
                             profile.privacy_policy_accepted;
      
      console.log(`${index + 1}. User ID: ${profile.user_id}`);
      console.log(`   📧 Email: ${profile.email || 'N/A'}`);
      console.log(`   📱 Phone: ${profile.phone_number || 'N/A'}`);
      console.log(`   ✅ Mobile Verified: ${profile.mobile_verified ? 'YES' : 'NO'}`);
      console.log(`   📄 Terms Accepted: ${profile.terms_accepted ? 'YES' : 'NO'}`);
      console.log(`   🔒 Privacy Accepted: ${profile.privacy_policy_accepted ? 'YES' : 'NO'}`);
      console.log(`   🎯 FULLY VERIFIED: ${isFullyVerified ? '✅ YES' : '❌ NO'}`);
      console.log(`   📅 Created: ${new Date(profile.created_at).toLocaleString()}`);
      console.log(`   🔄 Updated: ${new Date(profile.updated_at).toLocaleString()}`);
      console.log('   ' + '─'.repeat(50));
    });

    // Summary
    const fullyVerified = profiles.filter(p => 
      p.mobile_verified && p.phone_number && p.terms_accepted && p.privacy_policy_accepted
    );
    const hasPhone = profiles.filter(p => p.phone_number);
    const mobileVerified = profiles.filter(p => p.mobile_verified);
    
    console.log('\n📊 SUMMARY:');
    console.log(`   Total Profiles: ${profiles.length}`);
    console.log(`   Has Phone Number: ${hasPhone.length}`);
    console.log(`   Mobile Verified: ${mobileVerified.length}`);
    console.log(`   Fully Verified: ${fullyVerified.length}`);
    
    if (fullyVerified.length < profiles.length) {
      console.log('\n⚠️  Users who should NOT see verification dialog:');
      fullyVerified.forEach(user => {
        console.log(`   ✅ ${user.user_id} (${user.email || 'No email'})`);
      });
      
      const needsVerification = profiles.filter(p => !fullyVerified.includes(p));
      console.log('\n🚨 Users who SHOULD see verification dialog:');
      needsVerification.forEach(user => {
        console.log(`   ❌ ${user.user_id} (${user.email || 'No email'})`);
      });
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the check
checkUserVerificationStatus();