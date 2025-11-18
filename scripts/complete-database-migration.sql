-- Complete Database Migration for FounderSignal
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. UPDATE SIGNALS TABLE
-- ============================================

-- Add missing basic columns
ALTER TABLE signals ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS company_ids UUID[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS person_ids UUID[];

-- Add Product Hunt enrichment columns
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_votes_count INTEGER;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_comments_count INTEGER;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_topics TEXT[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_makers JSONB;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_tagline TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_redirect_url TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS ph_post_id TEXT;

-- Add user actions column if missing
ALTER TABLE signals ADD COLUMN IF NOT EXISTS user_actions JSONB DEFAULT '[]';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_signals_company_ids ON signals USING GIN(company_ids);
CREATE INDEX IF NOT EXISTS idx_signals_person_ids ON signals USING GIN(person_ids);
CREATE INDEX IF NOT EXISTS idx_signals_ph_post_id ON signals(ph_post_id);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);

-- Populate company_ids from existing company_id
UPDATE signals 
SET company_ids = ARRAY[company_id]::UUID[]
WHERE company_id IS NOT NULL 
  AND (company_ids IS NULL OR array_length(company_ids, 1) IS NULL);

-- ============================================
-- 2. UPDATE COMPANIES TABLE
-- ============================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- ============================================
-- 3. CREATE PEOPLE TABLE
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

-- Create indexes for people
CREATE INDEX IF NOT EXISTS idx_people_company_id ON people(company_id);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);
CREATE INDEX IF NOT EXISTS idx_people_created_at ON people(created_at DESC);

-- ============================================
-- 4. VERIFY SCHEMA
-- ============================================

-- Check signals table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'signals' 
ORDER BY ordinal_position;

-- Check companies table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;

-- Check people table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'people' 
ORDER BY ordinal_position;
