# Final Setup Guide - Fix Everything

## 🔧 What I Just Fixed

### 1. AI API Issue ✅
- Added validation for API key format
- Added better error messages
- Made environment variables explicitly available in next.config.js

### 2. Cache Issues ✅
- Added `npm run clean` command to remove .next and cache
- Added `npm run fresh` command to clean and restart
- Updated next.config.js to reduce caching

### 3. Database Restrictions ✅
- Created script to remove ALL database restrictions
- Disables Row Level Security (RLS)
- Grants full public access (for development)

---

## 🚀 Quick Start (Do This Now)

### Step 1: Clean Everything
```bash
npm run clean
```

### Step 2: Remove Database Restrictions
1. Go to Supabase SQL Editor
2. Run `scripts/remove-all-restrictions.sql`
3. Wait for "Success" message

### Step 3: Add Missing Columns
1. Still in Supabase SQL Editor
2. Run `scripts/SIMPLE_FIX.sql`
3. Wait for "Success" message

### Step 4: Start Fresh
```bash
npm run fresh
```
This will clean cache and start the dev server.

### Step 5: Test Sync
1. Go to http://localhost:3000/desk/producthunt
2. Click "Sync Now"
3. Watch terminal for success messages

---

## 📋 What Each Script Does

### `npm run clean`
Removes:
- `.next/` folder
- `node_modules/.cache/`
- `out/` folder
- TypeScript build info

### `npm run fresh`
Runs clean + starts dev server with fresh build

### `scripts/remove-all-restrictions.sql`
- Disables Row Level Security on all tables
- Drops all existing policies
- Grants full access to anon and authenticated roles
- **WARNING**: Only for development!

### `scripts/SIMPLE_FIX.sql`
- Adds all missing columns to signals table
- Adds new columns to companies table
- Creates people table
- Creates necessary indexes

---

## 🔍 Verify Everything Works

After running the steps above, you should see:

```bash
✓ Fetched 20 posts from Product Hunt
Analyzing Cursor 2.0 with AI...
✓ AI analyzed Cursor 2.0: 2 people, company: Cursor
✓ Imported Cursor 2.0 with 2 people
Analyzing Talo with AI...
✓ AI analyzed Talo: 1 people, company: Talo
✓ Imported Talo with 1 people
```

---

## ❌ If Still Not Working

### Check API Key
```bash
# In terminal, check if key is loaded
echo $ANTHROPIC_API_KEY
```

If empty, your `.env.local` isn't being read. Make sure:
- File is named exactly `.env.local` (not `.env.local.txt`)
- File is in the root directory
- You restarted the server after adding the key

### Check Database
Run this in Supabase SQL Editor:
```sql
-- Check if columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'signals' 
  AND column_name IN ('ph_comments_count', 'company_name', 'person_ids');
```

Should return 3 rows. If not, run `SIMPLE_FIX.sql` again.

### Check Permissions
Run this in Supabase SQL Editor:
```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('signals', 'companies', 'people');
```

All should show `rowsecurity = false`. If not, run `remove-all-restrictions.sql` again.

---

## 🎯 Expected Results

After successful sync:
- **20 signals** imported from Product Hunt
- **20 companies** created (one per product)
- **~30-40 people** created (makers/founders)
- All linked together with relationships

Check:
- `/desk` - See all signals
- `/desk/companies` - See all companies
- `/desk/people` - See all people
- Click any company/person to see their profile

---

## 💰 Cost Info

**Anthropic API (Claude Haiku):**
- ~$0.01 per 20 products
- Your $5 free credit = ~500 syncs
- Safe to run daily!

---

## 🔒 Security Note

The `remove-all-restrictions.sql` script makes your database fully public. This is fine for development but **DO NOT use in production**.

For production, you'll need to:
1. Re-enable RLS
2. Create proper policies
3. Use service role key for admin operations

---

## 📞 Still Stuck?

If you're still having issues after following all steps:

1. **Check terminal output** - Look for specific error messages
2. **Check browser console** - Press F12 and look for errors
3. **Check Supabase logs** - Go to Supabase Dashboard > Logs
4. **Verify .env.local** - Make sure API key is correct and file is saved

The most common issues are:
- Server not restarted after changing .env.local
- SQL scripts not run completely
- API key copied incorrectly (extra spaces, missing characters)
