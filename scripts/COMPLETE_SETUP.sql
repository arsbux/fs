-- COMPLETE SETUP - Run this ONE script to fix everything
-- This combines removing restrictions + adding missing columns

-- ============================================
-- PART 1: REMOVE ALL RESTRICTIONS
-- ============================================

-- Disable Row Level Security
ALTER TABLE signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on signals
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'signals') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON signals';
    END LOOP;
END $$;

-- Drop all existing policies on companies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'companies') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON companies';
    END LOOP;
END $$;

-- Grant full access
GRANT ALL ON signals TO anon, authenticated;
GRANT ALL ON companies TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- PART 2: ADD MISSING COLUMNS
-- ============================================

-- Add Product Hunt columns to signals table
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

-- Add new columns to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- PART 3: CREATE PEOPLE TABLE
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

-- Disable RLS on people table
ALTER TABLE people DISABLE ROW LEVEL SECURITY;

-- Grant access to people table
GRANT ALL ON people TO anon, authenticated;

-- ============================================
-- PART 4: CREATE INDEXES
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
-- PART 5: VERIFY SETUP
-- ============================================

-- Check RLS is disabled
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '❌ ENABLED' ELSE '✅ DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('signals', 'companies', 'people')
ORDER BY tablename;

-- Check key columns exist
SELECT 
    'signals' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'signals' 
    AND column_name IN ('ph_comments_count', 'company_name', 'person_ids', 'company_ids')
UNION ALL
SELECT 
    'people' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'people';

-- Success message
SELECT '✅ COMPLETE SETUP FINISHED! You can now sync Product Hunt data.' as status;
