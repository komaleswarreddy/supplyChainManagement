 Final Solution: Database Connection & Auth APIs

## Current Status Analysis
✅ **Server is running and connecting to PostgreSQL**
✅ **Database connection works (server logs show success)**
❌ **Migration error with `terms` column conversion**
❌ **Missing `password_hash` column causing auth API failures**

## The Issue
The server can connect to PostgreSQL, but:
1. Migration fails due to `terms` column type conversion
2. `password_hash` column is missing from users table
3. Auth APIs return 500 errors

## Solution Steps

### Step 1: Fix Database Schema Using pgAdmin or SQL Client

Since command-line access is having authentication issues, use a GUI tool:

1. **Open pgAdmin** (if installed) or download **DBeaver** (free universal database client)
2. **Connect to PostgreSQL**:
   - Host: localhost
   - Port: 5432
   - Database: pls_scm
   - User: postgres
   - Password: (try empty, "postgres", "password", or "admin")

3. **Run this SQL to fix the schema**:
```sql
-- Fix the contracts table terms column
BEGIN;

-- Handle existing data
UPDATE contracts 
SET terms = '{}' 
WHERE terms IS NULL OR terms = '';

-- Convert text values to JSON if needed
UPDATE contracts 
SET terms = CASE 
  WHEN terms ~ '^[\s]*\{.*\}[\s]*$' THEN terms
  ELSE '{"value": "' || replace(terms, '"', '\\"') || '"}'
END
WHERE terms IS NOT NULL;

-- Convert column to jsonb
ALTER TABLE contracts 
ALTER COLUMN terms 
SET DATA TYPE jsonb 
USING terms::jsonb;

COMMIT;

-- Add password_hash column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash text DEFAULT 'temp_hash';

-- Make it NOT NULL
UPDATE users SET password_hash = 'temp_hash_reset_required' WHERE password_hash IS NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- Verify changes
SELECT 'Fixed!' as status;
```

### Step 2: Alternative - Restart with Fresh Database

If the above doesn't work, create a fresh database:

```sql
-- In pgAdmin or psql, run:
DROP DATABASE IF EXISTS pls_scm;
CREATE DATABASE pls_scm;
```

Then restart the server to run migrations fresh.

### Step 3: Test After Database Fix

1. **Restart the server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run server:dev
   ```

2. **Test authentication APIs**:
   ```bash
   node test-auth.mjs
   ```

### Step 4: If Still Having Issues

If you can't access PostgreSQL with GUI tools either, you might need to:

1. **Reset PostgreSQL password**:
   - Stop PostgreSQL service
   - Edit `pg_hba.conf` to use `trust` authentication
   - Restart service
   - Connect and set password
   - Revert `pg_hba.conf` to `md5`

2. **Or use alternative authentication**:
   - The server might be using Windows authentication
   - Check if there's a specific user/password for your PostgreSQL installation

## Quick Test Commands

```bash
# Test if server is responding
curl http://localhost:3000/api/auth/me

# Test registration (should fail with specific error)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

## Expected Results After Fix

1. ✅ Server starts without migration errors
2. ✅ Registration API works: `POST /api/auth/register`
3. ✅ Login API works: `POST /api/auth/login`
4. ✅ Protected routes work: `GET /api/auth/me`

## Tools You Can Use

1. **pgAdmin** - PostgreSQL GUI (if installed with PostgreSQL)
2. **DBeaver** - Universal database client (free download)
3. **Azure Data Studio** - Microsoft's database client
4. **Command line** - `psql` (if you can figure out the password)

## The Root Cause

The server is connecting successfully, which means:
- PostgreSQL is running ✅
- Database exists ✅  
- Connection credentials work ✅
- Only schema issues remain ❌

Once you fix the schema with SQL commands above, everything should work perfectly!

---

**Next Action**: Use pgAdmin or DBeaver to run the SQL commands, then test the APIs.
