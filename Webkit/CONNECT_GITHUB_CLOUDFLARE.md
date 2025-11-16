# Connect GitHub to Cloudflare Pages

## Quick Guide

### Step 1: Open Cloudflare Dashboard
**URL**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/git

### Step 2: Connect GitHub Repository

1. **Navigate to Git Settings:**
   - Go to: **Pages** → **shahin-grc-landing** → **Settings**
   - Click: **Connect to Git**

2. **Authorize Cloudflare:**
   - Select: **GitHub**
   - Click: **Authorize Cloudflare**
   - Browser opens for authorization
   - Click: **Authorize** (grant permissions)
   - Return to Cloudflare Dashboard

3. **Select Repository:**
   - Repository: **doganlap/shahin-landing**
   - Click: **Begin setup**

4. **Configure Build Settings:**
   - **Production branch**: `master`
   - **Framework preset**: `Vite`
   - **Build command**: `cd landing-page && npm install && npm run build`
   - **Output directory**: `landing-page/dist`
   - **Root directory**: `/` (leave empty)
   - **Node version**: `18`

5. **Set Environment Variables:**
   - Click: **Environment variables**
   - Add:
     - `VITE_API_URL` = `https://api.shahin-ai.com/api`
     - `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`
   - Click: **Save**

6. **Deploy:**
   - Click: **Save and Deploy**
   - Cloudflare will build and deploy automatically
   - Wait for build to complete (~2-3 minutes)

## Benefits of GitHub Connection

### Automatic Deployments
- ✅ **Push to master** → Auto deploy to production
- ✅ **Pull requests** → Preview deployments
- ✅ **Every commit** → Automatic build and deploy

### Preview Deployments
- ✅ **Pull requests** → Get preview URL
- ✅ **Branch deployments** → Test before merging
- ✅ **Review changes** → Before production

### Build History
- ✅ **Build logs** → View build history
- ✅ **Deployment history** → Track all deployments
- ✅ **Rollback** → Easy rollback to previous version

## Configuration

### Build Settings
- **Build command**: `cd landing-page && npm install && npm run build`
- **Output directory**: `landing-page/dist`
- **Root directory**: `/`
- **Node version**: `18`

### Environment Variables
- `VITE_API_URL` = `https://api.shahin-ai.com/api`
- `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`

### Branch Settings
- **Production branch**: `master`
- **Preview deployments**: Enabled
- **Auto-deploy**: Enabled

## Troubleshooting

### Authorization Failed
- ✅ Check GitHub permissions
- ✅ Re-authorize Cloudflare
- ✅ Verify repository access

### Build Fails
- ✅ Check build logs
- ✅ Verify build command
- ✅ Check Node version
- ✅ Verify output directory

### Deployment Not Triggered
- ✅ Check branch name (must be `master`)
- ✅ Verify Git connection
- ✅ Check build settings

## Quick Links

- **Git Settings**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/git
- **Deployments**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/deployments
- **Build Logs**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/deployments

## Script

Run the automated setup script:
```bash
COMPLETE_CLOUDFLARE_SETUP.bat
```

This will open all the necessary pages and guide you through the setup.

## After Connection

Once GitHub is connected:
1. ✅ Every push to `master` → Auto deploy
2. ✅ Pull requests → Preview deployments
3. ✅ Build history → Track all builds
4. ✅ Easy rollback → Previous versions

No more manual deployments needed! 🎉

