# 🌐 Domain Configuration Guide for www.shahin-ai.com

## 📋 Complete Setup Checklist

### 1. 🏷️ Domain Registration & DNS Setup

#### DNS Records Configuration:
```dns
# A Records (Point to your server IP)
www.shahin-ai.com     A     YOUR_SERVER_IP
shahin-ai.com         A     YOUR_SERVER_IP
api.shahin-ai.com     A     YOUR_SERVER_IP

# CNAME Records (Optional subdomains)
cdn.shahin-ai.com     CNAME  your-cdn-provider.com
mail.shahin-ai.com    CNAME  your-mail-provider.com

# MX Records (Email - Optional)
shahin-ai.com         MX 10  mail.shahin-ai.com

# TXT Records (Verification & Security)
shahin-ai.com         TXT    "v=spf1 include:_spf.google.com ~all"
_dmarc.shahin-ai.com  TXT    "v=DMARC1; p=quarantine; rua=mailto:dmarc@shahin-ai.com"
```

### 2. 🔐 SSL Certificate Setup

#### Using Let's Encrypt (Free):
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d www.shahin-ai.com -d shahin-ai.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Using Cloudflare (Recommended):
1. Point your domain to Cloudflare nameservers
2. Enable "Full (strict)" SSL mode
3. Enable "Always Use HTTPS"
4. Enable "HSTS" with max-age 12 months

### 3. 🌐 Web Server Configuration

#### Nginx Configuration (`/etc/nginx/sites-available/shahin-ai.com`):
```nginx
# HTTP Redirect to HTTPS
server {
    listen 80;
    server_name shahin-ai.com www.shahin-ai.com;
    return 301 https://www.shahin-ai.com$request_uri;
}

# HTTPS Main Site
server {
    listen 443 ssl http2;
    server_name www.shahin-ai.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/www.shahin-ai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.shahin-ai.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Document Root
    root /var/www/shahin-ai.com/dist;
    index index.html;
    
    # SPA Routing Support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy to Backend
    location /api/ {
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
    
    # Static Assets Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}

# Redirect non-www to www
server {
    listen 443 ssl http2;
    server_name shahin-ai.com;
    ssl_certificate /etc/letsencrypt/live/www.shahin-ai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.shahin-ai.com/privkey.pem;
    return 301 https://www.shahin-ai.com$request_uri;
}
```

### 4. 🚀 Deployment Script

#### Create `deploy-domain.sh`:
```bash
#!/bin/bash

echo "🚀 Deploying Shahin AI to www.shahin-ai.com..."

# Set production environment
export NODE_ENV=production
export VITE_API_URL=https://www.shahin-ai.com

# Build frontend
echo "📦 Building frontend for production..."
cd landing-page
npm ci
npm run build

# Copy to web server
echo "📂 Deploying to web server..."
sudo rsync -av --delete dist/ /var/www/shahin-ai.com/
sudo chown -R www-data:www-data /var/www/shahin-ai.com/

# Deploy backend
echo "🔧 Deploying backend..."
cd ../backend
npm ci --only=production
pm2 restart shahin-ai-backend || pm2 start server.js --name shahin-ai-backend

# Restart Nginx
echo "🔄 Restarting web server..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 Your site is live at: https://www.shahin-ai.com"
```

### 5. 📱 Domain Verification Setup

#### Google Search Console:
1. Go to https://search.google.com/search-console
2. Add property: www.shahin-ai.com
3. Verify via HTML file or DNS TXT record

#### Bing Webmaster Tools:
1. Go to https://www.bing.com/webmasters
2. Add site: www.shahin-ai.com
3. Verify ownership

### 6. 🔧 Environment Configuration

#### Update `.env.production`:
```env
NODE_ENV=production
DOMAIN=www.shahin-ai.com
VITE_API_URL=https://www.shahin-ai.com
PORT=3001

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your_azure_key

# Security
ALLOWED_ORIGINS=https://www.shahin-ai.com,https://shahin-ai.com
```

### 7. 🎯 Performance Optimization

#### Enable CDN (Cloudflare):
1. Enable Cloudflare proxy (orange cloud)
2. Set caching rules:
   - Static assets: Cache everything for 1 year
   - HTML: Cache for 4 hours
   - API calls: No cache

#### Enable Compression:
- Brotli compression for modern browsers
- Gzip fallback for older browsers
- Minify CSS, JS, HTML

### 8. 📊 Monitoring Setup

#### Server Monitoring:
```bash
# Install PM2 for process management
npm install -g pm2

# Start backend with PM2
pm2 start server.js --name shahin-ai-backend
pm2 startup
pm2 save
```

#### Analytics Setup:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### 9. ✅ Final Checklist

- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] Nginx configuration deployed
- [ ] Frontend built and deployed
- [ ] Backend running on PM2
- [ ] Domain verification completed
- [ ] Analytics tracking setup
- [ ] Performance optimization enabled
- [ ] Security headers configured
- [ ] Backup strategy implemented

### 10. 🔗 Quick Commands

#### Test SSL:
```bash
curl -I https://www.shahin-ai.com
```

#### Test API:
```bash
curl https://www.shahin-ai.com/api/ai/health
```

#### Check Nginx configuration:
```bash
sudo nginx -t
```

#### View logs:
```bash
sudo tail -f /var/log/nginx/access.log
pm2 logs shahin-ai-backend
```

---

## 🎉 Congratulations!

Your domain **www.shahin-ai.com** is now ready for deployment with:
- ✅ SSL/HTTPS security
- ✅ API integration 
- ✅ SEO optimization
- ✅ Performance optimization
- ✅ Monitoring setup

Visit **https://www.shahin-ai.com** to see your AI-powered GRC platform live!