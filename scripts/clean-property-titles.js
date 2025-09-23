#!/usr/bin/env node

/**
 * Property Title Cleanup Script
 * 
 * This script validates and cleans property titles that inappropriately contain BHK
 * for commercial, agricultural, or industrial properties.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Property type validation logic (matches the client-side utility)
const RESIDENTIAL_PROPERTY_TYPES_WITH_BHK = [
  'flat', 'apartment', 'house', 'bungalow', 'villa', 'duplex', 'penthouse', 'studio'
];

const NON_BHK_PROPERTY_TYPES = [
  // Commercial
  'office', 'shop', 'showroom', 'warehouse', 'building', 'retail_space', 'commercial_space',
  'godown', 'factory', 'manufacturing', 'industrial_plot', 'commercial_plot',
  // Agricultural/Land
  'farmland', 'orchard', 'plantation', 'agricultural_land', 'farm', 'land', 'plot',
  // Other
  'parking', 'garage', 'commercial'
];

const PROPERTY_CATEGORIES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  AGRICULTURAL: 'agricultural',
  INDUSTRIAL: 'industrial'
};

function shouldPropertyHaveBHK(propertyType, propertyCategory) {
  if (!propertyType) return false;
  
  const normalizedType = propertyType.toLowerCase().trim();
  
  // Check category first (most reliable)
  if (propertyCategory) {
    const normalizedCategory = propertyCategory.toLowerCase().trim();
    
    // AGRICULTURAL and COMMERCIAL properties should NEVER have BHK
    if (normalizedCategory === 'agricultural' || normalizedCategory === 'commercial') {
      return false;
    }
    
    // All other categories can have BHK
    return true;
  }
  
  // Fallback: If no category, check property type
  // Agricultural and Commercial property types
  if (['farmland', 'orchard', 'plantation', 'agricultural_land', 'farm',
       'office', 'shop', 'showroom', 'warehouse', 'building', 'retail_space', 'commercial_space', 'godown'].includes(normalizedType)) {
    return false;
  }
  
  // Everything else can have BHK
  return true;
}

function cleanPropertyTitle(title, propertyType, propertyCategory) {
  if (!title || !title.trim()) return title;
  
  const shouldIncludeBHK = shouldPropertyHaveBHK(propertyType, propertyCategory);
  const containsBHK = /\d+\s*BHK/i.test(title);
  
  if (containsBHK && !shouldIncludeBHK) {
    const cleanedTitle = title.replace(/\d+\s*BHK\s*/gi, '').trim();
    return cleanedTitle || title; // Return original if cleaned title is empty
  }
  
  return title;
}

