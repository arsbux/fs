-- Deduplicate existing company and people profiles
-- Run this in your Supabase SQL editor

-- ============================================
-- STEP 1: Find duplicate companies
-- ============================================

-- Show potential company duplicates
SELECT 
    LOWER(TRIM(name)) as normalized_name,
    COUNT(*) as duplicate_count,
    STRING_AGG(name || ' (ID: ' || id || ')', ', ') as duplicates
FROM companies 
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ============================================
-- STEP 2: Find duplicate people
-- ============================================

-- Show potential people duplicates
SELECT 
    LOWER(TRIM(name)) as normalized_name,
    COUNT(*) as duplicate_count,
    STRING_AGG(name || ' (ID: ' || id || ')', ', ') as duplicates
FROM people 
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ============================================
-- STEP 3: Merge duplicate companies (manual review recommended)
-- ============================================

-- Create a temporary table to track merges
CREATE TEMP TABLE company_merges AS
WITH duplicates AS (
    SELECT 
        LOWER(TRIM(name)) as normalized_name,
        ARRAY_AGG(id ORDER BY created_at) as ids,
        ARRAY_AGG(name ORDER BY created_at) as names
    FROM companies 
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) > 1
)
SELECT 
    normalized_name,
    ids[1] as keep_id,
    ids[2:] as merge_ids,
    names[1] as keep_name
FROM duplicates;

-- Show what will be merged (review before executing)
SELECT 
    'Company Merge Plan:' as action,
    normalized_name,
    keep_name as "Keep This",
    ARRAY_LENGTH(merge_ids, 1) as "Merge Count"
FROM company_merges;

-- ============================================
-- STEP 4: Merge duplicate people (manual review recommended)
-- ============================================

-- Create a temporary table to track people merges
CREATE TEMP TABLE people_merges AS
WITH duplicates AS (
    SELECT 
        LOWER(TRIM(name)) as normalized_name,
        ARRAY_AGG(id ORDER BY created_at) as ids,
        ARRAY_AGG(name ORDER BY created_at) as names
    FROM people 
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) > 1
)
SELECT 
    normalized_name,
    ids[1] as keep_id,
    ids[2:] as merge_ids,
    names[1] as keep_name
FROM duplicates;

-- Show what will be merged (review before executing)
SELECT 
    'People Merge Plan:' as action,
    normalized_name,
    keep_name as "Keep This",
    ARRAY_LENGTH(merge_ids, 1) as "Merge Count"
FROM people_merges;

-- ============================================
-- STEP 5: Execute merges (UNCOMMENT TO RUN)
-- ============================================

-- WARNING: Review the merge plans above before uncommenting these!

-- Update signals to point to kept companies
-- UPDATE signals 
-- SET company_id = cm.keep_id
-- FROM company_merges cm
-- WHERE company_id = ANY(cm.merge_ids);

-- Update people to point to kept companies
-- UPDATE people 
-- SET company_id = cm.keep_id
-- FROM company_merges cm
-- WHERE company_id = ANY(cm.merge_ids);

-- Update signals to point to kept people
-- UPDATE signals 
-- SET person_ids = ARRAY(
--     SELECT CASE 
--         WHEN pid = ANY(pm.merge_ids) THEN pm.keep_id::text
--         ELSE pid
--     END
--     FROM UNNEST(person_ids) AS pid
--     LEFT JOIN people_merges pm ON pid = ANY(pm.merge_ids::text[])
-- )
-- FROM people_merges pm
-- WHERE person_ids && pm.merge_ids::text[];

-- Delete duplicate companies (after updating references)
-- DELETE FROM companies 
-- WHERE id IN (
--     SELECT UNNEST(merge_ids) 
--     FROM company_merges
-- );

-- Delete duplicate people (after updating references)
-- DELETE FROM people 
-- WHERE id IN (
--     SELECT UNNEST(merge_ids) 
--     FROM people_merges
-- );

-- ============================================
-- STEP 6: Verification
-- ============================================

-- Check for remaining duplicates
SELECT 'Remaining company duplicates:' as check;
SELECT 
    LOWER(TRIM(name)) as normalized_name,
    COUNT(*) as count
FROM companies 
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1;

SELECT 'Remaining people duplicates:' as check;
SELECT 
    LOWER(TRIM(name)) as normalized_name,
    COUNT(*) as count
FROM people 
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1;

-- Show final counts
SELECT 
    'Final Profile Counts' as summary,
    (SELECT COUNT(*) FROM companies) as total_companies,
    (SELECT COUNT(*) FROM people) as total_people,
    (SELECT COUNT(*) FROM signals) as total_signals;

SELECT 'Profile deduplication analysis complete!' as status;