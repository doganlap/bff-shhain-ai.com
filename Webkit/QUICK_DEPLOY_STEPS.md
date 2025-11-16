# 🚀 Quick Deploy Steps - Cloudflare Pages

## ✅ Build Ready!

Your application is built and ready for deployment.

**Build Output:** `landing-page/dist/`  
**Status:** ✅ Ready to deploy

## 🚀 Deploy Now - 3 Easy Steps

### Step 1: Deploy to Cloudflare Pages

**Option A: Cloudflare Dashboard (Easiest - Recommended)**

1. Go to: https://dash.cloudflare.com
2. Navigate to: **Pages** → **Create a project**
3. Choose: **"Upload assets"**
4. Select: `landing-page/dist` folder
5. Click: **"Upload and Deploy"**

**Option B: Wrangler CLI (Automated)**

1. Open terminal in project root
2. Run: `wrangler login` (if not logged in)
3. Run: `wrangler pages deploy landing-page/dist --project-name=shahin-grc-landing`

### Step 2: Set Environment Variables

1. Go to: Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables
2. Add these variables:

```
VITE_API_URL = https://api.shahin-ai.com/api
VITE_FRONTEND_URL = https://www.shahin-ai.com
```

3. Save changes

### Step 3: Configure Custom Domain

1. Go to: Cloudflare Dashboard → Pages → Your Project → Custom domains
2. Add: `www.shahin-ai.com`
3. Wait for SSL certificate (< 5 minutes)
4. Done! 🎉

## 📋 Deployment Checklist

- [ ] Build completed successfully
- [ ] Deployed to Cloudflare Pages
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Site accessible at www.shahin-ai.com
- [ ] Backend deployed at api.shahin-ai.com
- [ ] CORS configured on backend
- [ ] All features tested

## 🧪 Test After Deployment

1. Visit: https://www.shahin-ai.com
2. Test AI agent (فهد - Fahd)
3. Test sandbox creation
4. Test demo booking
5. Verify API connectivity
6. Check browser console for errors

## 🆘 Need Help?

- **Full Guide:** See `CLOUDFLARE_DEPLOYMENT_GUIDE.md`
- **Checklist:** See `CLOUDFLARE_SETUP_CHECKLIST.md`
- **Troubleshooting:** See deployment guide

## 🎯 Quick Commands

```bash
# Build
cd landing-page
npm run build

# Deploy (Wrangler)
wrangler pages deploy landing-page/dist --project-name=shahin-grc-landing

# Or upload dist folder to Cloudflare Dashboard
```

---

**Status:** ✅ Ready to Deploy  
**Next:** Follow Step 1 above to deploy!

