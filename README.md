# FounderSignal - Market Intelligence Desk

Daily, curated, actionable signals on competitors, hires, product launches, partnerships and funding.

## Features

### Core Intelligence
- **Manual Signal Curation**: Fast form to submit high-quality signals
- **Product Hunt Integration**: Auto-import launches with smart scoring
- **Signal Scoring**: 0-10 scoring with credibility ratings
- **Admin Dashboard**: Manage signals, companies, and publishing

### 🎯 Features
- **Action Tracking**: Mark signals as acted/useful/ignore, measure precision metrics
- **Product Hunt Integration**: Auto-import launches with smart scoring

## Product Hunt Integration

### What It Does

- **Launch Detection**: Automatically fetches today's Product Hunt launches
- **Smart Scoring**: Calculates scores based on:
  - Upvotes (500+ = +3 points, 200+ = +2, 50+ = +1)
  - Comments (100+ = +2 points, 30+ = +1)
  - Maker reputation (Twitter presence, team size)
- **Enrichment**: Captures upvotes, comments, topics, makers with Twitter handles
- **Watchlist Matching**: Prioritizes launches matching your companies/tags
- **Auto-publish**: Launches with score ≥8 are published immediately
- **Action Templates**: Pre-filled outreach recommendations with maker contacts

### Setup

1. Go to [Product Hunt API Dashboard](https://www.producthunt.com/v2/oauth/applications)
2. Find your application and copy the Developer Token
3. Add to `.env.local`:
```bash
PRODUCT_HUNT_API_TOKEN=your_developer_token
```
4. Restart dev server
5. Go to `/admin/producthunt` to test and sync

### Usage

- **Manual Sync**: Go to Admin → Product Hunt → "Sync Now"
- **Automated**: Set up a cron job to hit `/api/producthunt/sync` daily
- **Test**: Use `/api/producthunt/test` to verify API connection

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
```bash
cp .env.local.example .env.local
# Add your API keys:
# - PRODUCT_HUNT_API_TOKEN (required for PH integration)
# - NEXT_PUBLIC_SUPABASE_URL (required for database)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY (required for database)
# - SUPABASE_SERVICE_ROLE_KEY (required for server-side operations)
```

3. **Run development server**:
```bash
npm run dev
```

4. **Open the app**:
   - User Desk: http://localhost:3000/desk
   - Admin Dashboard: http://localhost:3000/admin
   - Product Hunt: http://localhost:3000/admin/producthunt

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Supabase (PostgreSQL database)
- File-based storage (JSON) for signals/companies
- Tailwind CSS
- Product Hunt GraphQL API
- Fuse.js (fuzzy matching)

## License

MIT
