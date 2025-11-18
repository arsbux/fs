# Setup Supabase Watchlists Table

## Option 1: Run SQL in Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the SQL from `supabase/migrations/001_create_watchlists.sql`
5. Click "Run" or press Cmd/Ctrl + Enter

## Option 2: Use Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

## Verify Table Structure

After running the migration, verify your table has these columns:

- `id` (uuid, primary key)
- `user_id` (text)
- `company_ids` (text array)
- `keywords` (text array)
- `topics` (text array)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Test the API

```bash
# Test GET (should return null if no watchlist exists)
curl http://localhost:3000/api/watchlist?user_id=default-user

# Test POST (create watchlist)
curl -X POST http://localhost:3000/api/watchlist \
  -H "Content-Type: application/json" \
  -d '{
    "company_ids": ["company-1", "company-2"],
    "keywords": ["AI", "SaaS"],
    "topics": ["Developer Tools"]
  }'
```

## Troubleshooting

**Error: "relation 'watchlists' does not exist"**
- Run the SQL migration in Supabase dashboard

**Error: "permission denied for table watchlists"**
- Check RLS policies in Supabase dashboard
- Make sure the policy allows operations

**Watchlist not persisting**
- Check browser console for errors
- Verify Supabase URL and anon key in `.env.local`
- Check Supabase logs in dashboard
