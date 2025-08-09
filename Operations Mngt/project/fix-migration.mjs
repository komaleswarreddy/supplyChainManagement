import postgres from 'postgres';

async function fixMigrationIssues() {
  console.log('🔧 Fixing Migration Issues...\n');

  const connectionString = 'postgres://postgres:postgres@localhost:5432/pls_scm';
  
  try {
    const sql = postgres(connectionString, {
      max: 1,
      connect_timeout: 10,
      idle_timeout: 5
    });

    console.log('✅ Connected to database');

    // Check if contracts table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contracts'
      )
    `;

    if (!tableExists[0].exists) {
      console.log('❌ Contracts table does not exist. Need to run initial migrations.');
      await sql.end();
      return;
    }

    console.log('✅ Contracts table exists');

    // Check current data type of terms column
    const columnInfo = await sql`
      SELECT data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'contracts' 
      AND column_name = 'terms'
    `;

    if (columnInfo.length === 0) {
      console.log('❌ Terms column does not exist');
      await sql.end();
      return;
    }

    console.log(`📊 Current terms column type: ${columnInfo[0].data_type}`);

    if (columnInfo[0].data_type === 'text') {
      console.log('🔄 Converting terms column from text to jsonb...');
      
      // First, update any NULL values to valid JSON
      await sql`
        UPDATE contracts 
        SET terms = '{}' 
        WHERE terms IS NULL OR terms = ''
      `;
      
      // Convert text values to proper JSON format if they're not already
      await sql`
        UPDATE contracts 
        SET terms = CASE 
          WHEN terms::text ~ '^[\s]*\{.*\}[\s]*$' THEN terms
          ELSE ('{"text": "' || replace(terms, '"', '\\"') || '"}')::text
        END
        WHERE terms IS NOT NULL
      `;
      
      // Now safely convert to jsonb
      await sql`
        ALTER TABLE contracts 
        ALTER COLUMN terms 
        SET DATA TYPE jsonb 
        USING terms::jsonb
      `;
      
      console.log('✅ Successfully converted terms column to jsonb');
    } else if (columnInfo[0].data_type === 'jsonb') {
      console.log('✅ Terms column is already jsonb');
    }

    // Check if password_hash column exists in users table
    const passwordHashExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password_hash'
      )
    `;

    if (!passwordHashExists[0].exists) {
      console.log('🔄 Adding password_hash column to users table...');
      
      // Add password_hash column with a default value first
      await sql`
        ALTER TABLE users 
        ADD COLUMN password_hash text DEFAULT 'temp_hash'
      `;
      
      // Then make it NOT NULL
      await sql`
        ALTER TABLE users 
        ALTER COLUMN password_hash SET NOT NULL
      `;
      
      console.log('✅ Successfully added password_hash column');
    } else {
      console.log('✅ password_hash column already exists');
    }

    // Clear the migration tracking table to allow re-running migrations
    console.log('🔄 Clearing migration tracking...');
    
    try {
      // Get the latest migration that was successfully applied
      const appliedMigrations = await sql`
        SELECT * FROM __drizzle_migrations 
        ORDER BY id DESC
      `;
      
      console.log(`📊 Found ${appliedMigrations.length} applied migrations`);
      
      // Remove the problematic migration entries
      await sql`
        DELETE FROM __drizzle_migrations 
        WHERE hash LIKE '%colossal_gunslinger%' 
        OR hash LIKE '%daffy_power_man%'
      `;
      
      console.log('✅ Cleared problematic migration entries');
      
    } catch (error) {
      console.log('⚠️ Could not clear migration tracking:', error.message);
    }

    await sql.end();
    console.log('\n🎉 Migration issues fixed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run db:migrate');
    console.log('2. Start server: npm run server:dev');
    console.log('3. Test auth APIs: node test-auth.mjs');

  } catch (error) {
    console.error('❌ Error fixing migrations:', error);
    console.log('\n🔧 Manual fix required:');
    console.log('1. Connect to PostgreSQL: psql -U postgres -d pls_scm');
    console.log('2. Run: ALTER TABLE contracts ALTER COLUMN terms SET DATA TYPE jsonb USING terms::jsonb;');
    console.log('3. Run: ALTER TABLE users ADD COLUMN password_hash text NOT NULL DEFAULT \'temp_hash\';');
  }
}

fixMigrationIssues();
