# 🔗 Cloudflare Connection Guide - Complete Setup

## Overview
This guide will help you connect your application to Cloudflare using:
1. **Cloudflare Pages** - For frontend deployment
2. **Cloudflare Tunnel** - For backend connection
3. **GitHub Integration** - For automatic deployments

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# 1. Connect to Cloudflare Pages
CONNECT_CLOUDFLARE_PAGES.bat

# 2. Setup Cloudflare Tunnel for backend
SETUP_CLOUDFLARE_TUNNEL.bat
```

### Option 2: Manual Setup
Follow the step-by-step guide below.

## 📋 Step-by-Step Setup

### Step 1: Connect GitHub to Cloudflare Pages

1. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```
   - This will open your browser
   - **Accept and authorize** the connection
   - Copy the authorization code if needed

2. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com
   - Navigate to: **Pages** → **Create a project**

3. **Connect to Git:**
   - Click: **"Connect to Git"**
   - Select: **GitHub**
   - **Authorize Cloudflare** to access GitHub
   - **Accept the authorization** in GitHub
   - Select your repository: `www.shahin.com`

4. **Configure Build Settings:**
   - **Framework preset:** Vite
   - **Build command:** `cd landing-page && npm install && npm run build`
   - **Build output directory:** `landing-page/dist`
   - **Root directory:** `/`
   - **Node version:** 18

5. **Set Environment Variables:**
   - Go to: **Settings** → **Environment Variables**
   - Add:
     - `VITE_API_URL` = `https://api.shahin-ai.com/api`
     - `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`

6. **Save and Deploy:**
   - Click: **"Save and Deploy"**
   - Cloudflare will build and deploy automatically

### Step 2: Setup Cloudflare Tunnel for Backend

1. **Install Cloudflared:**
   ```bash
   # Windows: Download from GitHub
   # Or run: SETUP_CLOUDFLARE_TUNNEL.bat (will download automatically)
   ```

2. **Login to Cloudflare:**
   ```bash
   cloudflared tunnel login
   ```
   - This will open your browser
   - **Accept and authorize** the connection
   - Select your domain: `shahin-ai.com`

3. **Create Tunnel:**
   ```bash
   cloudflared tunnel create shahin-backend
   ```

4. **Configure Tunnel:**
   Create `cloudflared-config.yml`:
   ```yaml
   tunnel: shahin-backend
   credentials-file: C:\Users\YourUsername\.cloudflared\shahin-backend.json
   
   ingress:
     - hostname: api.shahin-ai.com
       service: http://localhost:3001
     - service: http_status:404
   ```

5. **Route DNS:**
   ```bash
   cloudflared tunnel route dns shahin-backend api.shahin-ai.com
   ```

6. **Run Tunnel:**
   ```bash
   cloudflared tunnel --config cloudflared-config.yml run
   ```

### Step 3: Configure Custom Domain

1. **Frontend Domain (www.shahin-ai.com):**
   - Go to: Cloudflare Dashboard → Pages → Your Project → Custom domains
   - Add: `www.shahin-ai.com`
   - Wait for SSL certificate (< 5 minutes)

2. **Backend Domain (api.shahin-ai.com):**
   - Configured automatically via Cloudflare Tunnel
   - DNS will be routed automatically
   - SSL certificate will be provisioned automatically

## 🔐 Authorization Process

### Cloudflare Wrangler Login
1. Run: `wrangler login`
2. Browser opens automatically
3. **Accept and authorize** Cloudflare CLI
4. Authorization code is handled automatically
5. ✅ Logged in!

### Cloudflare Tunnel Login
1. Run: `cloudflared tunnel login`
2. Browser opens automatically
3. **Select your domain:** `shahin-ai.com`
4. **Accept and authorize** the connection
5. ✅ Logged in!

### GitHub to Cloudflare Pages
1. Go to: Cloudflare Dashboard → Pages → Create project → Connect to Git
2. Click: **GitHub**
3. **Authorize Cloudflare** to access GitHub
4. **Accept the authorization** in GitHub
5. Select repository
6. ✅ Connected!

## 📝 Configuration Files

