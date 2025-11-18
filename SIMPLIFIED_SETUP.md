# FounderSignal - Simplified Setup

## Core Features

✅ **Watchlist + Auto-Matching** - Track companies, keywords, and topics  
✅ **Action Tracking** - Mark signals as acted/useful/ignore  
✅ **Product Hunt Integration** - Auto-import launches  
✅ **Signal Scoring** - 0-10 scoring with credibility ratings

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase Database

**Create the watchlists table:**

Go to Supabase Dashboard → SQL Editor and run:

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

### 3. Configure Environment

Create `.env.local`:

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Optional - Product Hunt
PRODUCT_HUNT_API_TOKEN=your_token

# Optional - AI Features
ANTHROPIC_API_KEY=your_key
```

**Get Supabase keys:**
1. Dashboard → Settings → API
2. Copy `URL`, `anon` key, and `service_role` key

### 4. Start the App

```bash
npm run dev
```

Open http://localhost:3000/desk

---

## Usage

### Build Your Watchlist
1. Go to `/desk/watchlist`
2. Add companies you want to track
3. Add keywords: `AI`, `enterprise`, `developer tools`
4. Add topics: `SaaS`, `B2B`, `Infrastructure`

### Create Signals
1. Go to `/admin` (admin dashboard)
2. Click "New Signal" or import from Product Hunt
3. Signals auto-match your watchlist
4. Matched signals show with ⭐ badge

### Track Actions
On each signal card:
- **✓ Acted** - You took action
- **👍 Useful** - Valuable signal
- **✕ Ignore** - Not relevant

View metrics at `/admin/metrics`

---

## How Matching Works

Signals match your watchlist based on:

1. **Company match** (100% confidence) - Exact company in watchlist
2. **Keyword match** (60-100%) - Keywords in signal text
3. **Topic match** (60-90%) - Tags matching topics
4. **Fuzzy matching** - Similar company names and keywords

Minimum confidence: 60%

---

## File Structure

```
app/
├── (user)/desk/
│   ├── page.tsx              # All signals
│   ├── watchlist/page.tsx    # Manage watchlist
│   └── producthunt/page.tsx  # PH launches
├── (admin)/admin/
│   ├── page.tsx              # Admin dashboard
│   └── metrics/page.tsx      # Action metrics
└── api/
    ├── watchlist/route.ts    # Watchlist CRUD
    ├── signals/route.ts      # Signal creation + matching
    └── signals/action/route.ts # Action tracking

lib/
├── matching.ts               # Fuzzy matching engine
├── storage.ts                # File-based storage
├── supabase.ts               # Supabase client
└── supabase-server.ts        # Server-side client

data/
├── signals.json              # Signals storage
├── companies.json            # Companies storage
└── users.json                # Users storage
```

---

## Database Schema

### watchlists (Supabase)
- `id` - UUID primary key
- `user_id` - Text (default: 'default-user')
- `company_ids` - Text array
- `keywords` - Text array
- `topics` - Text array
- `created_at` - Timestamp
- `updated_at` - Timestamp

### signals (JSON file)
- Basic info: headline, summary, source_link
- Scoring: score (0-10), credibility, signal_type
- Company: company_id, company_name
- Matching: matched_watchlists, match_reason, match_scores
- Actions: user_actions array

---

## Troubleshooting

**Watchlist not persisting?**
1. Check Supabase table exists (run SQL migration)
2. Verify service role key in `.env.local`
3. Check browser console for errors
4. Restart dev server

**Signals not matching?**
1. Verify watchlist is saved (check Supabase table)
2. Check matching threshold in `lib/matching.ts` (default: 60%)
3. Try exact company name first
4. Review match_reason field in signal

**Product Hunt not working?**
1. Get token from https://www.producthunt.com/v2/oauth/applications
2. Add to `.env.local`
3. Test at `/admin/producthunt`

---

## Next Steps

1. ✅ Setup watchlist with your target companies
2. ✅ Import Product Hunt launches
3. ✅ Create manual signals
4. ✅ Track actions to measure precision
5. ✅ Review metrics to optimize scoring

---

## Support

- Full setup: [WATCHLIST_FIX.md](./WATCHLIST_FIX.md)
- Quick fix: [QUICK_FIX_STEPS.md](./QUICK_FIX_STEPS.md)
- Main README: [README.md](./README.md)
