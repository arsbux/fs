# Changelog

## [Simplified] - 2024

### Removed
- ❌ Slack integration (alerts and digests)
- ❌ Crunchbase API integration (funding data)
- ❌ Tech press enrichment (Google News)
- ❌ User settings page
- ❌ Alert threshold configuration
- ❌ Digest scheduling

### Core Features (Kept)
- ✅ Watchlist management (companies, keywords, topics)
- ✅ Auto-matching with fuzzy search (Fuse.js)
- ✅ Action tracking (acted/useful/ignore)
- ✅ Precision metrics
- ✅ Product Hunt integration
- ✅ Signal scoring (0-10)
- ✅ Admin dashboard

### Changed
- Migrated watchlists from JSON files to Supabase database
- Simplified signal enrichment (removed external APIs)
- Removed navigation link to settings page
- Updated environment variables (removed Slack/Crunchbase keys)

### Database
- Added `watchlists` table in Supabase
- Proper persistence for watchlist selections
- Row Level Security enabled

### Files Removed
- `lib/slack.ts`
- `lib/crunchbase.ts`
- `lib/techpress.ts`
- `app/(user)/desk/settings/page.tsx`
- `app/api/users/settings/route.ts`
- `scripts/send-digests.ts`

### Files Modified
- `app/api/watchlist/route.ts` - Now uses Supabase
- `app/(user)/desk/watchlist/page.tsx` - Proper async saves
- `app/api/signals/route.ts` - Removed enrichment APIs
- `components/SignalCard.tsx` - Removed enrichment display
- `components/DeskLayout.tsx` - Removed settings link
- `types/index.ts` - Removed enrichment fields
- `.env.local.example` - Removed unused keys

### Documentation
- Added `SIMPLIFIED_SETUP.md` - Quick setup guide
- Added `WATCHLIST_FIX.md` - Persistence fix guide
- Added `QUICK_FIX_STEPS.md` - 3-step fix
- Updated `README.md` - Simplified features

---

## Why Simplified?

The original implementation included Slack alerts, Crunchbase enrichment, and tech press integration. These features added complexity and external dependencies. 

The simplified version focuses on the core value:
1. **Watchlist matching** - Only see relevant signals
2. **Action tracking** - Measure what matters
3. **Product Hunt** - Auto-import launches

This makes the system easier to setup, maintain, and understand while keeping the highest-value features.

---

## Migration Guide

If you were using the full version:

### Slack Alerts
**Before:** Automatic Slack notifications  
**After:** Check `/desk` page for matched signals

### Crunchbase Data
**Before:** Funding data on signal cards  
**After:** Add funding info manually in signal description

### Settings Page
**Before:** `/desk/settings` for configuration  
**After:** No settings needed - watchlist is the only config

---

## Future Enhancements (Optional)

If you want to add back features:

1. **Email alerts** - Simpler than Slack, no webhook needed
2. **Manual enrichment** - Add funding data in signal form
3. **Export to CSV** - Download matched signals
4. **Browser notifications** - Native push notifications
5. **RSS feed** - Subscribe to matched signals

---

## Current System Flow

```
1. User creates watchlist
   ↓
2. Admin creates/imports signals
   ↓
3. Auto-matching runs (Fuse.js)
   ↓
4. Matched signals show in user feed
   ↓
5. User tracks actions
   ↓
6. Metrics show precision
```

Simple, focused, effective. 🎯
