# Vercel Deployment Guide

## ✅ Build Test Passed
The project builds successfully with no errors.

## 🚀 Deploy to Vercel

### Step 1: Import Project
1. Go to https://vercel.com/new
2. Import from GitHub: `arsbux/fs`
3. Vercel will auto-detect Next.js

### Step 2: Configure Environment Variables
Add these in Vercel dashboard under "Environment Variables":

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://rafddhfuidgiamkxdqyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Product Hunt
PRODUCT_HUNT_API_KEY=your_product_hunt_key
PRODUCT_HUNT_API_SECRET=your_product_hunt_secret

# Site URL
NEXT_PUBLIC_SITE_URL=https://fs.flightlabs.agency
```

### Step 3: Configure Custom Domain
1. In Vercel project settings → Domains
2. Add domain: `fs.flightlabs.agency`
3. Follow DNS configuration instructions
4. Add these DNS records to your domain:
   - Type: `CNAME`
   - Name: `fs`
   - Value: `cname.vercel-dns.com`

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Your site will be live at `https://fs.flightlabs.agency`

## Post-Deployment

### Update Supabase Settings
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Update Site URL: `https://fs.flightlabs.agency`
3. Add Redirect URLs:
   - `https://fs.flightlabs.agency/desk`
   - `https://fs.flightlabs.agency/**`

### Update Google OAuth
1. Go to Google Cloud Console
2. Add authorized redirect URI:
   - `https://rafddhfuidgiamkxdqyg.supabase.co/auth/v1/callback`
3. Add authorized domain: `flightlabs.agency`

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Review build logs in Vercel dashboard

### OAuth Not Working
- Verify Site URL in Supabase matches your domain
- Check redirect URLs are configured
- Clear browser cache and try again

### API Errors
- Verify all API keys are set in Vercel environment variables
- Check API key permissions and quotas

## Repository
- GitHub: https://github.com/arsbux/fs
- Branch: main
- Framework: Next.js 14
- Node Version: 18.x (auto-detected)

## Success Checklist
- [ ] Project imported to Vercel
- [ ] Environment variables configured
- [ ] Custom domain added
- [ ] DNS configured
- [ ] First deployment successful
- [ ] Supabase URLs updated
- [ ] Google OAuth configured
- [ ] Test login works
- [ ] Test data syncing works
