# Setup FounderSignal Now

## What You Have

A simplified intelligence platform with:
- ✅ Watchlist tracking (companies, keywords, topics)
- ✅ Auto-matching with fuzzy search
- ✅ Action tracking and metrics
- ✅ Product Hunt integration

## 3 Steps to Get Running

### Step 1: Create Supabase Table (2 min)

1. Open Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS public.watchlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  company_ids text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  topics text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on watchlists" ON public.watchlists
  FOR ALL USING (true) WITH CHECK (true);
```

### Step 2: Add Supabase Keys (1 min)

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

Get from: Supabase Dashboard → Settings → API

### Step 3: Start App (30 sec)

```bash
npm run dev
```

Open http://localhost:3000/desk

---

## First Use

1. **Build watchlist** at `/desk/watchlist`
   - Add companies: Amazon, Stripe, etc.
   - Add keywords: AI, SaaS, enterprise
   - Add topics: Developer Tools, B2B

2. **Create signals** at `/admin`
   - Manual entry or import from Product Hunt
   - Signals auto-match your watchlist

3. **Track actions** on signal cards
   - ✓ Acted / 👍 Useful / ✕ Ignore
   - View metrics at `/admin/metrics`

---

## What Was Removed

To simplify setup, we removed:
- ❌ Slack integration (no webhooks needed)
- ❌ Crunchbase API (no API key needed)
- ❌ Tech press enrichment (no external calls)

**Result:** Faster setup, fewer dependencies, same core value.

---

## Verify It Works

### Test 1: Watchlist Persistence
1. Add a company to watchlist
2. Refresh page
3. ✅ Company should still be there

### Test 2: Signal Matching
1. Create a signal for a watched company
2. Check signal has ⭐ Watchlist Match badge
3. ✅ Match reason should be displayed

### Test 3: Action Tracking
1. Click "Acted" on a signal
2. Go to `/admin/metrics`
3. ✅ Metrics should show 1 acted signal

---

## Troubleshooting

**Watchlist not saving?**
→ Check Supabase keys in `.env.local`
→ Verify table exists in Supabase
→ Restart dev server

**Signals not matching?**
→ Check watchlist has companies/keywords
→ Verify signal company matches watchlist
→ Review match_reason field

**Product Hunt not working?**
→ Add PRODUCT_HUNT_API_TOKEN to `.env.local`
→ Get from https://www.producthunt.com/v2/oauth/applications

---

## Next Steps

Once running:
1. Import Product Hunt launches
2. Build your watchlist
3. Track actions for 1 week
4. Review precision metrics
5. Refine watchlist based on matches

---

## Documentation

- **Quick setup:** This file
- **Detailed guide:** [SIMPLIFIED_SETUP.md](./SIMPLIFIED_SETUP.md)
- **Watchlist fix:** [WATCHLIST_FIX.md](./WATCHLIST_FIX.md)
- **Changes:** [CHANGELOG.md](./CHANGELOG.md)
- **Main README:** [README.md](./README.md)

---

**Ready to go!** 🚀

The system is now simplified and focused on core value: matching signals to your interests and tracking what matters.
