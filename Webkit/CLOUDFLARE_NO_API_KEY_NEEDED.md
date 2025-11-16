# Cloudflare Setup - No API Keys Needed! ✅

## Good News: No API Keys Required!

You **DO NOT** need to provide Cloudflare API keys. Everything is done through the Cloudflare Dashboard using secure OAuth authentication.

## How Cloudflare Authentication Works

### 1. **Cloudflare Pages (Frontend)**
- ✅ Connect via **GitHub OAuth** in Cloudflare Dashboard
- ✅ No API keys needed
- ✅ Automatic deployments on Git push
- ✅ Free SSL certificates automatically

### 2. **Cloudflare Tunnel (Backend)**
- ✅ Use `cloudflared` CLI with browser login
- ✅ No API keys needed
- ✅ Secure tunnel to your local backend
- ✅ Free SSL certificates automatically

## Setup Steps (No API Keys!)

### Step 1: Push Code to GitHub
```bash
# Fix secrets and push
FIX_AND_PUSH.bat
```

### Step 2: Connect GitHub to Cloudflare Pages
1. Go to: https://dash.cloudflare.com
2. Click: **Pages** → **Create a project**
3. Click: **Connect to Git**
4. Select: **GitHub**
5. Authorize Cloudflare (browser opens automatically)
6. Select repository: **doganlap/shahin-landing**
7. Click: **Begin setup**

### Step 3: Configure Build Settings
- **Project name**: `shahin-grc-landing`
- **Production branch**: `master`
- **Framework preset**: `Vite`
- **Build command**: `cd landing-page && npm install && npm run build`
- **Build output directory**: `landing-page/dist`
- **Root directory**: `/` (leave empty)
- **Node version**: `18`

### Step 4: Set Environment Variables
Click **Environment variables** and add:
- `VITE_API_URL` = `https://api.shahin-ai.com/api`
- `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`

### Step 5: Deploy!
- Click: **Save and Deploy**
- Cloudflare will build and deploy automatically
- Wait 2-3 minutes for build to complete

### Step 6: Add Custom Domain
1. Go to: **Custom domains**
2. Add: `www.shahin-ai.com`
3. Wait for SSL certificate (< 5 minutes)

## Cloudflare Tunnel Setup (Backend)

### Option 1: Using Cloudflare Dashboard (Easiest)
1. Go to: https://one.dash.cloudflare.com
2. Click: **Zero Trust** → **Networks** → **Tunnels**
3. Click: **Create a tunnel**
4. Select: **Cloudflared** (local)
5. Follow the instructions to install and run `cloudflared`
6. Configure tunnel to point to `localhost:3001`
7. Add public hostname: `api.shahin-ai.com`

### Option 2: Using CLI (Alternative)
```bash
# Install cloudflared
winget install --id Cloudflare.cloudflared

# Login (browser opens automatically)
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create shahin-api

# Run tunnel
cloudflared tunnel run shahin-api
```

## What You Need

✅ **Cloudflare Account** (free tier works)
- Sign up: https://dash.cloudflare.com/sign-up
- Free plan includes:
  - Unlimited requests
  - Free SSL certificates
  - Global CDN
  - DDoS protection

✅ **GitHub Account** (already have)
- Repository: https://github.com/doganlap/shahin-landing

✅ **Domain** (optional, can use Cloudflare subdomain)
- `www.shahin-ai.com` (your domain)
- Or use: `shahin-grc-landing.pages.dev` (free Cloudflare subdomain)

## Security Notes

🔒 **All authentication is done through:**
- OAuth (browser-based, secure)
- No API keys stored in code
- No credentials in git repository
- All secrets in local `.env` file (gitignored)

## Quick Start Scripts

1. **Fix and push to GitHub:**
   ```bash
   FIX_AND_PUSH.bat
   ```

2. **Connect to Cloudflare Pages:**
   ```bash
   CONNECT_CLOUDFLARE.shahin-landing.bat
   ```

3. **Set up Cloudflare Tunnel (backend):**
   ```bash
   SETUP_CLOUDFLARE_TUNNEL.bat
   ```

## Troubleshooting

### "Permission denied" when pushing to GitHub
- ✅ Already fixed: Authenticated as `doganlap`
- Run: `gh auth status` to verify

### "Secrets detected" when pushing
- ✅ Allow in GitHub UI: https://github.com/doganlap/shahin-landing/security/secret-scanning
- Or: Secrets are now removed from code (use `.env` file)

### "Repository not found"
- ✅ Repository exists: https://github.com/doganlap/shahin-landing
- Verify you're logged in as `doganlap`

## Next Steps

1. ✅ Fix secrets in code (done)
2. ✅ Push to GitHub (run `FIX_AND_PUSH.bat`)
3. ⏳ Connect to Cloudflare Pages (Dashboard)
4. ⏳ Set up Cloudflare Tunnel (backend)
5. ⏳ Configure AI services (add API keys to local `.env`)

## Summary

🎉 **No API keys needed for Cloudflare!**
- Authentication: OAuth (browser-based)
- Security: Industry-standard OAuth flow
- Setup: 5 minutes in Dashboard
- Cost: Free (Cloudflare Pages free tier)

Just connect GitHub to Cloudflare in the Dashboard, and you're done! 🚀

