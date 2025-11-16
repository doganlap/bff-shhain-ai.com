# Set Environment Variables in Cloudflare Pages

## Quick Guide

### Step 1: Open Cloudflare Dashboard
**URL**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/environment-variables

### Step 2: Add Environment Variables

1. **Navigate to Settings:**
   - Go to: **Pages** → **shahin-grc-landing** → **Settings**
   - Click: **Environment variables**

2. **Add Variables for Production:**
   - Click: **Add variable**
   - Add:
     - **Variable name**: `VITE_API_URL`
     - **Value**: `https://api.shahin-ai.com/api`
     - **Environment**: Production
   - Click: **Save**
   
   - Click: **Add variable** again
   - Add:
     - **Variable name**: `VITE_FRONTEND_URL`
     - **Value**: `https://www.shahin-ai.com`
     - **Environment**: Production
   - Click: **Save**

3. **Verify:**
   - Both variables should appear in the list
   - Status: ✅ Active

### Step 3: Redeploy

After adding environment variables, you need to trigger a new deployment:

1. **Option A: Trigger Manual Deployment**
   - Go to: **Deployments**
   - Click: **Create deployment**
   - Select: **Production**
   - Click: **Deploy**

2. **Option B: Push to GitHub** (if connected)
   - Make a small change (or empty commit)
   - Push to `master` branch
   - Cloudflare will auto-deploy

3. **Option C: Redeploy via Wrangler**
   ```bash
   wrangler pages deploy landing-page/dist --project-name=shahin-grc-landing
   ```

## Environment Variables Required

### Production
- `VITE_API_URL` = `https://api.shahin-ai.com/api`
- `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`

### Preview (Optional)
- `VITE_API_URL` = `https://api.shahin-ai.com/api`
- `VITE_FRONTEND_URL` = `https://shahin-grc-landing.pages.dev`

## Verify Environment Variables

After deployment, verify the variables are working:

1. **Check Deployment Logs:**
   - Go to: **Deployments** → Latest deployment → **View build log**
   - Look for: Environment variables loaded

2. **Test in Browser:**
   - Open: https://shahin-grc-landing.pages.dev
   - Open browser console (F12)
   - Check: `import.meta.env.VITE_API_URL`
   - Should show: `https://api.shahin-ai.com/api`

## Troubleshooting

### Variables Not Working
- ✅ Check variable names (must start with `VITE_`)
- ✅ Check environment (Production vs Preview)
- ✅ Redeploy after adding variables
- ✅ Clear browser cache

### Build Fails
- ✅ Check variable values (no trailing spaces)
- ✅ Check variable names (case-sensitive)
- ✅ Check build logs for errors

## Quick Links

- **Environment Variables**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/environment-variables
- **Deployments**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/deployments
- **Project Settings**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings

## Script

Run the automated setup script:
```bash
COMPLETE_CLOUDFLARE_SETUP.bat
```

This will open all the necessary pages and guide you through the setup.

