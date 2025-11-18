-- Clean up fake/invalid person names from database
-- Run this in your Supabase SQL editor

-- First, let's see what people we have and categorize them
SELECT 
    id,
    name,
    title,
    company_name,
    tags,
    created_at,
    CASE 
        WHEN name ~ '^[a-z_]+$' THEN 'Username format'
        WHEN name ~ '\d' THEN 'Contains numbers'
        WHEN name ~ '[_@#$%^&*()]' THEN 'Special characters'
        WHEN name ~* '^(user|developer|founder|maker|admin|test)$' THEN 'Generic role'
        WHEN name ~* '^(john|jane)\s+(doe|smith)$' THEN 'Placeholder name'
        WHEN name ~* '^(redacted|unknown|anonymous)' THEN 'Redacted/Anonymous'
        WHEN name !~ ' ' THEN 'No space (single word)'
        WHEN LENGTH(name) < 3 THEN 'Too short'
        WHEN LENGTH(name) > 50 THEN 'Too long'
        WHEN name ~ '^@' THEN 'Handle format'
        ELSE 'Looks real'
    END as name_type,
    CASE 
        WHEN name ~ '^[A-Z][a-z]+ [A-Z][a-z]+' AND 
             name !~ '[_@#$%^&*()0-9]' AND 
             name ~ ' ' AND 
             LENGTH(name) BETWEEN 3 AND 50 AND
             name !~* '^(john|jane)\s+(doe|smith)$' AND
             name !~* '^(user|developer|founder|maker|admin|test)' AND
             name !~* '^(redacted|unknown|anonymous)'
        THEN 'Valid'
        ELSE 'Invalid'
    END as validation_status
FROM people 
ORDER BY created_at DESC;

-- Count by validation status
SELECT 
    CASE 
        WHEN name ~ '^[A-Z][a-z]+ [A-Z][a-z]+' AND 
             name !~ '[_@#$%^&*()0-9]' AND 
             name ~ ' ' AND 
             LENGTH(name) BETWEEN 3 AND 50 AND
             name !~* '^(john|jane)\s+(doe|smith)$' AND
             name !~* '^(user|developer|founder|maker|admin|test)' AND
             name !~* '^(redacted|unknown|anonymous)'
        THEN 'Valid Names'
        ELSE 'Invalid Names'
    END as category,
    COUNT(*) as count
FROM people 
GROUP BY category;

-- Show examples of invalid names that will be deleted
SELECT 
    'Examples of invalid names to be deleted:' as notice,
    name,
    CASE 
        WHEN name ~ '^[a-z_]+$' THEN 'Username format'
        WHEN name ~ '\d' THEN 'Contains numbers'
        WHEN name ~ '[_@#$%^&*()]' THEN 'Special characters'
        WHEN name ~* '^(user|developer|founder|maker|admin|test)$' THEN 'Generic role'
        WHEN name ~* '^(john|jane)\s+(doe|smith)$' THEN 'Placeholder name'
        WHEN name !~ ' ' THEN 'No space (single word)'
        WHEN LENGTH(name) < 3 THEN 'Too short'
        ELSE 'Other invalid pattern'
    END as reason
FROM people 
WHERE NOT (
    name ~ '^[A-Z][a-z]+ [A-Z][a-z]+' AND 
    name !~ '[_@#$%^&*()0-9]' AND 
    name ~ ' ' AND 
    LENGTH(name) BETWEEN 3 AND 50 AND
    name !~* '^(john|jane)\s+(doe|smith)$' AND
    name !~* '^(user|developer|founder|maker|admin|test)' AND
    name !~* '^(redacted|unknown|anonymous)'
)
LIMIT 20;

-- Remove invalid person names
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

-- Show final results
SELECT 
    'Cleanup Results:' as summary,
    COUNT(*) as remaining_people,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_people
FROM people;

-- Show examples of remaining valid names
SELECT 
    'Examples of valid names kept:' as notice,
    name,
    title,
    company_name
FROM people 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'Fake people cleanup complete! Only real names remain.' as status;