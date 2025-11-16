# ⚡ Quick Setup: GitHub to Cloudflare Pages

## 🚀 3-Step Setup

### Step 1: Setup GitHub Repository
```bash
# Run automated setup
SETUP_GITHUB_CLOUDFLARE.bat

# Or manually:
git add .
git commit -m "Ready for Cloudflare deployment"
git push origin main
```

### Step 2: Connect to Cloudflare Pages
1. Go to: https://dash.cloudflare.com
2. Pages → Create a project → Connect to Git
3. Select: GitHub
4. Authorize Cloudflare
5. Select repository: `shahin-grc`
6. Configure build:
   - Build command: `cd landing-page && npm install && npm run build`
   - Output directory: `landing-page/dist`
   - Root directory: `/`
   - Node version: 18

### Step 3: Configure
- Set environment variables:
  - `VITE_API_URL` = `https://api.shahin-ai.com/api`
  - `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`
- Add custom domain: `www.shahin-ai.com`
- Done! 🎉

## ✅ Automatic Deployments
- Push to `main` → Auto deploy
- Pull request → Preview deployment
- Merge PR → Production deployment

## 📖 Full Guide
See: `GITHUB_CLOUDFLARE_SETUP.md`

---

**Status:** Ready to connect  
**Next:** Run `SETUP_GITHUB_CLOUDFLARE.bat`

