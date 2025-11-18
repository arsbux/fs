# Product Hunt Sync Setup Guide

## Issues Found

Based on the terminal errors, there are two main issues:

### 1. Invalid Anthropic API Key (401 Error)
```
Claude API error: 401 {"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}
```

### 2. Missing Database Column
```
Error creating signal: Could not find the 'company_name' column of 'signals' in the schema cache
```

## Fix Steps

### Step 1: Update Anthropic API Key

1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Update your `.env.local` file:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

**Note**: The API key should start with `sk-ant-api03-`

### Step 2: Update Database Schema

Run the following SQL scripts in your Supabase SQL Editor:

#### A. Create People Table (if not exists)
```sql
-- Run the contents of scripts/create-people-table.sql
```

#### B. Update Signals Table
```sql
-- Run the contents of scripts/update-signals-schema.sql
```

Or run them directly:

**Create People Table:**
```sql
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  email TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  company_name TEXT,
  tags TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_people_company_id ON people(company_id);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);
```

**Update Signals Table:**
```sql
-- Add company_name if missing
ALTER TABLE signals ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add new relationship columns
ALTER TABLE signals ADD COLUMN IF NOT EXISTS company_ids UUID[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS person_ids UUID[];

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_signals_company_ids ON signals USING GIN(company_ids);
CREATE INDEX IF NOT EXISTS idx_signals_person_ids ON signals USING GIN(person_ids);

-- Populate company_ids from existing company_id
UPDATE signals 
SET company_ids = ARRAY[company_id]::UUID[]
WHERE company_id IS NOT NULL AND (company_ids IS NULL OR array_length(company_ids, 1) IS NULL);
```

**Update Companies Table:**
```sql
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;
```

### Step 3: Verify Environment Variables

Your `.env.local` should have:

```bash
# Product Hunt API
PRODUCT_HUNT_API_TOKEN=your_ph_developer_token

# Anthropic AI (Claude)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 4: Restart Development Server

After making changes:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 5: Test the Sync

1. Navigate to `/desk/producthunt` or `/admin/producthunt`
2. Click "Sync Now"
3. Watch the terminal for progress

## Expected Behavior

When sync works correctly, you should see:

```
Starting Product Hunt sync with AI analysis...
Fetching Product Hunt posts with developer token...
✓ Fetched 20 posts from Product Hunt
Analyzing Cursor 2.0 with AI...
✓ AI analyzed Cursor 2.0: 2 people, company: Cursor
✓ Imported Cursor 2.0 with 2 people
```

## Troubleshooting

### If AI Analysis Fails

The system will fall back to basic extraction:
- Company: Uses product name
- People: Extracts from makers list
- Signal: Uses template-based generation

### If Database Errors Persist

1. Check Supabase logs in the dashboard
2. Verify all tables exist: `signals`, `companies`, `people`
3. Check column names match exactly
4. Ensure foreign key relationships are set up

### If Sync is Slow

- AI analysis takes ~2-3 seconds per product
- 20 products = ~60 seconds total
- This is normal behavior

## Cost Considerations

### Anthropic API (Claude Haiku)
- ~$0.25 per 1M input tokens
- ~$1.25 per 1M output tokens
- Each product analysis: ~500 tokens
- 20 products ≈ $0.01

Very affordable for daily syncs!

## Next Steps

After successful sync:
1. Check `/desk` to see imported signals
2. Visit `/desk/companies` to see extracted companies
3. Visit `/desk/people` to see extracted makers/founders
4. Click on any company or person to see their profile with related signals

## Support

If issues persist:
1. Check Supabase logs
2. Check browser console for errors
3. Verify API keys are valid
4. Ensure database schema is up to date
