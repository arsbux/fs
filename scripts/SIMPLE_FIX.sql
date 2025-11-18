-- Simple Database Fix - Run this in Supabase SQL Editor
-- This adds all missing columns needed for Product Hunt sync

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

-- Create people table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_signals_company_ids ON signals USING GIN(company_ids);
CREATE INDEX IF NOT EXISTS idx_signals_person_ids ON signals USING GIN(person_ids);
CREATE INDEX IF NOT EXISTS idx_signals_ph_post_id ON signals(ph_post_id);
CREATE INDEX IF NOT EXISTS idx_people_company_id ON people(company_id);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);

-- Done! You should see "Success. No rows returned"
