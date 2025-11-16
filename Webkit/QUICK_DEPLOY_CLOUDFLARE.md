# Quick Deploy to Cloudflare - Shahin GRC

## 🚀 Quick Start

### Option 1: Automated (Windows)
```bash
DEPLOY_CLOUDFLARE.bat
```

### Option 2: Automated (Linux/Mac)
```bash
chmod +x deploy-cloudflare.sh
./deploy-cloudflare.sh
```

### Option 3: Manual Steps

1. **Build:**
   ```bash
   cd landing-page
   npm install
   npm run build
   ```

2. **Deploy to Cloudflare:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Pages → Create project → Upload `landing-page/dist` folder
   - Set environment variables (see below)
   - Deploy!

## 📋 Environment Variables

Set these in Cloudflare Pages → Settings → Environment Variables:

```
VITE_API_URL=https://api.shahin-ai.com/api
VITE_FRONTEND_URL=https://www.shahin-ai.com
```

## 🌐 Domain Setup

1. Add custom domain: `www.shahin-ai.com`
2. Cloudflare will auto-configure DNS
3. Wait for SSL certificate (< 5 minutes)
4. Done! 🎉

## ✅ Pre-Deployment Checklist

- [ ] Build succeeds locally
- [ ] `dist` folder contains `index.html`
- [ ] `dist` folder contains `_redirects` file
- [ ] Environment variables are set
- [ ] Backend API is accessible at `api.shahin-ai.com`
- [ ] DNS records are configured

## 🧪 Test Deployment

```bash
TEST_DEPLOYMENT.bat  # Windows
# or
cd landing-page && npm run build && npm run preview
```

## 📖 Full Documentation

See `CLOUDFLARE_DEPLOYMENT_GUIDE.md` for detailed instructions.

---

**Status:** ✅ Ready for Deployment  
**Domain:** www.shahin-ai.com  
**Build:** ✅ Tested and Working

