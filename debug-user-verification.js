import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserVerificationStatus() {
  try {
    console.log('🔍 Checking user verification status in database...\n');
    
    // Get all profiles with verification data
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
      .limit(20);

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return;
    }

    console.log(`📊 Found ${profiles?.length || 0} user profiles:\n`);

    profiles?.forEach((profile, index) => {
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

    // Check for users who should be verified but aren't marked as such
    const shouldBeVerified = profiles?.filter(p => 
      p.phone_number && p.mobile_verified === false
    );
    
    if (shouldBeVerified && shouldBeVerified.length > 0) {
      console.log(`\n⚠️  Found ${shouldBeVerified.length} users who have phone numbers but are not marked as verified:`);
      shouldBeVerified.forEach(user => {
        console.log(`   - User ${user.user_id}: ${user.phone_number}`);
      });
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the check
checkUserVerificationStatus();