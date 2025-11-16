# Cloudflare Deployment Checklist

## Pre-Deployment

### 1. Local Build Test
- [ ] Run `TEST_CLOUDFLARE_BUILD.bat` (Windows) or `npm run build` (Linux/Mac)
- [ ] Verify build completes without errors
- [ ] Check `landing-page/dist` folder exists
- [ ] Verify `index.html` is in dist folder
- [ ] Verify `_redirects` file is in dist folder
- [ ] Test preview: `npm run preview` and verify app loads

### 2. Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All dependencies are up to date
- [ ] Environment variables are configured
- [ ] API endpoints are correct

### 3. Configuration Files
- [ ] `cloudflare-pages.json` is configured
- [ ] `wrangler.toml` is configured
- [ ] `landing-page/public/_redirects` exists
- [ ] `vite.config.js` is configured for production

## Cloudflare Setup

### 4. Cloudflare Account
- [ ] Cloudflare account created
- [ ] Domain `shahin-ai.com` added to Cloudflare
- [ ] DNS records configured
- [ ] SSL/TLS mode set to "Full (strict)"

### 5. Cloudflare Pages Project
- [ ] Pages project created
- [ ] Project name: `shahin-grc-landing`
- [ ] Git repository connected (optional)
- [ ] Build settings configured:
  - Build command: `cd landing-page && npm install && npm run build`
  - Output directory: `landing-page/dist`
  - Root directory: `/`
  - Node version: 18

### 6. Environment Variables
- [ ] `VITE_API_URL` = `https://api.shahin-ai.com/api`
- [ ] `VITE_FRONTEND_URL` = `https://www.shahin-ai.com`
- [ ] Variables set for Production environment
- [ ] Variables set for Preview environment (optional)

### 7. Custom Domain
- [ ] Custom domain added: `www.shahin-ai.com`
- [ ] DNS records configured automatically
- [ ] SSL certificate provisioned
- [ ] Domain is active and accessible

### 8. DNS Configuration
- [ ] CNAME record for `www` → Cloudflare Pages
- [ ] A record for root domain (or CNAME flattening)
- [ ] DNS proxy enabled (orange cloud)
- [ ] DNS propagation verified

### 9. SSL/TLS Configuration
- [ ] SSL/TLS mode: Full (strict)
- [ ] Always Use HTTPS: Enabled
- [ ] Automatic HTTPS Rewrites: Enabled
- [ ] Minimum TLS Version: 1.2
- [ ] SSL certificate is active

### 10. Security Headers
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Content-Security-Policy: Configured
- [ ] Permissions-Policy: Configured

### 11. Caching Configuration
- [ ] Browser Cache TTL: 4 hours
- [ ] Edge Cache TTL: 2 hours
- [ ] Cache rules configured for static assets
- [ ] HTML files cache by extension
- [ ] API requests bypass cache

### 12. Performance Optimization
- [ ] Brotli compression enabled
- [ ] HTTP/2 enabled
- [ ] HTTP/3 enabled
- [ ] Minify JavaScript: Enabled
- [ ] Minify CSS: Enabled
- [ ] Minify HTML: Enabled
- [ ] Auto Minify: Enabled

## Backend Setup

### 13. Backend Server
- [ ] Backend deployed to server/VPS
- [ ] Backend accessible at `https://api.shahin-ai.com`
- [ ] SSL certificate configured for backend
- [ ] CORS configured for `www.shahin-ai.com`
- [ ] Environment variables set on backend

### 14. Backend Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3001`
- [ ] `FRONTEND_URL` = `https://www.shahin-ai.com`
- [ ] `DATABASE_URL` = PostgreSQL connection string
- [ ] `JWT_SECRET` = JWT secret key
- [ ] `OPENAI_API_KEY` = OpenAI API key (or other AI service keys)

### 15. Backend API Endpoints
- [ ] `/api/health` - Health check endpoint
- [ ] `/api/ai/chat` - AI chat endpoint
- [ ] `/api/ai/initialize` - AI initialization endpoint
- [ ] `/api/agent/status` - Agent status endpoint
- [ ] `/api/admin/health` - Admin health endpoint
- [ ] All endpoints are accessible and responding

## Testing

### 16. Frontend Testing
- [ ] Visit `https://www.shahin-ai.com`
- [ ] Page loads without errors
- [ ] No console errors in browser
- [ ] All assets load correctly (CSS, JS, images)
- [ ] SPA routing works (test different routes)
- [ ] Mobile responsive design works
- [ ] Dark mode works (if applicable)

### 17. AI Agent Testing
- [ ] AI agent icon appears in bottom right
- [ ] Clicking agent opens chat interface
- [ ] Agent connects to backend API
- [ ] Agent sends messages successfully
- [ ] Agent receives responses from AI service
- [ ] Agent displays messages correctly
- [ ] Agent handles errors gracefully

### 18. Feature Testing
- [ ] Sandbox creation works
- [ ] Demo booking form works
- [ ] Form submissions are processed
- [ ] File uploads work (if applicable)
- [ ] Image analysis works (if applicable)
- [ ] Voice input works (if applicable)

### 19. API Integration Testing
- [ ] Frontend can connect to backend API
- [ ] CORS is configured correctly
- [ ] API requests include proper headers
- [ ] API responses are handled correctly
- [ ] Error handling works for API failures
- [ ] Loading states are displayed correctly

### 20. Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Lighthouse score > 90
- [ ] No large bundle sizes
- [ ] Images are optimized
- [ ] Code is minified
- [ ] Assets are cached correctly

## Monitoring

### 21. Analytics
- [ ] Cloudflare Analytics enabled
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring configured
- [ ] API response time monitoring
- [ ] Alerts configured for downtime

### 22. Logging
- [ ] Cloudflare Pages logs accessible
- [ ] Build logs are reviewed
- [ ] Error logs are monitored
- [ ] API logs are monitored
- [ ] Log retention configured

## Post-Deployment

### 23. Verification
- [ ] All checklist items completed
- [ ] Application is fully functional
- [ ] No critical errors
- [ ] Performance is acceptable
- [ ] Security headers are active
- [ ] SSL certificate is valid
- [ ] DNS is propagated

### 24. Documentation
- [ ] Deployment guide is updated
- [ ] Environment variables are documented
- [ ] API endpoints are documented
- [ ] Troubleshooting guide is available
- [ ] Contact information is available

## Rollback Plan

### 25. Rollback Preparation
- [ ] Previous deployment is identified
- [ ] Rollback procedure is documented
- [ ] Rollback can be executed quickly
- [ ] Data backup is available (if applicable)

## Support

### 26. Support Setup
- [ ] Support contact information is available
- [ ] Issue reporting process is documented
- [ ] Monitoring alerts are configured
- [ ] Emergency contact is available

---

## Quick Test Commands

```bash
# Test build locally
cd landing-page
npm install
npm run build
npm run preview

# Test API connectivity
curl https://api.shahin-ai.com/api/health

# Test frontend
curl https://www.shahin-ai.com

# Check SSL certificate
openssl s_client -connect www.shahin-ai.com:443 -servername www.shahin-ai.com
```

## Deployment Status

- [ ] Ready for deployment
- [ ] Deployment in progress
- [ ] Deployment complete
- [ ] Testing in progress
- [ ] Production ready

---

**Last Updated:** 2025-01-XX  
**Status:** Ready for Deployment

