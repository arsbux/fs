# Quick Fix for Product Hunt Sync Errors

## Issue 1: Invalid Anthropic API Key ❌

**Error:** `Claude API error: 401 authentication_error`

### Fix:
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-api03-`)
6. Open your `.env.local` file
7. Replace the ANTHROPIC_API_KEY value:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_ACTUAL_KEY_HERE
```

8. **Restart your dev server** (Ctrl+C then `npm run dev`)

---

## Issue 2: Missing Database Columns ❌

**Error:** `Could not find the 'ph_comments_count' column`

### Fix:
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the ENTIRE contents of `scripts/complete-database-migration.sql`
6. Click "Run" or press Cmd/Ctrl + Enter
7. Wait for "Success" message

---

## Verify It Works

After both fixes:

1. **Restart dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

2. **Go to Product Hunt page:**
   - Navigate to http://localhost:3000/desk/producthunt
   - Click "Sync Now"

3. **Watch terminal for success:**
   ```
   ✓ Fetched 20 posts from Product Hunt
   ✓ AI analyzed Cursor 2.0: 2 people, company: Cursor
   ✓ Imported Cursor 2.0 with 2 people
   ```

---

## Still Having Issues?

### If AI key is still invalid:
- Make sure you copied the FULL key
- No extra spaces before or after
- Key should be ~100+ characters long
- Starts with `sk-ant-api03-`

### If database errors persist:
- Check Supabase logs for detailed errors
- Make sure the SQL script ran successfully
- Try running each ALTER TABLE statement individually

### If sync is working but slow:
- This is normal! AI analysis takes 2-3 seconds per product
- 20 products = ~60 seconds total
- You'll see progress in the terminal

---

## What Happens After Successful Sync?

1. **Signals created** - View at `/desk` or `/desk/producthunt`
2. **Companies extracted** - View at `/desk/companies`
3. **People extracted** - View at `/desk/people`
4. **Everything linked** - Click any company/person to see their signals

---

## Cost Info

**Anthropic API (Claude Haiku):**
- Very cheap: ~$0.01 for 20 products
- Safe to run daily

**Free tier includes:**
- $5 credit when you sign up
- Enough for ~500 syncs!
