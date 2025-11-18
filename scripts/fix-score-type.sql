-- Fix score column type issue
-- Run this in your Supabase SQL editor

-- The issue: Score field expects INTEGER but code was sending decimal values
-- Solution: Ensure score column is INTEGER and clean any existing decimal values

-- Clean up any existing decimal scores (convert to integers)
UPDATE signals 
SET score = ROUND(score::numeric)::integer
WHERE score IS NOT NULL;

-- Ensure score column is properly typed as INTEGER with constraints
ALTER TABLE signals 
ALTER COLUMN score TYPE INTEGER,
ADD CONSTRAINT check_score_range CHECK (score >= 0 AND score <= 10);

-- Verify the fix
SELECT 'Score type fix complete - all scores are now integers' as status;

-- Check current scores to verify they're all integers
SELECT 
    id, 
    headline, 
    score,
    signal_type,
    CASE 
        WHEN score = ROUND(score) THEN 'INTEGER ✓'
        ELSE 'DECIMAL ✗'
    END as score_type_check
FROM signals 
WHERE score IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;

-- Show score distribution
SELECT 
    score,
    COUNT(*) as count,
    signal_type
FROM signals 
WHERE score IS NOT NULL 
GROUP BY score, signal_type
ORDER BY score DESC;