### Cloudflare Tunnel Config
```yaml
# cloudflared-config.yml
tunnel: shahin-backend
credentials-file: C:\Users\YourUsername\.cloudflared\shahin-backend.json

ingress:
  - hostname: api.shahin-ai.com
    service: http://localhost:3001
  - service: http_status:404
```

### Cloudflare Pages Build Settings
- **Build command:** `cd landing-page && npm install && npm run build`
- **Output directory:** `landing-page/dist`
- **Root directory:** `/`
- **Node version:** 18

## 🔧 Environment Variables

### Frontend (Cloudflare Pages)
```
VITE_API_URL=https://api.shahin-ai.com/api
VITE_FRONTEND_URL=https://www.shahin-ai.com
```

### Backend (Local Server)
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://www.shahin-ai.com
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

## 🚀 Running the Application

### 1. Start Backend
```bash
cd backend
npm install
npm start
```
Backend runs on: `http://localhost:3001`

### 2. Start Cloudflare Tunnel
```bash
cloudflared tunnel --config cloudflared-config.yml run
```
Tunnel connects: `api.shahin-ai.com` → `localhost:3001`

### 3. Frontend (Auto-deployed)
- Frontend is automatically deployed to Cloudflare Pages
- Accessible at: `https://www.shahin-ai.com`
- Auto-deploys on every Git push

## ✅ Verification

### Check Frontend
1. Visit: `https://www.shahin-ai.com`
2. Verify page loads
3. Test AI agent
4. Check browser console for errors

### Check Backend
1. Visit: `https://api.shahin-ai.com/api/health`
2. Verify API responds
3. Test endpoints
4. Check CORS configuration

### Check Tunnel
1. Check tunnel status: `cloudflared tunnel list`
2. Verify tunnel is running: `cloudflared tunnel info shahin-backend`
3. Test API endpoint: `curl https://api.shahin-ai.com/api/health`

## 🔄 Automatic Deployments

### GitHub to Cloudflare Pages
- **Push to main branch** → Automatic production deployment
- **Create pull request** → Preview deployment
- **Merge pull request** → Production deployment

### Cloudflare Tunnel
- **Always running** when you run the tunnel command
- **Automatic reconnection** if connection drops
- **SSL automatically managed** by Cloudflare

## 🆘 Troubleshooting

### Authorization Issues
- **Wrangler login failed:** Check internet connection, try again
- **Tunnel login failed:** Make sure you select the correct domain
- **GitHub authorization failed:** Check GitHub permissions

### Connection Issues
- **Tunnel not connecting:** Check backend is running on localhost:3001
- **DNS not resolving:** Wait a few minutes for DNS propagation
- **SSL certificate issues:** Wait for certificate provisioning (< 5 minutes)

### Deployment Issues
- **Build failed:** Check build logs in Cloudflare Dashboard
- **Environment variables not working:** Verify variables are set correctly
- **CORS errors:** Check backend CORS configuration

## 📚 Additional Resources

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Cloudflare Tunnel Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/

## 🎯 Quick Commands

```bash
# Login to Cloudflare
wrangler login
cloudflared tunnel login

# Deploy to Cloudflare Pages
wrangler pages deploy landing-page/dist --project-name=shahin-grc-landing

# Create tunnel
cloudflared tunnel create shahin-backend

# Run tunnel
cloudflared tunnel --config cloudflared-config.yml run

# Check tunnel status
cloudflared tunnel list
cloudflared tunnel info shahin-backend
```

## ✅ Checklist

- [ ] Wrangler installed and logged in
- [ ] Cloudflared installed and logged in
- [ ] GitHub repository connected to Cloudflare Pages
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain configured (www.shahin-ai.com)
- [ ] Cloudflare Tunnel created and configured
- [ ] Backend running on localhost:3001
- [ ] Tunnel running and connected
- [ ] DNS configured (api.shahin-ai.com)
- [ ] SSL certificates active
- [ ] Frontend deployed and accessible
- [ ] Backend accessible via tunnel
- [ ] All features tested and working

---

**Status:** Ready for Cloudflare connection  
**Next:** Run `CONNECT_CLOUDFLARE_PAGES.bat` to start setup

