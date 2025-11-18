-- Clean up fake/generic company names from database
-- Run this in your Supabase SQL editor

-- First, let's see what companies we have
SELECT 
    id,
    name,
    description,
    website,
    created_at,
    CASE 
        WHEN name ~* '(company|corporation|inc\.?|ltd\.?|llc)$' THEN 'Generic suffix'
        WHEN name ~* '^(the .+ company|.+ compiler|.+ trust)$' THEN 'Generic pattern'
        WHEN name ~* '^(generic|example|sample|test|fake|placeholder)' THEN 'Obviously fake'
        WHEN LENGTH(name) < 3 THEN 'Too short'
        ELSE 'Looks real'
    END as company_type
FROM companies 
ORDER BY created_at DESC;

-- Delete obviously fake companies
DELETE FROM companies 
WHERE 
    -- Generic suffixes without real company names
    name ~* '^.+ (company|compiler|trust)$' OR
    -- Obviously fake names
    name ~* '^(generic|example|sample|test|fake|placeholder)' OR
    -- Too short to be real
    LENGTH(name) < 3 OR
    -- Common fake patterns
    name IN (
        'Company',
        'Corporation', 
        'Inc',
        'LLC',
        'The Company',
        'Trust Company',
        'Compiler Company',
        'Tech Company',
        'Software Company'
    );

-- Update signals to remove references to deleted companies
UPDATE signals 
SET 
    company_id = NULL,
    company_ids = '{}',
    company_name = CASE 
        WHEN signal_type = 'product_launch' AND ph_post_id IS NOT NULL THEN headline
        WHEN signal_type IN ('tech_release', 'framework_library') AND hn_story_id IS NOT NULL THEN 'Open Source Community'
        ELSE 'Community'
    END
WHERE company_id NOT IN (SELECT id FROM companies);

-- Show remaining companies
SELECT 
    COUNT(*) as total_companies,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_companies
FROM companies;

-- Show sample of remaining companies
SELECT 
    name,
    description,
    website,
    tags,
    created_at
FROM companies 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'Fake company cleanup complete!' as status;