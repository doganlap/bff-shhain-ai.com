# Cloudflare Deployment Guide for Shahin GRC

## Deployment to www.shahin-ai.com

### Prerequisites
1. Cloudflare account with `shahin-ai.com` domain
2. Cloudflare Pages access
3. Node.js 18+ installed locally
4. Git repository connected to Cloudflare Pages

### Step 1: Frontend Deployment (Cloudflare Pages)

#### Option A: Deploy via Cloudflare Dashboard
1. Go to Cloudflare Dashboard → Pages
2. Create a new project
3. Connect your Git repository
4. Configure build settings:
   - **Framework preset:** Vite
   - **Build command:** `cd landing-page && npm install && npm run build`
   - **Build output directory:** `landing-page/dist`
   - **Root directory:** `/` (project root)

#### Option B: Deploy via Wrangler CLI
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy to Cloudflare Pages
cd landing-page
npm install
npm run build
wrangler pages deploy dist --project-name=shahin-grc-landing
```

### Step 2: Backend Deployment (Cloudflare Workers)

The backend needs to be deployed separately. Options:

#### Option A: Deploy to Cloudflare Workers
1. Create a Worker script in Cloudflare Dashboard
2. Use Node.js compatibility mode
3. Deploy backend code

#### Option B: Deploy to VPS/Server (Recommended)
1. Deploy backend to a VPS (DigitalOcean, AWS, etc.)
2. Point `api.shahin-ai.com` subdomain to backend server
3. Configure SSL certificates
4. Set up environment variables

#### Option C: Use Cloudflare Tunnel (Cloudflared)
```bash
# Install cloudflared
brew install cloudflared  # macOS
# or download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/

# Create tunnel
cloudflared tunnel create shahin-backend

# Configure tunnel (config.yml)
tunnel: shahin-backend
credentials-file: /path/to/credentials.json

ingress:
  - hostname: api.shahin-ai.com
    service: http://localhost:3001
  - service: http_status:404

# Run tunnel
cloudflared tunnel run shahin-backend
```

### Step 3: Environment Variables

Set these in Cloudflare Pages dashboard:

**Frontend (Cloudflare Pages):**
- `VITE_API_URL` = `https://api.shahin-ai.com/api`
- `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`

**Backend (Server/Workers):**
- `DATABASE_URL` = Your PostgreSQL connection string
- `JWT_SECRET` = Your JWT secret key
- `FRONTEND_URL` = `https://www.shahin-ai.com`
- `NODE_ENV` = `production`

### Step 4: DNS Configuration

In Cloudflare DNS settings:

1. **A Record** (if using VPS):
   - Name: `api`
   - Content: Your backend server IP
   - Proxy: Off (gray cloud) or On (orange cloud) for DDoS protection

2. **CNAME Record** (if using Cloudflare Pages):
   - Name: `www`
   - Content: `your-pages-project.pages.dev`
   - Proxy: On (orange cloud)

3. **CNAME Record** (root domain):
   - Name: `@`
   - Content: `www.shahin-ai.com`
   - Proxy: On (orange cloud)

### Step 5: SSL/TLS Configuration

1. Go to SSL/TLS settings in Cloudflare
2. Set encryption mode to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

### Step 6: Security Headers

Configure in Cloudflare → Rules → Transform Rules → Modify Response Header:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

### Step 7: Build and Deploy

```bash
# Build frontend
cd landing-page
npm install
npm run build

# The dist folder is ready for Cloudflare Pages
# Deploy via Cloudflare Dashboard or Wrangler CLI
```

### Step 8: Verify Deployment

1. Visit `https://www.shahin-ai.com`
2. Check browser console for errors
3. Test API endpoints: `https://api.shahin-ai.com/health`
4. Test sandbox creation
5. Test demo booking form

### Troubleshooting

#### CORS Errors
- Verify CORS configuration in `backend/server.js`
- Check that `www.shahin-ai.com` is in allowed origins
- Verify API URL is correct in frontend

#### 404 Errors on Routes
- Ensure `_redirects` file is in `dist` folder
- Verify Cloudflare Pages redirects are configured
- Check SPA fallback is working

#### API Connection Issues
- Verify `VITE_API_URL` environment variable
- Check backend server is running
- Verify DNS records are correct
- Check SSL certificates are valid

#### Build Errors
- Verify Node.js version (18+)
- Check all dependencies are installed
- Review build logs in Cloudflare Dashboard

### Continuous Deployment

Cloudflare Pages supports automatic deployment from Git:
1. Connect Git repository
2. Configure build settings
3. Deploy automatically on push to main branch

### Performance Optimization

1. Enable Cloudflare CDN caching
2. Configure cache rules for static assets
3. Enable Brotli compression
4. Enable HTTP/2 and HTTP/3
5. Configure image optimization (Cloudflare Images)

### Monitoring

1. Set up Cloudflare Analytics
2. Configure error tracking
3. Set up uptime monitoring
4. Monitor API response times

---

## Quick Deploy Script

Create `deploy-cloudflare.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Building for Cloudflare deployment..."

cd landing-page
npm install
npm run build

echo "✅ Build complete!"
echo "📦 Output directory: landing-page/dist"
echo "🌐 Deploy to Cloudflare Pages manually or use Wrangler CLI"
echo ""
echo "Next steps:"
echo "1. Go to Cloudflare Dashboard → Pages"
echo "2. Upload dist folder or connect Git repo"
echo "3. Set environment variables"
echo "4. Deploy!"
```

---

**Deployment Status:** Ready for Cloudflare Pages  
**Domain:** www.shahin-ai.com  
**API Domain:** api.shahin-ai.com  
**Last Updated:** 2025-01-XX

