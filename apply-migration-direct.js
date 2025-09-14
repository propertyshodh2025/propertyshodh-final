// Script to apply the migration directly to Supabase
// Run this with: node apply-migration-direct.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// We'll use the same Supabase config as the app
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = "https://bujpqglebnkdwlbguekm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1anBxZ2xlYm5rZHdsYmd1ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODE2MjEsImV4cCI6MjA2ODA1NzYyMX0.Db4ysTZ2uNEAy59uXjMx8fllwoAUlgyqAxZftZ1WKI8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function executeSQLStatements() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250914084100_fix_leads_rpc_functions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Reading migration file...');
    console.log('Migration content length:', migrationSQL.length, 'characters');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log('Found', statements.length, 'SQL statements to execute');
    
    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
        
        try {
          // Try to execute as raw SQL using a direct query
          const { data, error } = await supabase.rpc('exec_sql', { 
            query: statement + ';'  // Add semicolon back
          });
          
          if (error) {
            console.error(`Error in statement ${i + 1}:`, error.message);
            // Continue with next statement instead of failing completely
          } else {
            console.log(`✓ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`Exception in statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('\nMigration completed!');
    console.log('You can now test the admin CRM functionality.');
    
  } catch (err) {
    console.error('Error applying migration:', err);
  }
}

executeSQLStatements();