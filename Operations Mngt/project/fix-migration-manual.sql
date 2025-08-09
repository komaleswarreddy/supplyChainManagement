-- Manual migration fix for PostgreSQL
-- Run these commands in psql or pgAdmin

-- Connect to the database first:
-- psql -U postgres -d pls_scm

-- Fix the contracts table terms column conversion issue
BEGIN;

-- First, ensure any NULL or empty terms are set to valid JSON
UPDATE contracts 
SET terms = '{}' 
WHERE terms IS NULL OR terms = '';

-- Convert any text values to proper JSON format
UPDATE contracts 
SET terms = CASE 
  WHEN terms::text ~ '^[\s]*\{.*\}[\s]*$' THEN terms
  ELSE ('{"text": "' || replace(terms, '"', '\"') || '"}')::text
END
WHERE terms IS NOT NULL AND terms != '';

-- Now safely convert the column to jsonb
ALTER TABLE contracts 
ALTER COLUMN terms 
SET DATA TYPE jsonb 
USING terms::jsonb;

-- Ensure the column is NOT NULL as required
ALTER TABLE contracts 
ALTER COLUMN terms 
SET NOT NULL;

COMMIT;

-- Add password_hash column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'password_hash'
  ) THEN
    -- Add the column with a default value first
    ALTER TABLE users 
    ADD COLUMN password_hash text DEFAULT 'temp_hash_need_to_update';
    
    -- Then make it NOT NULL
    ALTER TABLE users 
    ALTER COLUMN password_hash SET NOT NULL;
    
    RAISE NOTICE 'Added password_hash column to users table';
  ELSE
    RAISE NOTICE 'password_hash column already exists';
  END IF;
END $$;

-- Clean up migration tracking to allow re-running
DELETE FROM __drizzle_migrations 
WHERE hash LIKE '%colossal_gunslinger%' 
OR hash LIKE '%daffy_power_man%';

-- Verify the changes
SELECT 'contracts.terms column type:' as info, data_type 
FROM information_schema.columns 
WHERE table_name = 'contracts' AND column_name = 'terms';

SELECT 'users.password_hash exists:' as info, 
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN 'YES' ELSE 'NO' END as exists;
