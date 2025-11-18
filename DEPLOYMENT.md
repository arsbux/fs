# Deployment Guide

## Production Deployment Checklist

### 1. Environment Variables

Create `.env.local` (or configure in your hosting platform):

```bash
# Required
PRODUCT_HUNT_API_TOKEN=your_ph_token

# Optional but recommended
CRUNCHBASE_API_KEY=your_crunchbase_key

# Supabase (if using auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Anthropic (if using AI features)
ANTHROPIC_API_KEY=your_anthropic_key
```

**Note:** Slack webhooks are configured per-user in the UI, not in env vars.

---

### 2. Data Directory Setup

Ensure the `data/` directory exists and is writable:

```bash
mkdir -p data
chmod 755 data
```

Required files (auto-created on first run):
- `data/signals.json`
- `data/companies.json`
- `data/users.json`
- `data/watchlists.json`

---

### 3. Build & Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

Or deploy to Vercel:

```bash
vercel deploy --prod
```

---

### 4. Setup Cron Jobs (for Digests)

If using daily/weekly digests, setup cron jobs on your server:

```bash
# Edit crontab
crontab -e

# Add these lines:
# Daily digest at 9 AM
0 9 * * * cd /path/to/foundersignal && npm run send-daily-digest >> /var/log/foundersignal-daily.log 2>&1

# Weekly digest Monday 9 AM
0 9 * * 1 cd /path/to/foundersignal && npm run send-weekly-digest >> /var/log/foundersignal-weekly.log 2>&1
```

**Alternative:** Use a service like GitHub Actions, Vercel Cron, or AWS EventBridge.

#### GitHub Actions Example:

Create `.github/workflows/digests.yml`:

```yaml
name: Send Digests

on:
  schedule:
    # Daily at 9 AM UTC
    - cron: '0 9 * * *'
    # Weekly Monday 9 AM UTC
    - cron: '0 9 * * 1'

jobs:
  send-digests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run send-daily-digest
        if: github.event.schedule == '0 9 * * *'
      - run: npm run send-weekly-digest
        if: github.event.schedule == '0 9 * * 1'
```

---

### 5. Database Migration (Optional)

For production, consider migrating from JSON files to a real database:

**Recommended:** PostgreSQL with Supabase

1. Create tables:
```sql
CREATE TABLE signals (
  id TEXT PRIMARY KEY,
  headline TEXT NOT NULL,
  summary TEXT,
  source_link TEXT,
  score INTEGER,
  credibility TEXT,
  signal_type TEXT,
  tags TEXT[],
  company_id TEXT,
  company_name TEXT,
  status TEXT,
  created_at TIMESTAMP,
  published_at TIMESTAMP,
  matched_watchlists TEXT[],
  match_reason TEXT,
  match_scores FLOAT[],
  -- Enrichment fields
  ph_votes_count INTEGER,
  cb_funding_total BIGINT,
  press_mentions JSONB,
  user_actions JSONB
);

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  tags TEXT[],
  keywords TEXT[],
  created_at TIMESTAMP
);

CREATE TABLE watchlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  company_ids TEXT[],
  keywords TEXT[],
  topics TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT,
  slack_webhook_url TEXT,
  alert_threshold INTEGER DEFAULT 6,
  digest_schedule TEXT DEFAULT 'realtime',
  created_at TIMESTAMP
);
```

2. Update `lib/storage.ts` to use Supabase client instead of file system

---

### 6. Monitoring & Logging

**Recommended tools:**
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Datadog** for APM

**Key metrics to monitor:**
- Signal creation rate
- Watchlist match rate
- Slack webhook success rate
- Enrichment API success rate
- User action rate

**Setup basic logging:**

```typescript
// lib/logger.ts
export const logger = {
  info: (msg: string, data?: any) => {
    console.log(`[INFO] ${msg}`, data);
    // Send to logging service
  },
  error: (msg: string, error?: any) => {
    console.error(`[ERROR] ${msg}`, error);
    // Send to Sentry
  },
  metric: (name: string, value: number) => {
    console.log(`[METRIC] ${name}: ${value}`);
    // Send to Datadog
  },
};
```

