import postgres from 'postgres';

async function fixDatabaseDirect() {
  console.log('🔧 Fixing Database Schema Issues...\n');

  // Try different connection configurations like the server does
  const configs = [
    { user: 'postgres', password: '', host: 'localhost', port: 5432, database: 'pls_scm' },
    { user: 'postgres', password: 'postgres', host: 'localhost', port: 5432, database: 'pls_scm' },
    { user: 'postgres', password: 'password', host: 'localhost', port: 5432, database: 'pls_scm' },
  ];

  for (const config of configs) {
    console.log(`Trying connection: postgres://${config.user}:${config.password ? '***' : 'empty'}@${config.host}:${config.port}/${config.database}`);
    
    try {
      const sql = postgres({
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.user,
        password: config.password,
        max: 1,
        connect_timeout: 5,
        idle_timeout: 5
      });

      // Test connection
      await sql`SELECT 1`;
      console.log('✅ Connection successful!');

      // Check if password_hash column exists
      const columnExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name = 'password_hash'
        )
      `;

      if (!columnExists[0].exists) {
        console.log('🔄 Adding password_hash column...');
        
        // Add password_hash column
        await sql`
          ALTER TABLE users 
          ADD COLUMN password_hash text
        `;
        
        // Set default values for existing users
        await sql`
          UPDATE users 
          SET password_hash = 'temp_hash_please_reset' 
          WHERE password_hash IS NULL
        `;
        
        // Make it NOT NULL
        await sql`
          ALTER TABLE users 
          ALTER COLUMN password_hash SET NOT NULL
        `;
        
        console.log('✅ Successfully added password_hash column');
      } else {
        console.log('✅ password_hash column already exists');
      }

      // Check contracts table and fix terms column if needed
      try {
        const contractsTableExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'contracts'
          )
        `;

        if (contractsTableExists[0].exists) {
          const termsColumnInfo = await sql`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'contracts' 
            AND column_name = 'terms'
          `;

          if (termsColumnInfo.length > 0 && termsColumnInfo[0].data_type === 'text') {
            console.log('🔄 Converting contracts.terms column to jsonb...');
            
            // Update NULL values
            await sql`
              UPDATE contracts 
              SET terms = '{}' 
              WHERE terms IS NULL OR terms = ''
            `;
            
            // Convert to jsonb
            await sql`
              ALTER TABLE contracts 
              ALTER COLUMN terms 
              SET DATA TYPE jsonb 
              USING COALESCE(terms::jsonb, '{}'::jsonb)
            `;
            
            console.log('✅ Successfully converted terms column');
          }
        }
      } catch (contractsError) {
        console.log('⚠️ Could not fix contracts table:', contractsError.message);
      }

      await sql.end();
      
      console.log('\n🎉 Database schema fixed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Restart the server: Ctrl+C then npm run server:dev');
      console.log('2. Test auth APIs: node test-auth.mjs');
      
      return true;

    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      continue;
    }
  }

  console.log('\n❌ All connection attempts failed');
  return false;
}

fixDatabaseDirect();
