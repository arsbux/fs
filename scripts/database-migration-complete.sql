-- Complete database migration for Signal Profiles feature
-- Run this in your Supabase SQL editor

-- ============================================
-- STEP 1: Update signals table with all fields
-- ============================================

-- Add missing columns to signals table
ALTER TABLE signals ADD COLUMN IF NOT EXISTS company_ids UUID[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS person_ids UUID[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_votes_count INTEGER;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_comments_count INTEGER;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_topics TEXT[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_makers JSONB;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_tagline TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_redirect_url TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_post_id TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS hn_story_id TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS hn_score INTEGER;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS hn_comments INTEGER;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS hn_author TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS hn_discussion_url TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS hn_category TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- STEP 2: Update companies table with all fields
-- ============================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- STEP 3: Ensure people table exists with all fields
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

-- ============================================
-- STEP 4: Create indexes for performance
-- ============================================

-- Signal indexes
CREATE INDEX IF NOT EXISTS idx_signals_ph_post_id ON signals(ph_post_id);
CREATE INDEX IF NOT EXISTS idx_signals_hn_story_id ON signals(hn_story_id);
CREATE INDEX IF NOT EXISTS idx_signals_company_ids ON signals USING GIN(company_ids);
CREATE INDEX IF NOT EXISTS idx_signals_person_ids ON signals USING GIN(person_ids);
CREATE INDEX IF NOT EXISTS idx_signals_score ON signals(score DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);

-- Company indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- People indexes
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);
CREATE INDEX IF NOT EXISTS idx_people_company_id ON people(company_id);
CREATE INDEX IF NOT EXISTS idx_people_created_at ON people(created_at DESC);

-- ============================================
-- STEP 5: Disable RLS for development
-- ============================================

ALTER TABLE signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE people DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Grant permissions
-- ============================================

GRANT ALL ON signals TO anon, authenticated;
GRANT ALL ON companies TO anon, authenticated;
GRANT ALL ON people TO anon, authenticated;

-- ============================================
-- STEP 7: Verification
-- ============================================

-- Check signals table structure
SELECT 
    'signals' as table_name,
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'signals' 
ORDER BY ordinal_position;

-- Check companies table structure
SELECT 
    'companies' as table_name,
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;

-- Check people table structure
SELECT 
    'people' as table_name,
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'people' 
ORDER BY ordinal_position;

-- Success message
SELECT '✅ DATABASE MIGRATION COMPLETE! Signal profiles are ready.' as status;