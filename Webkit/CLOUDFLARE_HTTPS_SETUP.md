# Cloudflare HTTPS Configuration for www.shahin-ai.com

## Automatic HTTPS with Cloudflare

Cloudflare provides automatic HTTPS for all domains. Here's how to configure it:

### Step 1: SSL/TLS Settings

1. Go to Cloudflare Dashboard → SSL/TLS
2. Set encryption mode to **Full (strict)**
   - This ensures end-to-end encryption between Cloudflare and your origin server
3. Enable **Always Use HTTPS**
   - Automatically redirects HTTP to HTTPS
4. Enable **Automatic HTTPS Rewrites**
   - Rewrites HTTP URLs to HTTPS in your HTML

### Step 2: SSL/TLS Configuration

#### For Cloudflare Pages (Frontend)
- **Automatic HTTPS:** Enabled by default
- **Certificate:** Cloudflare automatically provisions SSL certificates
- **No configuration needed** - HTTPS works out of the box

#### For Backend API (api.shahin-ai.com)
- **If using Cloudflare Workers:** HTTPS enabled automatically
- **If using VPS/Server:** 
  1. Install SSL certificate (Let's Encrypt recommended)
  2. Configure reverse proxy (Nginx/Apache)
  3. Set Cloudflare SSL mode to "Full (strict)"

### Step 3: SSL Certificate Setup (Backend Server)

#### Option A: Let's Encrypt (Free)
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d api.shahin-ai.com

# Certificate location:
# /etc/letsencrypt/live/api.shahin-ai.com/fullchain.pem
# /etc/letsencrypt/live/api.shahin-ai.com/privkey.pem
```

#### Option B: Cloudflare Origin Certificate (Recommended)
1. Go to Cloudflare Dashboard → SSL/TLS → Origin Server
2. Click "Create Certificate"
3. Select:
   - Private key type: RSA (2048)
   - Hostnames: `api.shahin-ai.com`, `*.shahin-ai.com`
   - Certificate validity: 15 years
4. Download certificate and private key
5. Install on your server

### Step 4: Nginx Configuration (Backend)

```nginx
server {
    listen 443 ssl http2;
    server_name api.shahin-ai.com;

    ssl_certificate /etc/letsencrypt/live/api.shahin-ai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.shahin-ai.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.shahin-ai.com;
    return 301 https://$server_name$request_uri;
}
```

### Step 5: Update Backend for HTTPS

Update `backend/server.js` to trust proxies:

```javascript
// Trust proxy (for Cloudflare)
app.set('trust proxy', true);

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Step 6: Update Frontend URLs

Ensure all API calls use HTTPS:

```javascript
// In landing-page/services/bookingService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'

// In landing-page/services/sandboxService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'
```

### Step 7: CORS Configuration

Update CORS to allow HTTPS origins:

```javascript
const corsOptions = {
  origin: [
    'https://www.shahin-ai.com',
    'https://shahin-ai.com',
    'https://*.shahin-ai.com',
    /\.shahin-ai\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

### Step 8: Verify HTTPS

#### Test Frontend
```bash
curl -I https://www.shahin-ai.com
# Should return: HTTP/2 200
```

#### Test Backend
```bash
curl -I https://api.shahin-ai.com/health
# Should return: HTTP/2 200
```

#### Test SSL Certificate
```bash
openssl s_client -connect www.shahin-ai.com:443 -servername www.shahin-ai.com
```

### Step 9: Security Headers (Cloudflare)

Configure in Cloudflare Dashboard → Rules → Transform Rules:

#### Response Headers
1. **Strict-Transport-Security**
   - Value: `max-age=31536000; includeSubDomains; preload`

2. **X-Content-Type-Options**
   - Value: `nosniff`

3. **X-Frame-Options**
   - Value: `DENY`

4. **X-XSS-Protection**
   - Value: `1; mode=block`

5. **Referrer-Policy**
   - Value: `strict-origin-when-cross-origin`

6. **Content-Security-Policy**
   - Value: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`

### Step 10: Auto-Renewal (Let's Encrypt)

```bash
# Create renewal script
sudo nano /etc/cron.monthly/certbot-renew

# Add:
#!/bin/bash
certbot renew --quiet --post-hook "systemctl reload nginx"

# Make executable
sudo chmod +x /etc/cron.monthly/certbot-renew
```

### Troubleshooting

#### Mixed Content Warnings
- Ensure all resources (images, scripts, styles) use HTTPS
- Check browser console for mixed content errors
- Use relative URLs or protocol-relative URLs

#### Certificate Errors
- Verify certificate is valid and not expired
- Check certificate chain is complete
- Ensure server time is synchronized

#### CORS Errors with HTTPS
- Verify CORS configuration allows HTTPS origins
- Check that credentials are properly configured
- Ensure preflight requests are handled

#### Cloudflare SSL Errors
- Check SSL/TLS mode is set to "Full (strict)"
- Verify origin certificate is installed correctly
- Check that backend server is accessible

### Quick Checklist

- [ ] SSL/TLS mode set to "Full (strict)"
- [ ] "Always Use HTTPS" enabled
- [ ] SSL certificate installed on backend server
- [ ] Nginx/Apache configured for HTTPS
- [ ] Backend server trusts proxy headers
- [ ] CORS configured for HTTPS origins
- [ ] Frontend URLs updated to HTTPS
- [ ] Security headers configured
- [ ] Certificate auto-renewal configured
- [ ] HTTPS tested and verified

---

## Admin Dashboard Access

### Access Admin Dashboard
- **URL:** `https://api.shahin-ai.com/admin`
- **Authentication:** Admin secret (set in `ADMIN_SECRET` environment variable)
- **Default Secret:** `admin-secret-change-in-production` (change in production!)

### Features
- System health monitoring
- Statistics dashboard
- File upload/download
- Sandbox session management
- Landing request management
- Contact message management
- SQL query execution (read-only)

### Security
- Admin secret required for all endpoints
- Rate limiting on admin endpoints
- Input sanitization
- Read-only SQL queries only
- File upload size limits (50MB)

---

**Status:** Ready for HTTPS deployment  
**Last Updated:** 2025-01-XX

