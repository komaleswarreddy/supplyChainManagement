import postgres from 'postgres';

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  // Default connection parameters
  const dbConfigs = [
    {
      name: 'Default PostgreSQL',
      connectionString: 'postgres://postgres:postgres@localhost:5432/pls_scm'
    },
    {
      name: 'Alternative PostgreSQL',
      connectionString: 'postgres://postgres:password@localhost:5432/pls_scm'
    },
    {
      name: 'PostgreSQL with empty password',
      connectionString: 'postgres://postgres:@localhost:5432/pls_scm'
    }
  ];

  for (const config of dbConfigs) {
    console.log(`Testing ${config.name}...`);
    
    try {
      const sql = postgres(config.connectionString, {
        max: 1,
        connect_timeout: 5,
        idle_timeout: 5
      });

      // Test connection
      await sql`SELECT 1 as test`;
      console.log('✅ Connection successful!');
      
      // Test if database exists
      const dbResult = await sql`SELECT current_database()`;
      console.log(`📊 Connected to database: ${dbResult[0].current_database}`);
      
      // Test if users table exists
      try {
        const tableResult = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          )
        `;
        
        if (tableResult[0].exists) {
          console.log('✅ Users table exists');
          
          // Check if password_hash column exists
          const columnResult = await sql`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'users' 
              AND column_name = 'password_hash'
            )
          `;
          
          if (columnResult[0].exists) {
            console.log('✅ password_hash column exists');
          } else {
            console.log('❌ password_hash column missing - need to run migrations');
          }
        } else {
          console.log('❌ Users table does not exist - need to run migrations');
        }
      } catch (tableError) {
        console.log('⚠️ Could not check table structure:', tableError.message);
      }

      await sql.end();
      console.log('🎉 Database connection test completed successfully!\n');
      return true;

    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}\n`);
      continue;
    }
  }

  console.log('❌ All connection attempts failed. Please check:');
  console.log('1. PostgreSQL is installed and running');
  console.log('2. Database "pls_scm" exists');
  console.log('3. User "postgres" has access');
  console.log('4. Password is correct\n');
  
  console.log('To create the database, run:');
  console.log('psql -U postgres -c "CREATE DATABASE pls_scm;"');
  
  return false;
}

testDatabaseConnection();
