# 🚀 Deployment Instructions - Cloudflare Pages

## ✅ Build Complete - Ready to Deploy!

Your application has been built successfully and is ready for deployment to Cloudflare Pages.

## 📦 Build Output

- **Location:** `landing-page/dist/`
- **Size:** 0.54 MB (uncompressed) / ~136 KB (gzipped)
- **Files:** 16 files (index.html, _redirects, assets)
- **Status:** ✅ Ready for deployment

## 🚀 Deployment Methods

### Method 1: Cloudflare Dashboard (Recommended - Easiest)

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com
   - Navigate to **Pages** → **Create a project**

2. **Upload Build:**
   - Choose **"Upload assets"**
   - Select the `landing-page/dist` folder
   - Click **"Upload and Deploy"**

3. **Set Environment Variables:**
   - Go to **Settings** → **Environment Variables**
   - Add:
     - `VITE_API_URL` = `https://api.shahin-ai.com/api`
     - `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`

4. **Configure Custom Domain:**
   - Go to **Custom domains**
   - Add: `www.shahin-ai.com`
   - Wait for SSL certificate (< 5 minutes)

5. **Done!** 🎉
   - Your site will be live at `https://www.shahin-ai.com`

### Method 2: Wrangler CLI (Automated)

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Deploy:**
   ```bash
   wrangler pages deploy landing-page/dist --project-name=shahin-grc-landing
   ```

4. **Set Environment Variables:**
   - Go to Cloudflare Dashboard → Pages → Settings → Environment Variables
   - Add the environment variables listed above

5. **Configure Custom Domain:**
   - Add `www.shahin-ai.com` as custom domain

### Method 3: Git Integration (Recommended for CI/CD)

1. **Push to Git:**
   - Push your code to GitHub, GitLab, or Bitbucket

2. **Connect Repository:**
   - Go to Cloudflare Dashboard → Pages
   - Click **"Create a project"**
   - Choose **"Connect to Git"**
   - Select your repository

3. **Configure Build Settings:**
   - **Framework preset:** Vite
   - **Build command:** `cd landing-page && npm install && npm run build`
   - **Build output directory:** `landing-page/dist`
   - **Root directory:** `/`
   - **Node version:** 18

4. **Set Environment Variables:**
   - Add environment variables in Cloudflare Dashboard

5. **Deploy:**
   - Cloudflare will automatically deploy on every push to main branch

## ⚙️ Environment Variables

Set these in Cloudflare Pages → Settings → Environment Variables:

**Production:**
```
VITE_API_URL=https://api.shahin-ai.com/api
VITE_FRONTEND_URL=https://www.shahin-ai.com
```

**Preview (Optional):**
```
VITE_API_URL=https://api.shahin-ai.com/api
VITE_FRONTEND_URL=https://www.shahin-ai.com
```

## 🌐 Domain Configuration

1. **Add Custom Domain:**
   - In Cloudflare Pages → Custom domains
   - Add: `www.shahin-ai.com`
   - Cloudflare will automatically configure DNS

2. **Wait for SSL:**
   - SSL certificate will be provisioned automatically
   - Usually takes < 5 minutes

3. **Verify DNS:**
   - Check DNS records in Cloudflare Dashboard
   - Verify CNAME record for `www` points to Pages

## 🔧 Backend Requirements

The backend must be deployed separately at `api.shahin-ai.com`:

### Backend Environment Variables
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://www.shahin-ai.com
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
LOCAL_LLM_MODEL=llama-3.2-3b-instruct
```

### Backend Deployment Options

**Option A: VPS/Server**
- Deploy backend to VPS (DigitalOcean, AWS, etc.)
- Point `api.shahin-ai.com` to backend server
- Configure SSL certificates

**Option B: Cloudflare Tunnel (Recommended)**
- Install Cloudflare Tunnel (cloudflared)
- Create tunnel and route `api.shahin-ai.com` to `http://localhost:3001`
- Run tunnel: `cloudflared tunnel run shahin-backend`

**Option C: Cloudflare Workers**
- Convert backend to Cloudflare Workers format
- Deploy as Worker with route `api.shahin-ai.com/*`

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed to Cloudflare Pages
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Backend deployed and accessible
- [ ] CORS configured on backend
- [ ] API endpoints tested
- [ ] AI agent tested
- [ ] All features working
- [ ] No console errors

## 🧪 Testing

After deployment:

1. **Visit Site:**
   - Go to `https://www.shahin-ai.com`
   - Verify page loads correctly

2. **Test AI Agent:**
   - Click the floating AI icon (فهد - Fahd)
   - Test chat functionality
   - Verify responses are dynamic

3. **Test Features:**
   - Test sandbox creation
   - Test demo booking
   - Verify API connectivity
   - Check browser console for errors

4. **Test Performance:**
   - Check page load time
   - Verify assets are cached
   - Test on mobile devices

## 📊 Deployment Status

- ✅ **Build:** Complete
- ✅ **Build Output:** Ready
- ✅ **Configuration:** Complete
- ✅ **Documentation:** Complete
- ⏳ **Deployment:** Pending (Manual step)
- ⏳ **Environment Variables:** Pending (Manual step)
- ⏳ **Custom Domain:** Pending (Manual step)

## 🎯 Quick Deploy Commands

### Build and Deploy (Wrangler)
```bash
# Build
cd landing-page
npm run build

# Deploy
wrangler pages deploy dist --project-name=shahin-grc-landing
```

### Build and Deploy (Dashboard)
```bash
# Build
cd landing-page
npm run build

# Then upload landing-page/dist to Cloudflare Dashboard
```

## 📚 Additional Resources

- **Full Guide:** `CLOUDFLARE_DEPLOYMENT_GUIDE.md`
- **Checklist:** `CLOUDFLARE_SETUP_CHECKLIST.md`
- **Quick Start:** `QUICK_DEPLOY_CLOUDFLARE.md`

## 🆘 Troubleshooting

### Build Errors
- Verify Node.js version (18+)
- Check all dependencies are installed
- Review build logs

### Deployment Errors
- Verify Wrangler is installed and logged in
- Check Cloudflare account permissions
- Verify project name is correct

### CORS Errors
- Verify CORS configuration in backend
- Check environment variables are set
- Verify API URL is correct

### 404 Errors
- Ensure `_redirects` file is in dist folder
- Verify SPA routing is configured
- Check Cloudflare Pages redirects

## 🎉 Next Steps

1. **Deploy to Cloudflare:**
   - Use one of the methods above
   - Upload `landing-page/dist` folder
   - Set environment variables

2. **Configure Domain:**
   - Add custom domain: `www.shahin-ai.com`
   - Wait for SSL certificate

3. **Deploy Backend:**
   - Deploy backend to `api.shahin-ai.com`
   - Configure CORS
   - Test API endpoints

4. **Test Deployment:**
   - Visit deployed site
   - Test all features
   - Verify everything works

---

**Status:** ✅ Ready for Deployment  
**Build Output:** `landing-page/dist/`  
**Next Action:** Deploy to Cloudflare Pages

