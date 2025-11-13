# 🚀 Complete Deployment Guide - Local & Vercel

## Date: 2024-11-13
## Status: ✅ Ready to Deploy

---

## Option 1: Local Deployment (Test First)

### Step 1: Build the Application
```bash
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\web

# Build for production
npm run build
```
**Expected Output:**
```
✓ Build completed in 2m 21s
✓ dist/ folder created
```

### Step 2: Preview Locally
```bash
# Start local production server
npm run preview
```

**Access your app at:**
- 🌐 **http://localhost:4173**

**Test these pages:**
- Dashboard: http://localhost:4173/app/dashboard
- Assessments: http://localhost:4173/app/assessments
- Risks: http://localhost:4173/app/risks-v2

### Step 3: Verify Everything Works
- [ ] Dashboard loads with 7 charts
- [ ] Can navigate between pages
- [ ] Charts are interactive
- [ ] No console errors
- [ ] Mobile view works
- [ ] Dark mode toggles

---

## Option 2: Vercel Deployment (Production)

### Prerequisites
1. **Vercel Account** (free tier works!)
   - Sign up at: https://vercel.com/signup
   - Link your GitHub account (optional but recommended)

2. **Install Vercel CLI**
```bash
npm install -g vercel
```

### Method A: Deploy via Vercel CLI (Fastest)

#### Step 1: Login to Vercel
```bash
vercel login
# Follow the prompts to authenticate
```

#### Step 2: Deploy from Project Directory
```bash
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\web

# First deployment (will ask configuration questions)
vercel

# Answer the prompts:
# ? Set up and deploy "~/apps/web"? [Y/n] Y
# ? Which scope? [Your Account]
# ? Link to existing project? [y/N] N
# ? What's your project's name? grc-platform
# ? In which directory is your code located? ./
# ? Want to modify these settings? [y/N] N
```

#### Step 3: Deploy to Production
```bash
# Deploy to production domain
vercel --prod
```

**You'll get:**
- ✅ Production URL: https://grc-platform-xxx.vercel.app
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Instant deployment

---

### Method B: Deploy via Vercel Dashboard (Easiest)

#### Step 1: Push to GitHub (if not already)
```bash
cd d:\Projects\GRC-Master\Assessmant-GRC

# Initialize git if needed
git init
git add .
git commit -m "Production ready - GRC Platform v1.0"

# Push to GitHub
git remote add origin https://github.com/yourusername/grc-platform.git
git push -u origin main
```

#### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click "Deploy"

**Deployment takes ~2-3 minutes**

#### Step 3: Get Your URL
- Production URL: https://grc-platform-xxx.vercel.app
- You can add custom domain later

---

## Environment Variables (for both deployments)

### For Local (.env.local)
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### For Vercel (in Dashboard)
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:

```
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## 🎯 Quick Commands Summary

### Local Deployment
```bash
cd apps\web

# Build
npm run build

# Preview locally
npm run preview
# Opens at http://localhost:4173
```

### Vercel Deployment
```bash
cd apps\web

# Login (first time only)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 📊 Post-Deployment Checklist

### Local Deployment
- [ ] Build successful
- [ ] Preview server starts
- [ ] Can access http://localhost:4173
- [ ] Dashboard loads
- [ ] Charts render
- [ ] Navigation works
- [ ] No console errors

### Vercel Deployment
- [ ] Deployment successful
- [ ] Can access Vercel URL
- [ ] Dashboard loads with charts
- [ ] All pages accessible
- [ ] API calls work (if backend deployed)
- [ ] HTTPS enabled
- [ ] Performance score good (Lighthouse)

---

## 🔧 Troubleshooting

### Issue: "npm run build" fails
**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: "vercel: command not found"
**Solution:**
```bash
# Install Vercel CLI globally
npm install -g vercel

# Or use npx (no install needed)
npx vercel --prod
```

### Issue: Pages show 404 on Vercel
**Solution:**
- ✅ Already fixed! The `vercel.json` file handles routing
- All routes redirect to index.html (SPA routing)

### Issue: Environment variables not working
**Solution:**
- Vercel: Add in Dashboard → Settings → Environment Variables
- Local: Create `.env.local` file in apps/web/

---

## 🎉 Success Indicators

### Local Deployment Success
```
✓ Build completed
✓ Preview server running on http://localhost:4173
✓ Dashboard accessible
✓ Charts rendering
✓ All features working
```

### Vercel Deployment Success
```
✓ Deployment completed
✓ Production URL: https://grc-platform-xxx.vercel.app
✓ HTTPS enabled
✓ Global CDN active
✓ All features working
```

---

## 🌐 Your URLs

### Local
- **Dashboard**: http://localhost:4173/app/dashboard
- **Assessments**: http://localhost:4173/app/assessments
- **Risks**: http://localhost:4173/app/risks-v2

### Vercel (after deployment)
- **Production**: https://grc-platform-xxx.vercel.app
- **Custom Domain**: https://yourdomain.com (optional)

---

## 🚀 Recommended Deployment Flow

1. **Test Locally First** ✅
   ```bash
   npm run build
   npm run preview
   # Test at http://localhost:4173
   ```

2. **Deploy to Vercel Preview** ✅
   ```bash
   vercel
   # Get preview URL
   # Test preview deployment
   ```

3. **Deploy to Vercel Production** ✅
   ```bash
   vercel --prod
   # Get production URL
   # Share with users!
   ```

---

## 💡 Pro Tips

### 1. Custom Domain (Vercel)
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records (Vercel provides instructions)

### 2. Automatic Deployments
- Connect GitHub repository to Vercel
- Every push to `main` = automatic deployment
- Pull requests get preview URLs

### 3. Performance Optimization
- Vercel automatically:
  - Compresses assets
  - Enables HTTP/2
  - Serves via global CDN
  - Caches static assets

### 4. Monitoring
- Vercel Dashboard shows:
  - Deployment logs
  - Performance metrics
  - Error tracking
  - Analytics (optional)

---

## 📞 Need Help?

### Vercel Support
- Documentation: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Support: support@vercel.com

### Local Issues
- Check build logs: `npm run build`
- Check console: F12 in browser
- Review [TESTING_GUIDE.md](apps/web/TESTING_GUIDE.md)

---

## 🎊 Congratulations!

You now have:
- ✅ Local deployment for testing
- ✅ Vercel deployment for production
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Enterprise-grade hosting

**Your GRC Platform is LIVE!** 🚀✨

---

**Generated**: 2024-11-13
**Local URL**: http://localhost:4173
**Vercel URL**: Will be provided after deployment
**Status**: ✅ Ready to Deploy
