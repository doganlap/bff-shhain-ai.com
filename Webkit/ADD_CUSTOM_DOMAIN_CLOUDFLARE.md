# Add Custom Domain to Cloudflare Pages

## Quick Guide

### Step 1: Open Cloudflare Dashboard
**URL**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/domains

### Step 2: Add Custom Domain

1. **Navigate to Custom Domains:**
   - Go to: **Pages** → **shahin-grc-landing** → **Custom domains**
   - Click: **Set up a custom domain**

2. **Enter Domain:**
   - Domain: `www.shahin-ai.com`
   - Click: **Continue**

3. **Configure DNS:**
   - Cloudflare will automatically configure DNS
   - Wait for DNS propagation (< 5 minutes)

4. **SSL Certificate:**
   - Cloudflare will automatically issue SSL certificate
   - Wait for certificate activation (< 5 minutes)

### Step 3: Verify Domain

1. **Check DNS:**
   - Go to: **DNS** → **Records**
   - Verify: `www.shahin-ai.com` CNAME record exists
   - Points to: `shahin-grc-landing.pages.dev`

2. **Check SSL:**
   - Go to: **SSL/TLS** → **Overview`
   - Status: ✅ Active (Full)
   - Certificate: ✅ Valid

3. **Test Domain:**
   - Visit: https://www.shahin-ai.com
   - Should load your site
   - SSL certificate should be valid

## Domain Configuration

### DNS Records
Cloudflare will automatically create:
- **Type**: CNAME
- **Name**: `www`
- **Target**: `shahin-grc-landing.pages.dev`
- **Proxy**: ✅ Proxied (orange cloud)

### SSL Certificate
- **Type**: Universal SSL (Free)
- **Status**: Active
- **Expiry**: Auto-renewed
- **Coverage**: `www.shahin-ai.com`

## Troubleshooting

### Domain Not Working
- ✅ Check DNS propagation (can take up to 24 hours)
- ✅ Verify DNS records are correct
- ✅ Check SSL certificate status
- ✅ Clear browser cache

### SSL Certificate Issues
- ✅ Wait for certificate activation (< 5 minutes)
- ✅ Check SSL/TLS settings (should be "Full")
- ✅ Verify domain is proxied (orange cloud)

### DNS Propagation
- ✅ Use: https://www.whatsmydns.net
- ✅ Check: `www.shahin-ai.com`
- ✅ Should resolve to Cloudflare IPs

## Quick Links

- **Custom Domains**: https://dash.cloudflare.com/pages/view/shahin-grc-landing/domains
- **DNS Settings**: https://dash.cloudflare.com
- **SSL/TLS**: https://dash.cloudflare.com

## Script

Run the automated setup script:
```bash
COMPLETE_CLOUDFLARE_SETUP.bat
```

This will open all the necessary pages and guide you through the setup.