async function validatePropertyTitles() {
  console.log('🔍 Fetching all properties...');
  
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, title, property_type, property_category')
    .not('title', 'is', null);
  
  if (error) {
    console.error('❌ Error fetching properties:', error);
    return;
  }
  
  console.log(`📊 Found ${properties.length} properties to validate`);
  
  const issuesFound = [];
  const cleanupCandidates = [];
  
  for (const property of properties) {
    const { title, property_type, property_category } = property;
    const shouldIncludeBHK = shouldPropertyHaveBHK(property_type, property_category);
    const containsBHK = /\d+\s*BHK/i.test(title);
    
    if (containsBHK && !shouldIncludeBHK) {
      const cleanedTitle = cleanPropertyTitle(title, property_type, property_category);
      
      const issue = {
        id: property.id,
        originalTitle: title,
        cleanedTitle: cleanedTitle,
        propertyType: property_type,
        propertyCategory: property_category,
        issue: `BHK inappropriately mentioned in ${property_category || 'unknown category'} property`
      };
      
      issuesFound.push(issue);
      
      if (cleanedTitle !== title) {
        cleanupCandidates.push({
          id: property.id,
          originalTitle: title,
          cleanedTitle: cleanedTitle,
          propertyType: property_type,
          propertyCategory: property_category
        });
      }
    }
  }
  
  console.log(`\n📋 Validation Results:`);
  console.log(`   ✅ Valid properties: ${properties.length - issuesFound.length}`);
  console.log(`   ⚠️  Properties with issues: ${issuesFound.length}`);
  console.log(`   🔧 Properties that can be cleaned: ${cleanupCandidates.length}`);
  
  if (issuesFound.length > 0) {
    console.log(`\n🔍 Issues Found:`);
    issuesFound.slice(0, 10).forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue.originalTitle}`);
      console.log(`      Type: ${issue.propertyType} (${issue.propertyCategory || 'no category'})`);
      console.log(`      Issue: ${issue.issue}`);
      console.log(`      Suggested: ${issue.cleanedTitle}`);
      console.log('');
    });
    
    if (issuesFound.length > 10) {
      console.log(`   ... and ${issuesFound.length - 10} more properties with issues`);
    }
  }
  
  return { issuesFound, cleanupCandidates };
}

async function cleanupPropertyTitles(cleanupCandidates, dryRun = true) {
  if (cleanupCandidates.length === 0) {
    console.log('✅ No properties need title cleanup');
    return;
  }
  
  console.log(`\n🔧 ${dryRun ? 'DRY RUN: Would clean' : 'Cleaning'} ${cleanupCandidates.length} property titles...`);
  
  if (!dryRun) {
    // Create backup records first
    const backupRecords = cleanupCandidates.map(candidate => ({
      id: candidate.id,
      original_title: candidate.originalTitle,
      cleaned_title: candidate.cleanedTitle,
      property_type: candidate.propertyType,
      property_category: candidate.propertyCategory,
      cleanup_reason: 'Script cleanup - removed inappropriate BHK from title'
    }));
    
    const { error: backupError } = await supabase
      .from('property_title_cleanup_backup')
      .upsert(backupRecords);
    
    if (backupError) {
      console.error('❌ Error creating backup records:', backupError);
      return;
    }
    
    console.log('💾 Backup records created');
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const candidate of cleanupCandidates) {
    if (dryRun) {
      console.log(`   📝 Would update: "${candidate.originalTitle}" → "${candidate.cleanedTitle}"`);
      successCount++;
    } else {
      try {
        const { error } = await supabase
          .from('properties')
          .update({ 
            title: candidate.cleanedTitle,
            updated_at: new Date().toISOString()
          })
          .eq('id', candidate.id);
        
        if (error) {
          console.error(`❌ Error updating property ${candidate.id}:`, error);
          errorCount++;
        } else {
          console.log(`✅ Updated: "${candidate.originalTitle}" → "${candidate.cleanedTitle}"`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error updating property ${candidate.id}:`, err);
        errorCount++;
      }
    }
  }
  
  console.log(`\n📊 ${dryRun ? 'Dry Run' : 'Cleanup'} Summary:`);
  console.log(`   ✅ ${dryRun ? 'Would be updated' : 'Successfully updated'}: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const shouldCleanup = args.includes('--cleanup');
  const dryRun = !args.includes('--apply');
  
  console.log('🏠 Property Title Validation and Cleanup Script');
  console.log('===============================================\n');
  
  if (shouldCleanup && dryRun) {
    console.log('ℹ️  Running in DRY RUN mode. Use --apply to actually update the database.');
  } else if (shouldCleanup && !dryRun) {
    console.log('⚠️  LIVE MODE: This will actually update the database!');
  }
  
  try {
    const { issuesFound, cleanupCandidates } = await validatePropertyTitles();
    
    if (shouldCleanup && cleanupCandidates.length > 0) {
      console.log('\n' + '='.repeat(50));
      await cleanupPropertyTitles(cleanupCandidates, dryRun);
    } else if (shouldCleanup) {
      console.log('\n✅ All property titles are valid!');
    } else {
      console.log('\n💡 To clean up the found issues, run:');
      console.log('   node scripts/clean-property-titles.js --cleanup         (dry run)');
      console.log('   node scripts/clean-property-titles.js --cleanup --apply (live update)');
    }
  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  shouldPropertyHaveBHK,
  cleanPropertyTitle,
  validatePropertyTitles,
  cleanupPropertyTitles
};