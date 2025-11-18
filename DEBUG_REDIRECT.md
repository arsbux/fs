# 🔍 Debug Redirect Issue

## Changes Made to Fix Redirect

### 1. **Updated AuthProvider.tsx**
- Removed `pathname` and `router` from useEffect dependencies
- Added `mounted` flag to prevent state updates on unmounted components
- This prevents the useEffect from re-running when pathname changes

### 2. **Updated app/page.tsx**
- Added check for `window.location.pathname === '/'` before redirecting
- This ensures redirect only happens when actually on root page

## How to Test

### Test 1: Check Console Logs
1. Open browser developer tools (F12)
2. Go to Console tab
3. Navigate to any page (e.g., `/desk/people`)
4. Switch to another browser tab
5. Switch back
6. **Look for**: Any console logs about redirects or navigation

### Test 2: Network Tab
1. Open developer tools → Network tab
2. Navigate to `/desk/yc`
3. Switch tabs and return
4. **Look for**: Any new network requests or page loads

### Test 3: Manual Testing
1. Go to `/desk/people`
2. Switch to another tab for 10 seconds
3. Return to the app
4. **Expected**: Should stay on `/desk/people`

## If Still Redirecting

If the issue persists, the redirect might be coming from:

### 1. **Browser Extension**
- Disable all browser extensions temporarily
- Test if redirect still happens

### 2. **Supabase Session Refresh**
- Check if Supabase is triggering session refresh on focus
- Look for network requests to Supabase auth endpoints

### 3. **Next.js Router**
- Check if Next.js router is causing navigation
- Look for any router.push calls in console

## Debug Commands

### Check Current Route
```javascript
// Run in browser console
console.log('Current pathname:', window.location.pathname);
console.log('Current href:', window.location.href);
```

### Monitor Route Changes
```javascript
// Run in browser console to monitor navigation
let originalPushState = history.pushState;
history.pushState = function() {
  console.log('Navigation detected:', arguments);
  return originalPushState.apply(history, arguments);
};
```

### Monitor Supabase Auth Events
```javascript
// Add this temporarily to AuthProvider.tsx for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, 'Session:', !!session);
  console.log('Current path:', window.location.pathname);
});
```

## Expected Behavior After Fix

- ✅ **Root page (`/`)**: Should redirect to `/desk` if logged in
- ✅ **Login page**: Should redirect to `/desk` after successful login
- ✅ **Any other page**: Should stay on current page when switching tabs
- ✅ **Sign out**: Should redirect to `/login`

## If Problem Persists

Try these additional fixes:

### 1. **Disable AuthProvider Temporarily**
Comment out the AuthProvider wrapper in `app/layout.tsx` to see if that's the cause.

### 2. **Check for Hidden Redirects**
Search for any `window.location` assignments:
```bash
grep -r "window.location" --include="*.tsx" --include="*.ts" .
```

### 3. **Check for Meta Refresh**
Look for any `<meta http-equiv="refresh">` tags in the HTML.

The changes made should fix the redirect issue by preventing unnecessary re-execution of auth logic when switching tabs.