-- Add job-specific fields to signals table for High Signal Jobs integration
-- Run this in Supabase SQL Editor

-- Add job count field
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_count INTEGER;

-- Add departments array
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS departments TEXT[];

-- Add seniority levels array
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS seniority_levels TEXT[];

-- Add total budget estimate
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS total_budget_estimate NUMERIC;

-- Add growth indicator
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS growth_indicator TEXT CHECK (growth_indicator IN ('high', 'medium', 'low'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_signals_job_count ON signals(job_count);
CREATE INDEX IF NOT EXISTS idx_signals_growth_indicator ON signals(growth_indicator);
CREATE INDEX IF NOT EXISTS idx_signals_departments ON signals USING GIN(departments);

-- Add comments for documentation
COMMENT ON COLUMN signals.job_count IS 'Number of job postings found for this hiring signal';
COMMENT ON COLUMN signals.departments IS 'Array of departments hiring (Engineering, Product, Sales, etc.)';
COMMENT ON COLUMN signals.seniority_levels IS 'Array of seniority levels (entry, mid, senior, executive)';
COMMENT ON COLUMN signals.total_budget_estimate IS 'Estimated total hiring budget based on salary ranges';
COMMENT ON COLUMN signals.growth_indicator IS 'Growth momentum indicator: high, medium, or low';

-- Create a view for job signals analytics
CREATE OR REPLACE VIEW job_signals_analytics AS
WITH department_unnest AS (
  SELECT 
    company_name,
    job_count,
    score,
    total_budget_estimate,
    created_at,
    growth_indicator,
    unnest(departments) as department
  FROM signals
  WHERE signal_type = 'hiring'
    AND job_count IS NOT NULL
)
SELECT 
  company_name,
  COUNT(DISTINCT created_at) as total_signals,
  SUM(DISTINCT job_count) as total_jobs,
  AVG(score) as avg_score,
  SUM(DISTINCT total_budget_estimate) as total_budget,
  MAX(created_at) as latest_signal,
  ARRAY_AGG(DISTINCT department) as all_departments,
  ARRAY_AGG(DISTINCT growth_indicator) as growth_indicators
FROM department_unnest
GROUP BY company_name
ORDER BY total_jobs DESC;

-- Grant permissions
GRANT SELECT ON job_signals_analytics TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Job fields added successfully to signals table';
  RAISE NOTICE 'Created job_signals_analytics view for reporting';
END $$;
