# Quick Start - Clean Site (No Mock Data)

Your site is now completely clean of all mock/sample/demo data. Here's how to get started with real data.

## Step 1: Clean Your Database (Required)

Run this in your Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of:
scripts/cleanup-all-fake-data.sql
```

This removes all fake people, companies, and signals from your database.

## Step 2: Sync Real Data

### Option A: Use Admin UI (Recommended)

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Login and go to Admin**:
   - Visit http://localhost:3000/login
   - Login with your credentials
   - Go to http://localhost:3000/admin

3. **Sync each integration**:
   - **Indie Hackers**: `/admin/indiehackers` → Click "Sync Indie Hackers"
   - **Product Hunt**: `/admin/producthunt` → Click "Sync Product Hunt"
   - **Hacker News**: `/admin/hackernews` → Click "Sync Hacker News"
   - **GitHub**: `/admin/github` → Click "Sync GitHub"

### Option B: Use API Directly

```bash
# Indie Hackers (with AI analysis)
curl -X POST http://localhost:3000/api/indiehackers/sync

# Product Hunt
curl -X POST http://localhost:3000/api/producthunt/sync

# Hacker News
curl -X POST http://localhost:3000/api/hackernews/sync

# GitHub
curl -X POST http://localhost:3000/api/github/sync
```

## Step 3: View Your Data

Visit the desk pages to see real data:

- **Indie Hackers**: http://localhost:3000/desk/indiehackers
- **Product Hunt**: http://localhost:3000/desk/producthunt
- **Hacker News**: http://localhost:3000/desk/hackernews
- **GitHub**: http://localhost:3000/desk/github
- **All Signals**: http://localhost:3000/desk

## What to Expect

### Indie Hackers
- Real posts from indie founders
- Revenue milestones ($X MRR/ARR)
- Product launches
- Market insights
- AI-analyzed signals with extracted companies and people

### Product Hunt
- Today's top launches
- Maker profiles
- Vote counts and engagement
- AI-analyzed signals

### Hacker News
- Top stories (200+ points)
- Tech releases and announcements
- Startup news
- Market discussions

### GitHub
- Trending repositories
- 100+ repos across multiple languages
- Stars and fork counts
- Developer profiles

## Troubleshooting

### "No posts yet" after sync?

**Indie Hackers**:
- RSS feeds may be temporarily unavailable
- Check console logs for which feeds were tried
- No mock data will be shown - it will just be empty

**Product Hunt**:
- Verify `PRODUCT_HUNT_API_TOKEN` in `.env.local`
- Check API token is valid

**Hacker News**:
- Should always work (public API)
- Check minimum score threshold (50+ points)

**GitHub**:
- Should always work (public API)
- Returns 100+ repos by default

### AI Analysis Failing?

Check your `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

- Must be a valid Claude API key
- Must have sufficient credits
- Required for Indie Hackers and Product Hunt AI analysis

## Environment Check

Verify all keys are set in `.env.local`:

```bash
✓ PRODUCT_HUNT_API_TOKEN
✓ ANTHROPIC_API_KEY
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
```

## Summary

✅ All mock data removed from code
✅ Database cleanup script ready
✅ All integrations working with real APIs
✅ Indie Hackers fully functional with AI
✅ No fallback to fake data

Your site will only show real data from external sources. If a sync returns 0 results, it means no new signal-worthy content was found (not that it fell back to mock data).
