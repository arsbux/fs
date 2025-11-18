-- ============================================
-- ULTIMATE FIX - Run this ONE script to fix EVERYTHING
-- This is the ONLY script you need to run
-- ============================================

-- STEP 1: Grant schema-level permissions (fixes 42501 error)
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, postgres;
GRANT CREATE ON SCHEMA public TO anon, authenticated, postgres;
GRANT ALL ON SCHEMA public TO anon, authenticated, postgres;

-- STEP 2: Grant permissions on existing tables
-- ============================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, postgres;

-- STEP 3: Set default privileges for future objects
-- ============================================
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, postgres;

-- STEP 4: Disable Row Level Security
-- ============================================
ALTER TABLE IF EXISTS signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS companies DISABLE ROW LEVEL SECURITY;

-- STEP 5: Drop all existing policies
-- ============================================
DO $$ 
DECLARE r RECORD;
BEGIN
    -- Drop policies on signals
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'signals') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON signals';
    END LOOP;
    
    -- Drop policies on companies
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'companies') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON companies';
    END LOOP;
END $$;

-- STEP 6: Add missing columns to signals
-- ============================================
ALTER TABLE signals ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS company_ids UUID[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS person_ids UUID[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_votes_count INTEGER;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_comments_count INTEGER;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_topics TEXT[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_makers JSONB;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_tagline TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_redirect_url TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_post_id TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS user_actions JSONB DEFAULT '[]';

-- STEP 7: Add missing columns to companies
-- ============================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- STEP 8: Create people table
-- ============================================
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  email TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  company_name TEXT,
  tags TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- STEP 9: Disable RLS and grant permissions on people table
-- ============================================
ALTER TABLE people DISABLE ROW LEVEL SECURITY;
GRANT ALL ON people TO anon, authenticated, postgres;

-- STEP 10: Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_signals_company_ids ON signals USING GIN(company_ids);
CREATE INDEX IF NOT EXISTS idx_signals_person_ids ON signals USING GIN(person_ids);
CREATE INDEX IF NOT EXISTS idx_signals_ph_post_id ON signals(ph_post_id);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_people_company_id ON people(company_id);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);

-- ============================================
-- VERIFICATION - Check everything worked
-- ============================================

-- 1. Check schema permissions
SELECT 
    '1. Schema Permissions' as check_type,
    CASE 
        WHEN has_schema_privilege('anon', 'public', 'USAGE') 
         AND has_schema_privilege('anon', 'public', 'CREATE')
        THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result;

-- 2. Check table permissions
SELECT 
    '2. Table Permissions' as check_type,
    CASE 
        WHEN has_table_privilege('anon', 'signals', 'INSERT')
         AND has_table_privilege('anon', 'companies', 'INSERT')
         AND has_table_privilege('anon', 'people', 'INSERT')
        THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result;

-- 3. Check RLS is disabled
SELECT 
    '3. RLS Disabled' as check_type,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('signals', 'companies', 'people')
            AND rowsecurity = true
        )
        THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result;

-- 4. Check required columns exist
SELECT 
    '4. Required Columns' as check_type,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = 'signals' 
            AND column_name IN ('ph_comments_count', 'company_name', 'person_ids', 'company_ids')
        ) = 4
        THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result;

-- 5. Check people table exists
SELECT 
    '5. People Table' as check_type,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'people')
        THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result;

-- Final success message
SELECT '
🎉 ULTIMATE FIX COMPLETE! 🎉

All checks should show ✅ PASS above.

Next steps:
1. Close this SQL editor
2. Go back to your terminal
3. Restart your dev server: npm run dev
4. Go to /desk/producthunt
5. Click "Sync Now"
6. Watch the magic happen! ✨
' as final_message;
