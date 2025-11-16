# Cloudflare Deployment Guide - Shahin GRC

## Overview
This guide covers deploying the Shahin GRC application to Cloudflare Pages at `www.shahin-ai.com`.

## Prerequisites
1. Cloudflare account with `shahin-ai.com` domain
2. Node.js 18+ installed
3. Git repository (optional, for automatic deployments)
4. Backend server deployed separately (api.shahin-ai.com)

## Quick Start

### Option 1: Automated Deployment (Recommended)
```bash
# Windows
DEPLOY_CLOUDFLARE.bat

# Linux/Mac
chmod +x deploy-cloudflare.sh
./deploy-cloudflare.sh
```

### Option 2: Manual Deployment
1. Build the frontend:
   ```bash
   cd landing-page
   npm install
   npm run build
   ```
2. Deploy to Cloudflare Pages via Dashboard or Wrangler CLI

## Step-by-Step Deployment

### Step 1: Build Frontend
```bash
cd landing-page
npm install
npm run build
```
Build output will be in `landing-page/dist`

### Step 2: Deploy to Cloudflare Pages

#### Option A: Cloudflare Dashboard (Easiest)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Choose **Upload assets**
4. Upload the `landing-page/dist` folder
5. Configure:
   - **Project name:** `shahin-grc-landing`
   - **Production branch:** `main`
6. Click **Save and Deploy**

#### Option B: Wrangler CLI
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy landing-page/dist --project-name=shahin-grc-landing
```

#### Option C: Git Integration (Recommended for CI/CD)
1. Push code to Git repository (GitHub, GitLab, etc.)
2. In Cloudflare Dashboard → Pages → Create a project
3. Connect your Git repository
4. Configure build settings:
   - **Framework preset:** Vite
   - **Build command:** `cd landing-page && npm install && npm run build`
   - **Build output directory:** `landing-page/dist`
   - **Root directory:** `/` (project root)
   - **Node version:** 18
5. Click **Save and Deploy**

### Step 3: Configure Environment Variables

In Cloudflare Pages → Settings → Environment Variables, add:

**Production:**
- `VITE_API_URL` = `https://api.shahin-ai.com/api`
- `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`

**Preview:**
- `VITE_API_URL` = `https://api.shahin-ai.com/api`
- `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`

### Step 4: Configure Custom Domain

1. In Cloudflare Pages → Custom domains
2. Add custom domain: `www.shahin-ai.com`
3. Cloudflare will automatically configure DNS
4. Wait for SSL certificate provisioning (usually < 5 minutes)

### Step 5: Configure DNS

In Cloudflare DNS settings:

1. **CNAME Record:**
   - Name: `www`
   - Target: `shahin-grc-landing.pages.dev`
   - Proxy: On (orange cloud)
   - TTL: Auto

2. **A Record (Root domain):**
   - Name: `@`
   - Target: `192.0.2.1` (or use CNAME flattening)
   - Proxy: On (orange cloud)
   - TTL: Auto

### Step 6: Configure SSL/TLS

1. Go to SSL/TLS settings
2. Set encryption mode to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**
5. Enable **Minimum TLS Version:** 1.2

### Step 7: Configure Security Headers

In Cloudflare → Rules → Transform Rules → Modify Response Header:

Add these headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.shahin-ai.com
```

### Step 8: Configure Caching

1. Go to Caching → Configuration
2. Enable **Browser Cache TTL:** 4 hours
3. Enable **Edge Cache TTL:** 2 hours
4. Configure cache rules:
   - Static assets (JS, CSS, images): Cache everything
   - HTML files: Cache by extension
   - API requests: Bypass cache

### Step 9: Test Deployment

1. Visit `https://www.shahin-ai.com`
2. Check browser console for errors
3. Test AI agent functionality
4. Test sandbox creation
5. Test demo booking form
6. Verify API connectivity: `https://api.shahin-ai.com/api/health`

## Backend Deployment

The backend needs to be deployed separately. Options:

