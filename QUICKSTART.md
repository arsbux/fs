# FounderSignal Quick Start Guide

Get up and running with personalized intelligence in 5 minutes.

## Step 1: Install & Run (1 min)

```bash
npm install
npm run dev
```

Open http://localhost:3000/desk

## Step 2: Build Your Watchlist (2 min)

1. Go to **Watchlist** in the sidebar
2. Add companies you want to track
3. Add keywords: `AI`, `enterprise`, `developer tools`
4. Add topics: `SaaS`, `B2B`, `Infrastructure`

**Why?** Only signals matching your watchlist will surface. This eliminates noise.

## Step 3: Setup Slack Alerts (2 min)

1. Create a Slack webhook:
   - Go to https://api.slack.com/messaging/webhooks
   - Click "Create New App" → "From scratch"
   - Enable "Incoming Webhooks"
   - Click "Add New Webhook to Workspace"
   - Copy the webhook URL

2. Configure in FounderSignal:
   - Go to **Alert Settings** in sidebar
   - Paste your webhook URL
   - Set threshold to `6` (medium priority)
   - Choose `Realtime` for instant alerts
   - Click "Send Test Alert" to verify

**Why?** Get notified instantly when high-value signals match your interests.

## Step 4: Test It Out (Optional)

### Create a test signal:
1. Go to `/admin` (admin dashboard)
2. Click "New Signal"
3. Fill in details for a company in your watchlist
4. Set score to `7` or higher
5. Set status to "Published"
6. Click "Create Signal"

### What happens:
- ✅ Signal auto-matches your watchlist
- ✅ Enriched with Crunchbase + press data (if API key set)
- ✅ Slack alert sent to your channel
- ✅ Appears in your desk feed

## Step 5: Track Actions

When reviewing signals:
- Click **✓ Acted** if you took action (reached out, scheduled call)
- Click **👍 Useful** if valuable but no immediate action
- Click **✕ Ignore** if not relevant

**Why?** Builds precision metrics to prove ROI.

---

## Optional: Advanced Setup

### Add Crunchbase Enrichment

1. Get API key: https://www.crunchbase.com/api
2. Add to `.env.local`:
   ```bash
   CRUNCHBASE_API_KEY=your_key_here
   ```
3. Restart server

Signals will now show funding data, employee count, etc.

### Setup Daily Digests

Instead of realtime alerts, get a daily summary:

1. Go to **Alert Settings**
2. Choose `Daily digest`
3. Setup cron job:
   ```bash
   # Add to crontab (crontab -e)
   0 9 * * * cd /path/to/foundersignal && npm run send-daily-digest
   ```

### Import Product Hunt Launches

1. Get PH token: https://www.producthunt.com/v2/oauth/applications
2. Add to `.env.local`:
   ```bash
   PRODUCT_HUNT_API_TOKEN=your_token
   ```
3. Go to `/admin/producthunt`
4. Click "Sync Now"

---

## What's Next?

- **Review signals daily** in `/desk`
- **Track your actions** to measure precision
- **Refine your watchlist** based on what matches
- **Adjust alert threshold** if too many/few alerts
- **View metrics** at `/admin/metrics`

---

## Troubleshooting

**No signals showing?**
- Check if any signals are published (go to `/admin`)
- Verify your watchlist has companies/keywords
- Try lowering match threshold in `lib/matching.ts`

**Slack alerts not working?**
- Test webhook with "Send Test Alert" button
- Check alert threshold isn't too high
- Verify signal score meets threshold
- Check Slack webhook URL is correct

**Enrichment not showing?**
- Verify Crunchbase API key is set
- Check company name matches Crunchbase
- Enrichment only runs on published signals
- Check browser console for errors

---

## Key Concepts

**Watchlist:** Companies, keywords, and topics you care about

**Matching:** Signals are auto-matched using fuzzy search (60%+ confidence)

**Alert Threshold:** Minimum score (1-10) to trigger alerts

**Enrichment:** Automatic addition of funding data and press mentions

**Actions:** Track which signals led to real outcomes

**Precision:** % of signals that were acted upon or useful

---

## Support

- Full docs: [FEATURES.md](./FEATURES.md)
- Implementation details: [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
- Main README: [README.md](./README.md)

---

**You're all set!** 🎉

Start curating signals and let the auto-matching + alerts do the work.