---

### 7. Security Checklist

- [ ] Enable HTTPS (required for webhooks)
- [ ] Add rate limiting to API routes
- [ ] Validate all user inputs
- [ ] Sanitize webhook URLs
- [ ] Add CORS headers if needed
- [ ] Enable CSP headers
- [ ] Rotate API keys regularly
- [ ] Add authentication (Supabase Auth recommended)
- [ ] Implement RBAC (admin vs user roles)

---

### 8. Performance Optimization

**Caching:**
```typescript
// Cache Crunchbase data for 24 hours
// Cache Google News for 1 hour
// Cache watchlist matches for 5 minutes
```

**Database indexes:**
```sql
CREATE INDEX idx_signals_status ON signals(status);
CREATE INDEX idx_signals_score ON signals(score);
CREATE INDEX idx_signals_company ON signals(company_id);
CREATE INDEX idx_watchlists_user ON watchlists(user_id);
```

**CDN:**
- Deploy static assets to CDN
- Use Next.js Image optimization
- Enable gzip compression

---

### 9. Backup Strategy

**Daily backups:**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
tar -czf backups/data-$DATE.tar.gz data/
# Upload to S3 or similar
aws s3 cp backups/data-$DATE.tar.gz s3://your-bucket/backups/
```

**Automated backups:**
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

---

### 10. User Onboarding

**First-time setup flow:**
1. Welcome screen
2. Create watchlist (guided)
3. Setup Slack webhook (with instructions)
4. Test alert
5. View sample signals

**Email templates:**
- Welcome email with setup guide
- Weekly summary of matched signals
- Monthly precision report

---

## Scaling Considerations

### When to scale:

**Signals:**
- < 1,000 signals: JSON files OK
- 1,000 - 10,000: Migrate to PostgreSQL
- > 10,000: Add caching layer (Redis)

**Users:**
- < 10 users: Single server OK
- 10 - 100: Add load balancer
- > 100: Horizontal scaling + queue system

**Matching:**
- < 100 watchlists: In-memory matching OK
- 100 - 1,000: Background job queue
- > 1,000: Dedicated matching service

---

## Cost Estimates

**Free tier:**
- Vercel hosting: Free
- Supabase: Free (up to 500MB)
- Google News RSS: Free
- Slack webhooks: Free

**Paid services:**
- Crunchbase API: $29/month (Basic)
- Product Hunt API: Free
- Anthropic API: Pay-per-use (~$0.01/signal)

**Total:** ~$30-50/month for small team

---

## Rollback Plan

If deployment fails:

1. **Revert code:**
   ```bash
   git revert HEAD
   vercel deploy --prod
   ```

2. **Restore data:**
   ```bash
   tar -xzf backups/data-YYYYMMDD.tar.gz
   ```

3. **Check logs:**
   ```bash
   vercel logs
   ```

4. **Notify users:**
   - Post in Slack
   - Send status email

---

## Post-Deployment Checklist

- [ ] Verify all pages load
- [ ] Test signal creation
- [ ] Test watchlist matching
- [ ] Send test Slack alert
- [ ] Check enrichment APIs
- [ ] Monitor error logs
- [ ] Test action tracking
- [ ] Verify cron jobs running
- [ ] Check database backups
- [ ] Update documentation

---

## Support & Maintenance

**Weekly tasks:**
- Review error logs
- Check API rate limits
- Monitor webhook success rate
- Review user feedback

**Monthly tasks:**
- Update dependencies
- Review security advisories
- Analyze precision metrics
- Optimize slow queries

**Quarterly tasks:**
- Review and rotate API keys
- Audit user permissions
- Performance testing
- Capacity planning

---

## Emergency Contacts

- **Hosting:** Vercel support
- **Database:** Supabase support
- **APIs:** Check status pages
  - Crunchbase: status.crunchbase.com
  - Slack: status.slack.com

---

**Deployment complete!** 🚀

Monitor the first 24 hours closely and gather user feedback.
