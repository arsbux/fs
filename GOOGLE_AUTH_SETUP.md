# Google OAuth Setup Guide

## Issue
Google OAuth is showing your Supabase database URL instead of your app name.

## Solution

### 1. Configure Supabase Authentication Settings

Go to your Supabase Dashboard:
https://supabase.com/dashboard/project/rafddhfuidgiamkxdqyg/auth/url-configuration

**Set the following:**

- **Site URL**: `https://fs.flightlabs.agency`
- **Redirect URLs** (add these):
  - `https://fs.flightlabs.agency/desk`
  - `https://fs.flightlabs.agency/**` (wildcard for all routes)
  - `http://localhost:3000/desk` (for local development)
  - `http://localhost:3000/**` (for local development)

### 2. Configure Google OAuth Provider

In Supabase Dashboard:
1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console

### 3. Set up Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - **Application name**: FounderSignal
   - **Authorized domains**: Add your domain
6. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: FounderSignal
   - **Authorized domains**: `flightlabs.agency`
   - **Authorized redirect URIs**: 
     - `https://rafddhfuidgiamkxdqyg.supabase.co/auth/v1/callback`
     - `https://fs.flightlabs.agency/auth/callback`
     - `http://localhost:3000/auth/callback` (for local testing)

### 4. Update Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_SITE_URL=https://fs.flightlabs.agency
```

For local development, you can use:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Restart Your Development Server

```bash
npm run dev
```

## Testing

1. Go to https://fs.flightlabs.agency/login
2. Click "Continue with Google"
3. You should now see "FounderSignal" instead of the Supabase URL

## Troubleshooting

**Still seeing Supabase URL?**
- Clear your browser cache and cookies
- Make sure you saved the Site URL in Supabase dashboard
- Wait a few minutes for changes to propagate
- Restart your dev server

**OAuth error?**
- Verify redirect URLs match exactly in both Google Console and Supabase
- Check that Google OAuth is enabled in Supabase
- Ensure Client ID and Secret are correct

## Quick Setup Checklist

- [ ] Set Site URL in Supabase to `https://fs.flightlabs.agency`
- [ ] Add redirect URLs in Supabase:
  - `https://fs.flightlabs.agency/desk`
  - `https://fs.flightlabs.agency/**`
- [ ] Enable Google provider in Supabase
- [ ] Add Google Client ID and Secret in Supabase
- [ ] Add authorized redirect URI in Google Console: `https://rafddhfuidgiamkxdqyg.supabase.co/auth/v1/callback`
- [ ] Set authorized domain in Google Console: `flightlabs.agency`
- [ ] Update `.env.local` with `NEXT_PUBLIC_SITE_URL=https://fs.flightlabs.agency`
- [ ] Restart your server

