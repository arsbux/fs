-- Remove All Database Restrictions
-- WARNING: This removes all RLS policies and makes tables publicly accessible
-- Only use this for development/testing purposes

-- ============================================
-- DISABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE people DISABLE ROW LEVEL SECURITY;

-- If you have a users table
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'users') THEN
        EXECUTE 'ALTER TABLE users DISABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================

-- Drop policies on signals table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'signals') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON signals';
    END LOOP;
END $$;

-- Drop policies on companies table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'companies') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON companies';
    END LOOP;
END $$;

-- Drop policies on people table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'people') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON people';
    END LOOP;
END $$;

-- ============================================
-- GRANT FULL PUBLIC ACCESS
-- ============================================

-- Grant all privileges to anon and authenticated roles
GRANT ALL ON signals TO anon, authenticated;
GRANT ALL ON companies TO anon, authenticated;
GRANT ALL ON people TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- VERIFY CHANGES
-- ============================================

-- Check RLS status
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('signals', 'companies', 'people')
ORDER BY tablename;

-- Check existing policies (should be empty)
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('signals', 'companies', 'people')
ORDER BY tablename, policyname;

-- Success message
SELECT 'All restrictions removed! Tables are now fully accessible.' as status;
