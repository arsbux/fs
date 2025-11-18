-- Complete cleanup of all fake, sample, demo, and mock data
-- Run this in your Supabase SQL editor to remove all test data

-- ============================================
-- STEP 1: Clean up fake people
-- ============================================

-- Show what will be deleted
SELECT 
    'People to be deleted:' as notice,
    COUNT(*) as count
FROM people 
WHERE NOT (
    name ~ '^[A-Z][a-z]+ [A-Z][a-z]+' AND 
    name !~ '[_@#$%^&*()0-9]' AND 
    name ~ ' ' AND 
    LENGTH(name) BETWEEN 3 AND 50 AND
    name !~* '^(john|jane)\s+(doe|smith)$' AND
    name !~* '^(user|developer|founder|maker|admin|test)' AND
    name !~* '^(redacted|unknown|anonymous)'
);

-- Delete invalid person names
DELETE FROM people 
WHERE NOT (
    name ~ '^[A-Z][a-z]+ [A-Z][a-z]+' AND 
    name !~ '[_@#$%^&*()0-9]' AND 
    name ~ ' ' AND 
    LENGTH(name) BETWEEN 3 AND 50 AND
    name !~* '^(john|jane)\s+(doe|smith)$' AND
    name !~* '^(user|developer|founder|maker|admin|test)' AND
    name !~* '^(redacted|unknown|anonymous)'
);

-- ============================================
-- STEP 2: Clean up fake companies
-- ============================================

-- Show what will be deleted
SELECT 
    'Companies to be deleted:' as notice,
    COUNT(*) as count
FROM companies 
WHERE 
    name ~* '^.+ (company|compiler|trust)$' OR
    name ~* '^(generic|example|sample|test|fake|placeholder)' OR
    LENGTH(name) < 3 OR
    name IN (
        'Company',
        'Corporation', 
        'Inc',
        'LLC',
        'The Company',
        'Trust Company',
        'Compiler Company',
        'Tech Company',
        'Software Company',
        'Indie Project',
        'Community',
        'Open Source Community'
    );

-- Delete fake companies
DELETE FROM companies 
WHERE 
    name ~* '^.+ (company|compiler|trust)$' OR
    name ~* '^(generic|example|sample|test|fake|placeholder)' OR
    LENGTH(name) < 3 OR
    name IN (
        'Company',
        'Corporation', 
        'Inc',
        'LLC',
        'The Company',
        'Trust Company',
        'Compiler Company',
        'Tech Company',
        'Software Company',
        'Indie Project',
        'Community',
        'Open Source Community'
    );

-- ============================================
-- STEP 3: Clean up signals with sample IDs
-- ============================================

-- Delete signals with sample/test IDs
DELETE FROM signals 
WHERE 
    ph_post_id LIKE 'sample-%' OR
    ph_post_id LIKE 'test-%' OR
    ph_post_id LIKE 'demo-%' OR
    ph_post_id LIKE 'mock-%' OR
    ih_post_id LIKE 'sample-%' OR
    ih_post_id LIKE 'test-%' OR
    ih_post_id LIKE 'demo-%' OR
    ih_post_id LIKE 'mock-%' OR
    hn_story_id < 1000 OR -- HN story IDs are always large numbers
    gh_repo_url LIKE '%sample%' OR
    gh_repo_url LIKE '%test%' OR
    gh_repo_url LIKE '%demo%' OR
    gh_repo_url LIKE '%mock%';

-- ============================================
-- STEP 4: Update signals to remove deleted references
-- ============================================

-- Update signals to remove references to deleted people
UPDATE signals 
SET person_ids = ARRAY(
    SELECT pid::uuid 
    FROM UNNEST(person_ids) AS pid
    WHERE pid::uuid IN (SELECT id FROM people)
)
WHERE person_ids IS NOT NULL AND ARRAY_LENGTH(person_ids, 1) > 0;

-- Clean up empty person_ids arrays
UPDATE signals 
SET person_ids = '{}' 
WHERE person_ids IS NOT NULL AND ARRAY_LENGTH(person_ids, 1) = 0;

-- Update signals to remove references to deleted companies
UPDATE signals 
SET 
    company_id = NULL,
    company_ids = '{}'
WHERE company_id IS NOT NULL AND company_id NOT IN (SELECT id FROM companies);

-- ============================================
-- STEP 5: Show cleanup results
-- ============================================

SELECT 
    '=== CLEANUP COMPLETE ===' as status,
    '' as spacer;

SELECT 
    'Remaining People:' as category,
    COUNT(*) as count,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent
FROM people;

SELECT 
    'Remaining Companies:' as category,
    COUNT(*) as count,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent
FROM companies;

SELECT 
    'Remaining Signals:' as category,
    COUNT(*) as count,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent
FROM signals;

SELECT 
    'Signals by Source:' as category,
    COUNT(CASE WHEN ph_post_id IS NOT NULL THEN 1 END) as product_hunt,
    COUNT(CASE WHEN hn_story_id IS NOT NULL THEN 1 END) as hacker_news,
    COUNT(CASE WHEN ih_post_id IS NOT NULL THEN 1 END) as indie_hackers,
    COUNT(CASE WHEN gh_repo_url IS NOT NULL THEN 1 END) as github
FROM signals;

SELECT '✓ All fake, sample, demo, and mock data has been removed!' as final_status;
