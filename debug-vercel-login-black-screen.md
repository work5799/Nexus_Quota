# Debug Session: vercel-login-black-screen

## Status: [FIXED]

## Problem
On Vercel, after entering email and password in the login form, the screen turns black instead of logging in. Local development works perfectly.

## Root Cause Identified
The `vercel.json` had a problematic rewrite rule:
```json
{ "source": "/api/(.*)", "destination": "/api/$1" }
```

This was a **no-op rewrite** that actually broke API routing! Vercel's auto-detection of files in `/api` was being overridden by this rewrite, which sent requests to `/api/auth/login` back to itself, but then the catch-all `"/(.*)"` rewrite intercepted it and returned `index.html` (the React app shell).

The frontend was getting HTML back from a JSON API call, causing axios to throw a parse error. The `useEffect` kept `loading=true` because it couldn't extract user data from the HTML response, resulting in the black loading screen.

## Fix Applied

### 1. Fixed `vercel.json`
Changed the rewrites to use a negative lookahead that excludes `/api/*`:
```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

This allows Vercel to auto-detect and serve `/api/auth/login.js` correctly, while still rewriting all other paths to `index.html` for client-side routing.

### 2. Hardened `client/src/App.jsx`
Added validation in the `/auth/me` response handler so that if the response doesn't contain a user object (which happens when API fails), we clear the token and don't get stuck loading.

### 3. Hardened `client/src/pages/Login.jsx`
Added better error handling to show toast errors when login fails (e.g., due to API misconfiguration or network errors).

## Verification Steps for User

1. **Clear browser localStorage**: Open DevTools (F12) → Application → Local Storage → Delete the `token` entry
2. **Redeploy to Vercel** with the updated `vercel.json`
3. **Try login again** with `rayhan5799@gmail.com` / `Rayhan5799@#`

## Important Prerequisites (User Must Complete)

1. **Run `supabase.sql` in Supabase SQL Editor** to add the `role` and `is_approved` columns
2. **Set Vercel Environment Variables**:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
3. **Create super admin** by POSTing to `/api/seed-admin` after deployment