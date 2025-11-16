# ✅ Cloudflare Setup - Connection Guide

## 🎉 Status: Cloudflare Connected!

### ✅ Completed
- **Cloudflare Login:** ✅ Successfully logged in
- **Account:** doganlap@gmail.com
- **Account ID:** 66b51ac969911d4364f483d887a66c0f
- **Wrangler CLI:** ✅ Installed and authenticated
- **GitHub CLI:** ✅ Installed and authenticated
- **Build:** ✅ Complete (0.54 MB)

## 🚀 Deployment Options

### Option 1: Cloudflare Dashboard (Easiest - Recommended)

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com
   - Navigate to: **Pages** → **Create a project**

2. **Upload Assets:**
   - Choose: **"Upload assets"**
   - Select: `landing-page/dist` folder
   - Click: **"Upload and Deploy"**

3. **Configure:**
   - Set environment variables
   - Add custom domain
   - Connect GitHub (optional)

### Option 2: Wrangler CLI (Automated)

```bash
# Deploy directly
wrangler pages deploy landing-page/dist --project-name=shahin-grc-landing --commit-dirty=true
```

### Option 3: GitHub Integration (Best for CI/CD)

1. **Go to Cloudflare Dashboard:**
   - Pages → Create project → **Connect to Git**
   - Select: **GitHub**
   - **Authorize Cloudflare** (you'll accept the authorization)
   - Select repository: `www.shahin.com`

2. **Configure Build:**
   - Build command: `cd landing-page && npm install && npm run build`
   - Output directory: `landing-page/dist`
   - Root directory: `/`
   - Node version: 18

3. **Auto-Deploy:**
   - Every push to `main` → Auto deploy
   - Pull requests → Preview deployments

## 🔗 Connect GitHub to Cloudflare Pages

### Step-by-Step:

1. **Go to Cloudflare Dashboard:**
   - https://dash.cloudflare.com
   - Pages → Create a project (or select existing)

2. **Connect to Git:**
   - Click: **"Connect to Git"**
   - Select: **GitHub**
   - Browser will open for authorization
   - **Accept and authorize** Cloudflare to access GitHub
   - Select repository: `www.shahin.com`

3. **Configure Build Settings:**
   - **Framework preset:** Vite
   - **Build command:** `cd landing-page && npm install && npm run build`
   - **Build output directory:** `landing-page/dist`
   - **Root directory:** `/`
   - **Node version:** 18

4. **Set Environment Variables:**
   - Go to: Settings → Environment Variables
   - Add:
     - `VITE_API_URL` = `https://api.shahin-ai.com/api`
     - `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`

5. **Save and Deploy:**
   - Click: **"Save and Deploy"**
   - Cloudflare will build and deploy automatically

## 🚇 Setup Cloudflare Tunnel (Backend)

### Step 1: Install Cloudflared
```bash
# Windows: Download from GitHub
# Or run: SETUP_CLOUDFLARE_TUNNEL.bat
```

### Step 2: Login to Cloudflare
```bash
cloudflared tunnel login
```
- Browser opens automatically
- **Select domain:** `shahin-ai.com`
- **Accept and authorize**

### Step 3: Create Tunnel
```bash
cloudflared tunnel create shahin-backend
```

### Step 4: Configure Tunnel
Create `cloudflared-config.yml`:
```yaml
tunnel: shahin-backend
credentials-file: C:\Users\YourUsername\.cloudflared\shahin-backend.json

ingress:
  - hostname: api.shahin-ai.com
    service: http://localhost:3001
  - service: http_status:404
```

### Step 5: Route DNS
```bash
cloudflared tunnel route dns shahin-backend api.shahin-ai.com
```

### Step 6: Run Tunnel
```bash
cloudflared tunnel --config cloudflared-config.yml run
```

## 📋 Quick Commands

### Deploy Frontend
```bash
# Build
cd landing-page
npm run build

# Deploy
wrangler pages deploy landing-page/dist --project-name=shahin-grc-landing --commit-dirty=true
```

### Setup Tunnel
```bash
# Run automated setup
SETUP_CLOUDFLARE_TUNNEL.bat
```

### Check Status
```bash
# Check Cloudflare login
wrangler whoami

# Check tunnel status
cloudflared tunnel list
```

## ✅ Checklist

### Frontend Deployment
- [x] Cloudflare logged in
- [x] Build complete
- [ ] Deploy to Cloudflare Pages
- [ ] Set environment variables
- [ ] Connect GitHub repository
- [ ] Add custom domain (www.shahin-ai.com)
- [ ] Test deployment

### Backend Tunnel
- [ ] Install Cloudflared
- [ ] Login to Cloudflare
- [ ] Create tunnel
- [ ] Configure tunnel
- [ ] Route DNS
- [ ] Run tunnel
- [ ] Test backend connection

## 🎯 Next Actions

1. **Deploy Frontend:**
   - Run: `CREATE_AND_DEPLOY.bat`
   - Or upload via Cloudflare Dashboard
   - Or connect GitHub repository

2. **Setup Backend Tunnel:**
   - Run: `SETUP_CLOUDFLARE_TUNNEL.bat`
   - This connects api.shahin-ai.com to your backend

3. **Configure:**
   - Set environment variables
   - Add custom domains
   - Test deployment

## 🔐 Authorization

You've already authorized:
- ✅ Cloudflare Wrangler CLI
- ✅ GitHub CLI
- ⏳ Cloudflare Pages GitHub integration (pending)
- ⏳ Cloudflare Tunnel (pending)

## 📚 Documentation

- **Connection Guide:** `CLOUDFLARE_CONNECTION_GUIDE.md`
- **Deployment Guide:** `CLOUDFLARE_DEPLOYMENT_GUIDE.md`
- **Tunnel Setup:** `SETUP_CLOUDFLARE_TUNNEL.bat`

---

**Status:** ✅ Cloudflare Connected  
**Next:** Deploy to Cloudflare Pages  
**Run:** `CREATE_AND_DEPLOY.bat` or connect via Dashboard

