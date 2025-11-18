-- Add GitHub enrichment fields to signals table
-- Run this in your Supabase SQL editor

-- Add GitHub fields
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS github_repo_url TEXT,
ADD COLUMN IF NOT EXISTS github_stars INTEGER,
ADD COLUMN IF NOT EXISTS github_forks INTEGER,
ADD COLUMN IF NOT EXISTS github_today_stars INTEGER,
ADD COLUMN IF NOT EXISTS github_language TEXT,
ADD COLUMN IF NOT EXISTS github_author TEXT,
ADD COLUMN IF NOT EXISTS github_repo_name TEXT;

-- Create index for GitHub repo URL lookups (for deduplication)
CREATE INDEX IF NOT EXISTS idx_signals_github_repo_url ON signals(github_repo_url);

-- Create index for GitHub language filtering
CREATE INDEX IF NOT EXISTS idx_signals_github_language ON signals(github_language);

-- Show results
SELECT 
    'GitHub fields added successfully!' as status,
    COUNT(*) as total_signals,
    COUNT(github_repo_url) as github_signals
FROM signals;
