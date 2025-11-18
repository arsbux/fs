-- Add Y Combinator fields to signals table
-- Run this in your Supabase SQL editor

-- Add YC enrichment fields to signals table
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS yc_company_id TEXT,
ADD COLUMN IF NOT EXISTS yc_batch TEXT,
ADD COLUMN IF NOT EXISTS yc_status TEXT,
ADD COLUMN IF NOT EXISTS yc_vertical TEXT,
ADD COLUMN IF NOT EXISTS yc_team_size INTEGER,
ADD COLUMN IF NOT EXISTS yc_is_hiring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS yc_funding_stage TEXT,
ADD COLUMN IF NOT EXISTS yc_location TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_signals_yc_company_id ON signals(yc_company_id);
CREATE INDEX IF NOT EXISTS idx_signals_yc_batch ON signals(yc_batch);
CREATE INDEX IF NOT EXISTS idx_signals_yc_is_hiring ON signals(yc_is_hiring);
CREATE INDEX IF NOT EXISTS idx_signals_yc_vertical ON signals(yc_vertical);

-- Add comments for documentation
COMMENT ON COLUMN signals.yc_company_id IS 'Y Combinator company ID from their directory';
COMMENT ON COLUMN signals.yc_batch IS 'YC batch (e.g., W24, S24)';
COMMENT ON COLUMN signals.yc_status IS 'Company status (Active, Acquired, etc.)';
COMMENT ON COLUMN signals.yc_vertical IS 'Company vertical/industry';
COMMENT ON COLUMN signals.yc_team_size IS 'Number of team members';
COMMENT ON COLUMN signals.yc_is_hiring IS 'Whether the company is actively hiring';
COMMENT ON COLUMN signals.yc_funding_stage IS 'Current funding stage';
COMMENT ON COLUMN signals.yc_location IS 'Company location';

-- Show the updated table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'signals' 
    AND column_name LIKE 'yc_%'
ORDER BY ordinal_position;

SELECT 'YC fields added to signals table successfully!' as status;