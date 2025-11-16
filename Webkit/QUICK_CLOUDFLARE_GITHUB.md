# ⚡ Quick Setup: Cloudflare + GitHub

## 🎉 Status: Ready to Connect!

✅ **Cloudflare:** Logged in (doganlap@gmail.com)  
✅ **GitHub:** Connected (www.shahin.com)  
✅ **Build:** Ready (0.54 MB)  

## 🚀 Connect Now (3 Steps)

### Step 1: Open Cloudflare Dashboard
Run: `SETUP_CLOUDFLARE_GITHUB.bat`

Or go to: https://dash.cloudflare.com

### Step 2: Create Pages Project
1. Go to: **Pages** → **Create a project**
2. Choose: **"Connect to Git"**
3. Select: **GitHub**
4. **Authorize Cloudflare** (you'll accept in browser)
5. Select repository: **www.shahin.com**

### Step 3: Configure and Deploy
1. **Build settings:**
   - Build command: `cd landing-page && npm install && npm run build`
   - Output directory: `landing-page/dist`
   - Root directory: `/`
   - Node version: 18

2. **Environment variables:**
   - `VITE_API_URL` = `https://api.shahin-ai.com/api`
   - `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`

3. **Save and Deploy:**
   - Click: **"Save and Deploy"**
   - Cloudflare will build and deploy automatically

4. **Add custom domain:**
   - Add: `www.shahin-ai.com`
   - Wait for SSL certificate

## ✅ Automatic Deployments

Once connected:
- ✅ **Push to master** → Auto deploy to production
- ✅ **Pull requests** → Preview deployments
- ✅ **Every commit** → Automatic build and deploy

## 🔗 Authorization

When you connect:
1. Cloudflare will request GitHub access
2. Browser opens for authorization
3. **Accept and authorize** Cloudflare Pages
4. Repository is connected
5. Deployment starts automatically

## 🎯 Quick Commands

```bash
# Open setup guide
SETUP_CLOUDFLARE_GITHUB.bat

# Or manually deploy (after project is created)
wrangler pages deploy landing-page/dist --project-name=shahin-grc-landing
```

## 📋 Checklist

- [x] Cloudflare logged in
- [x] GitHub connected
- [x] Build ready
- [ ] Create Pages project
- [ ] Connect GitHub repository
- [ ] Authorize Cloudflare
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy
- [ ] Add custom domain

## 🚇 Backend Tunnel (Next Step)

After frontend is deployed:
1. Run: `SETUP_CLOUDFLARE_TUNNEL.bat`
2. This connects `api.shahin-ai.com` to your backend
3. Backend runs on `localhost:3001`

---

**Status:** ✅ Ready to Connect  
**Next:** Run `SETUP_CLOUDFLARE_GITHUB.bat` to connect!

