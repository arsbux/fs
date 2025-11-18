# 🔧 Fix Database Error - Quick Solution

## Problem
You're seeing a "Failed to fetch" error on the people page because the database tables haven't been created yet.

## ✅ Quick Fix (2 minutes)

### Step 1: Run Database Setup
1. **Open Supabase Dashboard**: Go to your Supabase project
2. **Open SQL Editor**: Click "SQL Editor" in the left sidebar
3. **Run Setup Script**: Copy and paste the entire contents of `scripts/setup-complete-database.sql`
4. **Execute**: Click "Run" to create all tables

### Step 2: Verify Fix
1. **Refresh your app**: Go back to http://localhost:3000/desk/people
2. **Should work now**: The page should load without errors (will be empty initially)

## What This Does

The script creates all necessary database tables:
- ✅ **companies** - Company profiles
- ✅ **people** - Founder and executive profiles  
- ✅ **signals** - Market intelligence data
- ✅ **users** - User accounts

## Alternative: Manual Table Creation

If you prefer to create tables individually:

```sql
-- 1. Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. People table  
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  company_name TEXT,
  tags TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Signals table
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_link TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  score INTEGER NOT NULL,
  credibility TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## After Setup

Once tables are created, you can:

1. **Sync YC Companies**: Go to `/admin/yc` and click "Sync YC Directory"
2. **Sync Product Hunt**: Go to `/admin/producthunt` and click sync
3. **Sync Hacker News**: Go to `/admin/hackernews` and click sync
4. **Sync GitHub**: Go to `/admin/github` and click sync

## Error Prevention

The API routes have been updated to handle missing tables gracefully:
- ✅ Returns empty arrays instead of errors
- ✅ Logs helpful messages about missing tables
- ✅ Won't crash the app if database isn't set up

## Need Help?

If you're still seeing errors after running the setup script:

1. **Check Supabase Connection**: Verify your `.env.local` has correct Supabase credentials
2. **Check Console**: Look for error messages in browser developer tools
3. **Verify Tables**: Run `SELECT * FROM companies LIMIT 1;` in Supabase SQL Editor

## Summary

**Root Cause**: Database tables didn't exist yet
**Solution**: Run `scripts/setup-complete-database.sql` in Supabase SQL Editor
**Result**: All pages will load correctly and you can start syncing data

This is a one-time setup - once the tables are created, everything will work smoothly!