-- Add Indie Hackers enrichment fields to signals table
-- Run this in your Supabase SQL editor

-- Add Indie Hackers fields
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS ih_post_id TEXT,
ADD COLUMN IF NOT EXISTS ih_author TEXT,
ADD COLUMN IF NOT EXISTS ih_upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ih_comments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ih_category TEXT,
ADD COLUMN IF NOT EXISTS ih_revenue INTEGER;

-- Create index for Indie Hackers post ID lookups (for deduplication)
CREATE INDEX IF NOT EXISTS idx_signals_ih_post_id ON signals(ih_post_id);

-- Create index for revenue filtering
CREATE INDEX IF NOT EXISTS idx_signals_ih_revenue ON signals(ih_revenue) WHERE ih_revenue IS NOT NULL;

-- Show results
SELECT 
    'Indie Hackers fields added successfully!' as status,
    COUNT(*) as total_signals,
    COUNT(ih_post_id) as ih_signals,
    COUNT(CASE WHEN ih_revenue > 0 THEN 1 END) as revenue_milestones
FROM signals;
