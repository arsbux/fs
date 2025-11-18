# How to Get a Valid Anthropic API Key

## Current Status
Your current API key is **invalid**. The app works without AI, but to enable AI analysis, you need a valid key.

## Get a Valid Key (5 minutes)

### Step 1: Go to Anthropic Console
https://console.anthropic.com/

### Step 2: Sign Up / Sign In
- Use your email
- Verify your email
- Complete signup

### Step 3: Add Payment Method
⚠️ **Important**: Anthropic requires a payment method, but:
- You get **$5 free credit**
- Each sync costs ~$0.01
- $5 = ~500 syncs
- You can set spending limits

### Step 4: Create API Key
1. Go to "API Keys" section
2. Click "Create Key"
3. Copy the key (starts with `sk-ant-api03-`)
4. Save it somewhere safe

### Step 5: Add to .env.local
```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_ACTUAL_KEY_HERE
```

### Step 6: Restart Server
```bash
npm run dev
```

### Step 7: Test
1. Go to `/desk/producthunt`
2. Click "Sync Now"
3. Watch terminal - should see:
   ```
   ✅ AI enabled - will use Claude for analysis
   🤖 Analyzing Cursor 2.0 with AI...
   ✅ AI analyzed: 2 people, company: Cursor
   ```

---

## Without AI (Current State)

The app works perfectly without AI:
- ✅ Extracts companies from Product Hunt
- ✅ Extracts people (makers)
- ✅ Creates signals
- ✅ Links everything together
- ✅ Completely free

**What you're missing:**
- AI-enhanced descriptions
- Better company/person extraction
- Smarter signal analysis
- More accurate role identification

---

## With AI (After Adding Valid Key)

AI makes the data better:
- 🤖 Smarter company descriptions
- 🤖 Better role identification (CEO, CTO, etc.)
- 🤖 Enhanced signal analysis
- 🤖 More relevant tags
- 🤖 Better "why it matters" text

---

## Cost Breakdown

**Per sync (20 products):**
- Input: ~10,000 tokens = $0.0025
- Output: ~5,000 tokens = $0.0063
- **Total: ~$0.01 per sync**

**With $5 credit:**
- ~500 syncs
- Daily sync for 1.5 years
- Very affordable!

---

## Alternative: Keep Using Without AI

If you don't want to add a payment method:
- The app works great without AI
- All features work
- Data quality is still good
- Completely free forever

Just ignore the "AI disabled" message in the terminal.

---

## Troubleshooting

### "Invalid API key" error
- Make sure key starts with `sk-ant-api03-`
- No spaces before/after
- Key should be ~100+ characters
- Restart server after adding

### "Payment required" error
- Add payment method to Anthropic account
- Even with $0 balance, you get $5 free credit

### Still not working?
- Check Anthropic console for API key status
- Verify key is active (not revoked)
- Check spending limits aren't set to $0
