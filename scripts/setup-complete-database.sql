-- Complete database setup for FounderSignal
-- Run this script in your Supabase SQL editor to set up all tables

-- ============================================
-- STEP 1: Create companies table
-- ============================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  industry TEXT,
  location TEXT,
  founded_year INTEGER,
  employee_count TEXT,
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for companies
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_tags ON companies USING GIN(tags);

-- ============================================
-- STEP 2: Create people table
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
CREATE INDEX IF NOT EXISTS idx_people_tags ON people USING GIN(tags);

-- ============================================
-- STEP 3: Create signals table
-- ============================================

CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_link TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  credibility TEXT NOT NULL CHECK (credibility IN ('low', 'medium', 'high')),
  signal_type TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  company_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Related entities
  company_ids UUID[] DEFAULT '{}',
  person_ids UUID[] DEFAULT '{}',
  
  -- Product Hunt enrichment fields
  ph_votes_count INTEGER,
  ph_comments_count INTEGER,
  ph_topics TEXT[],
  ph_makers JSONB,
  ph_tagline TEXT,
  ph_redirect_url TEXT,
  ph_post_id TEXT,
  
  -- Hacker News enrichment fields
  hn_story_id TEXT,
  hn_score INTEGER,
  hn_comments INTEGER,
  hn_author TEXT,
  hn_discussion_url TEXT,
  hn_category TEXT,
  
  -- GitHub enrichment fields
  github_repo_url TEXT,
  github_stars INTEGER,
  github_forks INTEGER,
  github_today_stars INTEGER,
  github_language TEXT,
  github_author TEXT,
  github_repo_name TEXT,
  
  -- Indie Hackers enrichment fields (legacy)
  ih_post_id TEXT,
  ih_author TEXT,
  ih_upvotes INTEGER,
  ih_comments INTEGER,
  ih_category TEXT,
  ih_revenue INTEGER,
  
  -- Y Combinator enrichment fields
  yc_company_id TEXT,
  yc_batch TEXT,
  yc_status TEXT,
  yc_vertical TEXT,
  yc_team_size INTEGER,
  yc_is_hiring BOOLEAN DEFAULT FALSE,
  yc_funding_stage TEXT,
  yc_location TEXT
);

-- Create indexes for signals
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_score ON signals(score);
CREATE INDEX IF NOT EXISTS idx_signals_signal_type ON signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signals_company_id ON signals(company_id);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at);
CREATE INDEX IF NOT EXISTS idx_signals_published_at ON signals(published_at);
CREATE INDEX IF NOT EXISTS idx_signals_tags ON signals USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_signals_person_ids ON signals USING GIN(person_ids);
CREATE INDEX IF NOT EXISTS idx_signals_company_ids ON signals USING GIN(company_ids);

-- YC specific indexes
CREATE INDEX IF NOT EXISTS idx_signals_yc_company_id ON signals(yc_company_id);
CREATE INDEX IF NOT EXISTS idx_signals_yc_batch ON signals(yc_batch);
CREATE INDEX IF NOT EXISTS idx_signals_yc_is_hiring ON signals(yc_is_hiring);
CREATE INDEX IF NOT EXISTS idx_signals_yc_vertical ON signals(yc_vertical);

-- Product Hunt specific indexes
CREATE INDEX IF NOT EXISTS idx_signals_ph_post_id ON signals(ph_post_id);

-- Hacker News specific indexes
CREATE INDEX IF NOT EXISTS idx_signals_hn_story_id ON signals(hn_story_id);

-- GitHub specific indexes
CREATE INDEX IF NOT EXISTS idx_signals_github_repo_url ON signals(github_repo_url);

-- ============================================
-- STEP 4: Create users table (if needed)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create index for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- STEP 5: Add comments for documentation
-- ============================================

-- Companies table comments
COMMENT ON TABLE companies IS 'Companies tracked in the system';
COMMENT ON COLUMN companies.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN companies.social_links IS 'JSON object with social media links';

-- People table comments
COMMENT ON TABLE people IS 'People (founders, executives) tracked in the system';
COMMENT ON COLUMN people.company_id IS 'Reference to companies table';
COMMENT ON COLUMN people.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN people.social_links IS 'JSON object with social media links';

-- Signals table comments
COMMENT ON TABLE signals IS 'Market signals and intelligence data';
COMMENT ON COLUMN signals.score IS 'Signal importance score (0-10)';
COMMENT ON COLUMN signals.credibility IS 'Source credibility (low/medium/high)';
COMMENT ON COLUMN signals.person_ids IS 'Array of related person UUIDs';
COMMENT ON COLUMN signals.company_ids IS 'Array of related company UUIDs';

-- YC field comments
COMMENT ON COLUMN signals.yc_company_id IS 'Y Combinator company ID from their directory';
COMMENT ON COLUMN signals.yc_batch IS 'YC batch (e.g., W24, S24)';
COMMENT ON COLUMN signals.yc_status IS 'Company status (Active, Acquired, etc.)';
COMMENT ON COLUMN signals.yc_vertical IS 'Company vertical/industry';
COMMENT ON COLUMN signals.yc_team_size IS 'Number of team members';
COMMENT ON COLUMN signals.yc_is_hiring IS 'Whether the company is actively hiring';
COMMENT ON COLUMN signals.yc_funding_stage IS 'Current funding stage';
COMMENT ON COLUMN signals.yc_location IS 'Company location';

-- ============================================
-- STEP 6: Show setup results
-- ============================================

SELECT 
    'Database setup complete!' as status,
    'Tables created: companies, people, signals, users' as tables_created;

-- Show table counts
SELECT 
    'companies' as table_name,
    COUNT(*) as record_count
FROM companies
UNION ALL
SELECT 
    'people' as table_name,
    COUNT(*) as record_count
FROM people
UNION ALL
SELECT 
    'signals' as table_name,
    COUNT(*) as record_count
FROM signals
UNION ALL
SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM users;

SELECT 'Ready to sync data from integrations!' as next_step;