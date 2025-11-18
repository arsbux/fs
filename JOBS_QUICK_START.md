# High Signal Jobs - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Migration
```sql
-- Copy and run in Supabase SQL Editor
-- File: scripts/add-jobs-fields.sql
```

This adds job-specific fields to your signals table:
- `job_count` - Number of jobs
- `departments` - Hiring departments array
- `seniority_levels` - Experience levels array
- `total_budget_estimate` - Estimated hiring budget
- `growth_indicator` - Growth momentum (high/medium/low)

### Step 2: Sync Jobs
1. Go to **Admin Dashboard** → `/admin/jobs`
2. Click the **"Sync Jobs"** button
3. Wait for sync to complete (usually 10-30 seconds)
4. Review the results:
   - Jobs found per source
   - Signals created
   - Sync timestamp

### Step 3: View Hiring Signals
1. Go to **Desk** → `/desk/jobs` or click "High Signal Jobs" in sidebar
2. Browse hiring signals
3. Use filters to focus on:
   - Hiring Spikes
   - Executive Hires
   - New Departments
   - Rapid Expansion

## 📊 What You'll See

### Hiring Signal Types

**🚀 Rapid Expansion** (10+ jobs)
- Company is scaling fast
- High growth momentum
- Likely well-funded

**👔 Executive Hire** (C-level/VP)
- Leadership team building
- Strategic pivot or scaling
- High-value signal

**🏢 New Department** (4+ departments)
- Expanding into new areas
- Sustainable growth
- Diversifying operations

**📈 Hiring Spike** (Multiple jobs)
- Increased hiring activity
- Growth phase
- Market opportunity

**🎯 First Hire** (1 job)
- Early-stage company
- Just starting to scale
- Watch for future growth

## 💡 How to Use the Data

### For Investors
- Track portfolio company hiring
- Identify high-growth startups
- Monitor market trends
- Spot investment opportunities

### For Job Seekers
- Find fast-growing companies
- Identify hiring companies
- Track career opportunities
- Research company growth

### For Competitors
- Monitor competitor hiring
- Track market expansion
- Identify strategic moves
- Benchmark growth rates

### For Partners
- Find partnership opportunities
- Track company scaling
- Identify integration targets
- Monitor market leaders

## 🎯 Signal Scores Explained

**8-10**: Exceptional signal
- Rapid expansion or major hiring
- High budget estimates
- Multiple departments
- **Action**: Immediate attention

**6-7**: Strong signal
- Significant hiring activity
- Good growth indicators
- **Action**: Add to watchlist

**4-5**: Moderate signal
- Normal hiring patterns
- Steady growth
- **Action**: Monitor periodically

**1-3**: Weak signal
- Limited hiring
- Early stage or slow growth
- **Action**: Note for reference

## 🔄 Sync Frequency

**Recommended:**
- Daily for active monitoring
- Weekly for general tracking
- Real-time for critical companies

**Manual Sync:**
- Go to `/admin/jobs`
- Click "Sync Jobs"
- Review results

## 📈 Growth Indicators

**🟢 High Growth**
- 5+ jobs OR $500K+ budget
- Strong expansion signal
- High priority

**🟡 Medium Growth**
- 2-4 jobs OR $200K-500K budget
- Steady growth
- Monitor closely

**🔵 Low Growth**
- 1 job OR <$200K budget
- Early stage or slow growth
- Track for changes

## 🎨 UI Features

### Admin Dashboard (`/admin/jobs`)
- One-click sync button
- Source breakdown (YC, Wellfound, RemoteOK)
- Real-time results
- Error handling
- Sync history

### User Dashboard (`/desk/jobs`)
- All hiring signals
- Filter by type
- Rich signal cards
- Job details (count, departments, budget)
- Growth indicators
- Company links

## 🔍 Data Sources

**YC Jobs** (~30% of jobs)
- Y Combinator companies
- High-quality startups
- Official source

**Wellfound** (~40% of jobs)
- AngelList startups
- Funding data included
- Venture-backed companies

**RemoteOK** (~30% of jobs)
- YC-tagged remote jobs
- Global opportunities
- Community-driven

## ⚡ Quick Tips

1. **Run sync daily** for fresh data
2. **Filter by "Rapid Expansion"** for hottest companies
3. **Track executive hires** for strategic insights
4. **Monitor budget estimates** for funding signals
5. **Use growth indicators** to prioritize

## 🐛 Troubleshooting

**No signals appearing?**
- Run database migration first
- Sync jobs from admin dashboard
- Check browser console for errors

**Sync fails?**
- Check internet connection
- Verify Supabase is connected
- Review error message

**Wrong data?**
- Re-run sync
- Check source websites
- Report issues

## 📚 Learn More

- Full documentation: `HIGH_SIGNAL_JOBS_COMPLETE.md`
- Database schema: `scripts/add-jobs-fields.sql`
- Integration code: `lib/jobs.ts`

## ✅ Success Checklist

- [ ] Database migration completed
- [ ] First job sync successful
- [ ] Signals visible on dashboard
- [ ] Filters working correctly
- [ ] Signal scores make sense
- [ ] Ready to use!

---

**Need Help?** Check the full documentation or review the code in `lib/jobs.ts`
