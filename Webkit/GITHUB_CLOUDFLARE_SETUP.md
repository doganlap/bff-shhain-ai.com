# 🔗 GitHub to Cloudflare Pages Setup Guide

## Overview
This guide will help you connect your GitHub repository to Cloudflare Pages for automatic deployments.

## Prerequisites
- Git installed
- GitHub account
- GitHub CLI (gh) installed (optional but recommended)
- Cloudflare account
- Cloudflare Pages access

## Quick Setup

### Option 1: Automated Setup (Recommended)
Run: `SETUP_GITHUB_CLOUDFLARE.bat`

This will:
1. Check/install GitHub CLI
2. Login to GitHub
3. Initialize Git repository (if needed)
4. Create GitHub repository
5. Push code to GitHub
6. Guide you through Cloudflare Pages setup

### Option 2: Manual Setup

## Step-by-Step Manual Setup

### Step 1: Install GitHub CLI (Optional but Recommended)

**Windows:**
```bash
winget install --id GitHub.cli
# or
scoop install gh
```

**Linux:**
```bash
sudo apt install gh
# or
brew install gh
```

**Mac:**
```bash
brew install gh
```

### Step 2: Login to GitHub

```bash
gh auth login
```

Follow the prompts to authenticate.

### Step 3: Initialize Git Repository (if needed)

```bash
# Check if already a Git repository
git status

# If not, initialize
git init
git add .
git commit -m "Initial commit"
```

### Step 4: Create GitHub Repository

**Option A: Using GitHub CLI**
```bash
gh repo create shahin-grc --public --source=. --remote=origin --push
```

**Option B: Manual**
1. Go to: https://github.com/new
2. Create new repository: `shahin-grc`
3. Don't initialize with README
4. Copy repository URL
5. Connect local repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/shanin-grc.git
   git branch -M main
   git push -u origin main
   ```

### Step 5: Push Code to GitHub

```bash
git add .
git commit -m "Deploy to Cloudflare Pages"
git push origin main
```

### Step 6: Connect to Cloudflare Pages

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com
   - Navigate to: **Pages** → **Create a project**

2. **Connect to Git:**
   - Click: **"Connect to Git"**
   - Select: **GitHub**
   - Authorize Cloudflare to access GitHub
   - Select your repository: `shahin-grc`

3. **Configure Build Settings:**
   - **Framework preset:** Vite
   - **Build command:** `cd landing-page && npm install && npm run build`
   - **Build output directory:** `landing-page/dist`
   - **Root directory:** `/`
   - **Node version:** 18

4. **Set Environment Variables:**
   - Go to: **Settings** → **Environment Variables**
   - Add:
     - `VITE_API_URL` = `https://api.shahin-ai.com/api`
     - `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`

5. **Save and Deploy:**
   - Click: **"Save and Deploy"**
   - Cloudflare will build and deploy your site

### Step 7: Configure Custom Domain

1. **Add Custom Domain:**
   - Go to: **Custom domains**
   - Add: `www.shahin-ai.com`
   - Wait for SSL certificate (< 5 minutes)

2. **Configure DNS:**
   - Cloudflare will automatically configure DNS
   - Verify DNS records are correct

## Automatic Deployments

Once connected, Cloudflare Pages will automatically deploy:
- **On every push to main branch:** Automatic production deployment
- **On pull requests:** Preview deployments
- **On commits:** Automatic builds

## GitHub Actions (Optional)

You can also use GitHub Actions for additional automation:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: shahin-grc-landing
          directory: landing-page/dist
```

## Environment Variables

### Cloudflare Pages Dashboard
Set these in: **Pages → Settings → Environment Variables**

**Production:**
```
VITE_API_URL=https://api.shahin-ai.com/api
VITE_FRONTEND_URL=https://www.shahin-ai.com
```

**Preview:**
```
VITE_API_URL=https://api.shahin-ai.com/api
VITE_FRONTEND_URL=https://www.shahin-ai.com
```

### GitHub Secrets (for GitHub Actions)
Set these in: **Repository → Settings → Secrets**

```
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

## Repository Structure

Your repository should have this structure:
```
.
├── landing-page/
│   ├── dist/          # Build output (gitignored)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/
├── .gitignore
└── README.md
```

## .gitignore

Make sure your `.gitignore` includes:
```
# Dependencies
node_modules/
backend/node_modules/
landing-page/node_modules/

# Build output
landing-page/dist/
backend/dist/

# Environment variables
.env
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

## Troubleshooting

### GitHub CLI Not Found
```bash
# Install GitHub CLI
winget install --id GitHub.cli
# or
scoop install gh
```

### Authentication Failed
```bash
# Re-authenticate
gh auth login
gh auth refresh
```

### Push Failed
```bash
# Check remote
git remote -v

# Set upstream
git push -u origin main

# Force push (if needed, be careful)
git push -f origin main
```

### Cloudflare Build Failed
- Check build logs in Cloudflare Dashboard
- Verify build command is correct
- Check Node.js version (should be 18)
- Verify all dependencies are in package.json

### Deployment Not Triggered
- Check GitHub repository is connected
- Verify branch is `main` or `master`
- Check Cloudflare Pages settings
- Verify webhook is configured

## Verification

### Check GitHub Repository
```bash
# Check remote
git remote -v

# Check status
git status

# Check branches
git branch -a
```

### Check Cloudflare Pages
1. Go to Cloudflare Dashboard → Pages
2. Check deployment status
3. View build logs
4. Test deployed site

## Continuous Deployment

### Automatic Deployments
- ✅ Push to `main` branch → Automatic production deployment
- ✅ Create pull request → Preview deployment
- ✅ Merge pull request → Production deployment

### Manual Deployments
- Go to Cloudflare Dashboard → Pages → Deployments
- Click "Retry deployment" or "Rollback"

## Best Practices

1. **Use Branches:**
   - `main` branch for production
   - `develop` branch for development
   - Feature branches for new features

2. **Commit Messages:**
   - Use descriptive commit messages
   - Follow conventional commits format

3. **Environment Variables:**
   - Never commit `.env` files
   - Use Cloudflare Pages environment variables
   - Use different variables for preview/production

4. **Build Optimization:**
   - Keep build times short
   - Optimize dependencies
   - Use caching where possible

## Summary

✅ **GitHub Repository:** Created and connected  
✅ **Code Pushed:** To GitHub  
✅ **Cloudflare Pages:** Connected to GitHub  
✅ **Automatic Deployments:** Enabled  
✅ **Custom Domain:** Configured  

## Next Steps

1. ✅ Connect repository to Cloudflare Pages
2. ✅ Configure build settings
3. ✅ Set environment variables
4. ✅ Add custom domain
5. ✅ Test deployment
6. ✅ Verify automatic deployments work

---

**Status:** Ready for GitHub to Cloudflare setup  
**Next:** Run `SETUP_GITHUB_CLOUDFLARE.bat` to automate setup

