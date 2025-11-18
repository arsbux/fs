-- FIX ALL PERMISSIONS - Run this to remove ALL restrictions
-- This grants FULL access to everything

-- ============================================
-- GRANT SCHEMA PERMISSIONS (This fixes the 42501 error)
-- ============================================

-- Grant usage and create on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT CREATE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON SCHEMA public TO anon, authenticated;

-- ============================================
-- GRANT TABLE PERMISSIONS
-- ============================================

-- Grant ALL privileges on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant specific tables
GRANT ALL ON signals TO anon, authenticated, postgres;
GRANT ALL ON companies TO anon, authenticated, postgres;

-- If people table exists, grant access
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'people') THEN
        EXECUTE 'GRANT ALL ON people TO anon, authenticated, postgres';
    END IF;
END $$;

-- ============================================
-- GRANT SEQUENCE PERMISSIONS
-- ============================================

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- GRANT FUNCTION PERMISSIONS
-- ============================================


GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================
-- DISABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'people') THEN
        EXECUTE 'ALTER TABLE people DISABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- ============================================
-- DROP ALL POLICIES
-- ============================================

-- Drop all policies on signals
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'signals') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON signals';
    END LOOP;
END $$;

-- Drop all policies on companies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'companies') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON companies';
    END LOOP;
END $$;

-- Drop all policies on people
DO $$ 
DECLARE r RECORD;
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'people') THEN
        FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'people') LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON people';
        END LOOP;
    END IF;
END $$;

-- ============================================
-- SET DEFAULT PRIVILEGES (for future tables)
-- ============================================

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;

-- ============================================
-- VERIFY PERMISSIONS
-- ============================================

-- Check schema permissions
SELECT 
    nspname as schema_name,
    has_schema_privilege('anon', nspname, 'USAGE') as anon_usage,
    has_schema_privilege('anon', nspname, 'CREATE') as anon_create,
    has_schema_privilege('authenticated', nspname, 'USAGE') as auth_usage,
    has_schema_privilege('authenticated', nspname, 'CREATE') as auth_create
FROM pg_namespace 
WHERE nspname = 'public';

-- Check table permissions
SELECT 
    tablename,
    has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT') as anon_select,
    has_table_privilege('anon', schemaname || '.' || tablename, 'INSERT') as anon_insert,
    has_table_privilege('anon', schemaname || '.' || tablename, 'UPDATE') as anon_update,
    has_table_privilege('anon', schemaname || '.' || tablename, 'DELETE') as anon_delete
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('signals', 'companies', 'people')
ORDER BY tablename;

-- Check RLS status
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '❌ ENABLED (BAD)' ELSE '✅ DISABLED (GOOD)' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('signals', 'companies', 'people')
ORDER BY tablename;

-- Success message
SELECT '✅ ALL PERMISSIONS GRANTED! Database is now fully accessible.' as status;
