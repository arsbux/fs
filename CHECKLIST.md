# Fix Checklist ✅

## Step 1: Fix Anthropic API Key
- [ ] Go to https://console.anthropic.com/
- [ ] Create account / Sign in
- [ ] Create new API key
- [ ] Copy the key (starts with `sk-ant-api03-`)
- [ ] Open `.env.local` file
- [ ] Update `ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE`
- [ ] Save the file

## Step 2: Fix Database Schema
- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Create New Query
- [ ] Copy contents of `scripts/complete-database-migration.sql`
- [ ] Paste into SQL Editor
- [ ] Run the query
- [ ] Wait for "Success" message

## Step 3: Restart Server
- [ ] Stop dev server (Ctrl+C in terminal)
- [ ] Run `npm run dev`
- [ ] Wait for "Ready" message

## Step 4: Test Sync
- [ ] Go to http://localhost:3000/desk/producthunt
- [ ] Click "Sync Now" button
- [ ] Watch terminal for progress
- [ ] Should see: "✓ AI analyzed..." messages
- [ ] Should see: "✓ Imported..." messages

## Success Indicators ✨

You'll know it's working when you see:
```
✓ Fetched 20 posts from Product Hunt
Analyzing Cursor 2.0 with AI...
✓ AI analyzed Cursor 2.0: 2 people, company: Cursor
✓ Imported Cursor 2.0 with 2 people
```

## If Still Failing

### API Key Issues:
- Key must start with `sk-ant-api03-`
- No spaces before/after the key
- Must be ~100+ characters long
- Restart server after changing .env.local

### Database Issues:
- Check Supabase logs for errors
- Verify all SQL statements executed
- Check that tables exist: signals, companies, people
- Verify columns exist using the SELECT queries at end of migration script

### Other Issues:
- Clear browser cache
- Check browser console for errors
- Verify Product Hunt API token is valid
- Check Supabase connection is working
