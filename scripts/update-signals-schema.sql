-- Update signals table to ensure company_name column exists
-- This is a legacy column that should still exist for backward compatibility

-- Check if company_name exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signals' AND column_name = 'company_name'
    ) THEN
        ALTER TABLE signals ADD COLUMN company_name TEXT;
    END IF;
END $$;

-- Add new columns for entity relationships if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signals' AND column_name = 'company_ids'
    ) THEN
        ALTER TABLE signals ADD COLUMN company_ids UUID[];
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signals' AND column_name = 'person_ids'
    ) THEN
        ALTER TABLE signals ADD COLUMN person_ids UUID[];
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_signals_company_ids ON signals USING GIN(company_ids);
CREATE INDEX IF NOT EXISTS idx_signals_person_ids ON signals USING GIN(person_ids);

-- Update existing signals to populate company_ids from company_id
UPDATE signals 
SET company_ids = ARRAY[company_id]::UUID[]
WHERE company_id IS NOT NULL AND (company_ids IS NULL OR array_length(company_ids, 1) IS NULL);