### Option A: VPS/Server
1. Deploy backend to VPS (DigitalOcean, AWS, etc.)
2. Point `api.shahin-ai.com` subdomain to backend server
3. Configure SSL certificates (Let's Encrypt)
4. Set up environment variables

### Option B: Cloudflare Tunnel (Recommended)
1. Install Cloudflare Tunnel (cloudflared)
2. Create tunnel: `cloudflared tunnel create shahin-backend`
3. Configure tunnel:
   ```yaml
   tunnel: shahin-backend
   credentials-file: /path/to/credentials.json
   
   ingress:
     - hostname: api.shahin-ai.com
       service: http://localhost:3001
     - service: http_status:404
   ```
4. Run tunnel: `cloudflared tunnel run shahin-backend`
5. Configure DNS: Point `api.shahin-ai.com` to tunnel

### Option C: Cloudflare Workers
1. Convert backend to Cloudflare Workers format
2. Deploy as Worker
3. Configure routes: `api.shahin-ai.com/*`

## Environment Variables for Backend

Set these on your backend server:

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

## Testing

### Local Testing
```bash
# Test build locally
TEST_CLOUDFLARE_BUILD.bat  # Windows
# or
cd landing-page && npm run build && npm run preview
```

### Production Testing
1. Visit `https://www.shahin-ai.com`
2. Test AI agent: Click the floating AI icon
3. Test sandbox creation
4. Test demo booking
5. Check browser console for errors
6. Verify API endpoints are accessible

## Troubleshooting

### Build Errors
- Verify Node.js version (18+)
- Check all dependencies are installed
- Review build logs in Cloudflare Dashboard
- Check for TypeScript/ESLint errors

### CORS Errors
- Verify CORS configuration in `backend/server.js`
- Check that `www.shahin-ai.com` is in allowed origins
- Verify API URL is correct in frontend environment variables

### 404 Errors on Routes
- Ensure `_redirects` file is in `dist` folder
- Verify Cloudflare Pages redirects are configured
- Check SPA fallback is working (all routes → index.html)

### API Connection Issues
- Verify `VITE_API_URL` environment variable
- Check backend server is running
- Verify DNS records are correct
- Check SSL certificates are valid
- Verify CORS headers on backend

### SSL Certificate Issues
- Wait for certificate provisioning (< 5 minutes)
- Check DNS records are correct
- Verify domain is properly configured in Cloudflare
- Check SSL/TLS settings (Full strict mode)

## Performance Optimization

1. **Enable Cloudflare CDN caching**
2. **Configure cache rules** for static assets
3. **Enable Brotli compression**
4. **Enable HTTP/2 and HTTP/3**
5. **Configure image optimization** (Cloudflare Images)
6. **Enable Minify** (JavaScript, CSS, HTML)
7. **Enable Auto Minify** in Cloudflare Dashboard

## Monitoring

1. **Set up Cloudflare Analytics**
2. **Configure error tracking** (Sentry, etc.)
3. **Set up uptime monitoring**
4. **Monitor API response times**
5. **Set up alerts** for downtime

## Continuous Deployment

Cloudflare Pages supports automatic deployment from Git:

1. Connect Git repository
2. Configure build settings
3. Deploy automatically on push to main branch
4. Preview deployments for pull requests

## Rollback

If you need to rollback:

1. Go to Cloudflare Pages → Deployments
2. Find the previous deployment
3. Click **Retry deployment** or **Rollback to this deployment**

## Support

For issues:
1. Check Cloudflare Pages logs
2. Review build logs
3. Check browser console for errors
4. Verify environment variables
5. Test API endpoints independently

## Deployment Checklist

- [ ] Frontend built successfully
- [ ] Environment variables configured
- [ ] Custom domain configured
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] Security headers configured
- [ ] Caching configured
- [ ] Backend deployed and accessible
- [ ] API endpoints tested
- [ ] AI agent tested
- [ ] Sandbox creation tested
- [ ] Demo booking tested
- [ ] Mobile responsive tested
- [ ] Browser compatibility tested

## Files Reference

- `cloudflare-pages.json` - Cloudflare Pages configuration
- `wrangler.toml` - Wrangler CLI configuration
- `landing-page/public/_redirects` - SPA routing redirects
- `DEPLOY_CLOUDFLARE.bat` - Windows deployment script
- `deploy-cloudflare.sh` - Linux/Mac deployment script
- `TEST_CLOUDFLARE_BUILD.bat` - Windows build test script

---

**Deployment Status:** Ready for Cloudflare Pages  
**Domain:** www.shahin-ai.com  
**API Domain:** api.shahin-ai.com  
**Last Updated:** 2025-01-XX

