-- Add fields to store complete job posting data
-- Run this in Supabase SQL Editor

-- Job posting details
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_title TEXT;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_description TEXT;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_requirements TEXT[];

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_location TEXT;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_remote BOOLEAN;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_type TEXT;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_salary_min NUMERIC;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_salary_max NUMERIC;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_equity TEXT;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_posted_date TIMESTAMP;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS job_source TEXT;

-- AI analysis results
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS ai_key_skills TEXT[];

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS ai_company_insights TEXT;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS ai_growth_signals TEXT[];

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_signals_job_title ON signals(job_title);
CREATE INDEX IF NOT EXISTS idx_signals_job_location ON signals(job_location);
CREATE INDEX IF NOT EXISTS idx_signals_job_remote ON signals(job_remote);
CREATE INDEX IF NOT EXISTS idx_signals_job_salary_max ON signals(job_salary_max);
CREATE INDEX IF NOT EXISTS idx_signals_job_source ON signals(job_source);

-- Add comments for documentation
COMMENT ON COLUMN signals.job_title IS 'Full job title from posting';
COMMENT ON COLUMN signals.job_description IS 'Complete job description';
COMMENT ON COLUMN signals.job_requirements IS 'Array of job requirements/skills';
COMMENT ON COLUMN signals.job_location IS 'Job location (city, state, country)';
COMMENT ON COLUMN signals.job_remote IS 'Whether job is remote';
COMMENT ON COLUMN signals.job_type IS 'Job type: full_time, part_time, contract, internship';
COMMENT ON COLUMN signals.job_salary_min IS 'Minimum salary';
COMMENT ON COLUMN signals.job_salary_max IS 'Maximum salary';
COMMENT ON COLUMN signals.job_equity IS 'Equity compensation range';
COMMENT ON COLUMN signals.job_posted_date IS 'When job was posted';
COMMENT ON COLUMN signals.job_source IS 'Job source: yc_jobs, wellfound, remote_ok';
COMMENT ON COLUMN signals.ai_key_skills IS 'AI-extracted key skills';
COMMENT ON COLUMN signals.ai_company_insights IS 'AI-generated company insights';
COMMENT ON COLUMN signals.ai_growth_signals IS 'AI-detected growth signals';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Complete job data fields added successfully to signals table';
  RAISE NOTICE 'Jobs will now store full posting details and AI analysis';
END $$;
