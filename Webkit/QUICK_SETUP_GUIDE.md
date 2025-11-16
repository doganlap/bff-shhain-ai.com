# 🚀 Quick Setup Guide - Cloudflare Pages

## ✅ Deployment Status

- **Status**: ✅ LIVE
- **Project**: shahin-grc-landing
- **URL**: https://shahin-grc-landing.pages.dev
- **Deployment**: ✅ Complete

## 📋 Setup Checklist

### Step 1: Set Environment Variables (Required)

**URL**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/environment-variables

1. Go to: **Pages** → **shahin-grc-landing** → **Settings** → **Environment variables**
2. Click: **Add variable**
3. Add for **Production**:
   - **Variable**: `VITE_API_URL`
   - **Value**: `https://api.shahin-ai.com/api`
4. Click: **Save**
5. Click: **Add variable** again
6. Add for **Production**:
   - **Variable**: `VITE_FRONTEND_URL`
   - **Value**: `https://www.shahin-ai.com`
7. Click: **Save**
8. Go to: **Deployments** → **Create deployment** → **Deploy**

**Time**: 2-3 minutes

---

### Step 2: Add Custom Domain (Optional)

**URL**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/domains

1. Go to: **Pages** → **shahin-grc-landing** → **Custom domains**
2. Click: **Set up a custom domain**
3. Enter: `www.shahin-ai.com`
4. Click: **Continue**
5. Wait for SSL certificate (< 5 minutes)

**Time**: 5 minutes

---

### Step 3: Connect GitHub (Optional - Recommended)

**URL**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/git

1. Go to: **Pages** → **shahin-grc-landing** → **Settings** → **Connect to Git**
2. Select: **GitHub**
3. Authorize Cloudflare (browser opens)
4. Select repository: **doganlap/shahin-landing**
5. Configure:
   - **Production branch**: `master`
   - **Build command**: `cd landing-page && npm install && npm run build`
   - **Output directory**: `landing-page/dist`
   - **Root directory**: `/`
   - **Node version**: `18`
6. Add environment variables (same as Step 1)
7. Click: **Save and Deploy**

**Benefits**:
- ✅ Auto-deploy on every push to `master`
- ✅ Preview deployments for pull requests
- ✅ Build history and rollback

**Time**: 5-10 minutes

---

## 🚀 Quick Script

Run this script to open all setup pages:

```bash
OPEN_CLOUDFLARE_SETUP.bat
```

This will open:
1. Environment Variables page
2. Custom Domains page
3. Git Settings page

## 📚 Detailed Guides

- **Environment Variables**: `SET_ENV_VARS_CLOUDFLARE.md`
- **Custom Domain**: `ADD_CUSTOM_DOMAIN_CLOUDFLARE.md`
- **GitHub Connection**: `CONNECT_GITHUB_CLOUDFLARE.md`
- **Deployment Success**: `DEPLOYMENT_SUCCESS.md`

## 🔗 Quick Links

### Cloudflare Dashboard
- **Project**: https://dash.cloudflare.com/pages/view/shahin-grc-landing
- **Environment Variables**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/environment-variables
- **Custom Domains**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/domains
- **Git Settings**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/git
- **Deployments**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/deployments

### Live URLs
- **Deployment**: https://fbacd40a.shahin-grc-landing.pages.dev
- **Production**: https://shahin-grc-landing.pages.dev
- **Custom Domain**: https://www.shahin-ai.com (after setup)

## ⚡ Quick Commands

### Manual Deployment
```bash
wrangler pages deploy landing-page/dist --project-name=shahin-grc-landing
```

### Check Deployment Status
```bash
wrangler pages deployment list --project-name=shahin-grc-landing
```

### View Project Info
```bash
wrangler pages project list
```

## 🎯 Priority Order

1. **✅ Set Environment Variables** (Required)
   - Without this, API calls won't work
   - Must redeploy after adding

2. **⏳ Add Custom Domain** (Recommended)
   - Makes site accessible at www.shahin-ai.com
   - SSL certificate automatic

3. **⏳ Connect GitHub** (Optional but Recommended)
   - Enables auto-deployments
   - Preview deployments for PRs
   - Build history

## 🔒 Security

- ✅ HTTPS enabled (automatic)
- ✅ SSL certificate (automatic)
- ✅ DDoS protection (Cloudflare)
- ✅ Global CDN (Cloudflare)
- ✅ Environment variables (encrypted)

## 📊 Current Status

- [x] Project created
- [x] Code deployed
- [x] Build uploaded
- [ ] Environment variables set
- [ ] Custom domain added
- [ ] GitHub connected

## 🎉 Next Steps

1. **Set environment variables** (5 minutes)
2. **Add custom domain** (5 minutes)
3. **Connect GitHub** (10 minutes)
4. **Deploy backend API** (separate)
5. **Test all features**

## 💡 Tips

- **Environment Variables**: Must start with `VITE_` for Vite apps
- **Custom Domain**: DNS propagation can take up to 24 hours (usually < 5 minutes)
- **GitHub Connection**: Enables automatic deployments on every push
- **Build Time**: ~2-3 minutes per deployment
- **SSL Certificate**: Automatic, no configuration needed

---

**Ready to complete setup!** 🚀

Run `OPEN_CLOUDFLARE_SETUP.bat` to open all setup pages at once.

