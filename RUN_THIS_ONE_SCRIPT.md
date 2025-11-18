# 🚨 RUN THIS ONE SCRIPT 🚨

## The Problem
```
Error: permission denied for schema public (code: 42501)
```

## The Solution (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"

### Step 2: Copy & Paste This Script
Copy the ENTIRE contents of:
```
scripts/ULTIMATE_FIX.sql
```

### Step 3: Run It
1. Paste into SQL Editor
2. Click "Run" (or press Cmd/Ctrl + Enter)
3. Wait 10-15 seconds
4. You should see:
   ```
   ✅ PASS for all 5 checks
   🎉 ULTIMATE FIX COMPLETE! 🎉
   ```

### Step 4: Restart Your Server
```bash
# In terminal, press Ctrl+C to stop
# Then restart:
npm run dev
```

### Step 5: Test It
1. Go to http://localhost:3000/desk/producthunt
2. Click "Sync Now"
3. Watch terminal - you should see:
   ```
   ✓ Fetched 20 posts from Product Hunt
   ✓ AI analyzed Cursor 2.0: 2 people, company: Cursor
   ✓ Imported Cursor 2.0 with 2 people
   ```

---

## What This Script Does

The `ULTIMATE_FIX.sql` script does EVERYTHING:

1. ✅ Grants schema permissions (fixes 42501 error)
2. ✅ Grants table permissions
3. ✅ Disables Row Level Security
4. ✅ Drops all restrictive policies
5. ✅ Adds all missing columns
6. ✅ Creates people table
7. ✅ Creates indexes
8. ✅ Verifies everything worked

It's literally ONE script that fixes EVERYTHING.

---

## If You See ❌ FAIL

If any check shows ❌ FAIL:

1. **Copy the error message**
2. **Run the script again** (sometimes it needs to run twice)
3. **Check you're using the right Supabase project**

---

## After Success

Once you see all ✅ PASS:
- Your database is fully accessible
- No more permission errors
- Product Hunt sync will work
- Companies and people will be created automatically

---

## Security Note

This makes your database fully public. **Only for development!**

For production, you'll need proper RLS policies.
