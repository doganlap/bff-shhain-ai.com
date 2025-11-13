# 🔒 SSL/HTTPS Setup Guide - GRC Platform

**Target:** Production HTTPS deployment  
**Time Required:** 30-60 minutes  
**Difficulty:** Intermediate

---

## 📋 Prerequisites

- [ ] Domain name configured (e.g., grc.yourcompany.com)
- [ ] DNS A record pointing to your server IP
- [ ] Server accessible on ports 80 and 443
- [ ] Root/sudo access to server

---

## 🎯 Option 1: Let's Encrypt (Recommended - FREE)

### Why Let's Encrypt?
✅ **Free** - No cost forever  
✅ **Automated** - Auto-renewal every 90 days  
✅ **Trusted** - Recognized by all browsers  
✅ **Easy** - One command setup  

### Step-by-Step Setup

#### 1. Install Certbot

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y
```

**CentOS/RHEL:**
```bash
sudo yum install certbot python3-certbot-nginx -y
```

**Windows:**
```powershell
# Use Win-ACME
choco install win-acme
```

#### 2. Stop Services (Temporarily)
```bash
# Certbot needs port 80
docker-compose stop bff web
```

#### 3. Generate Certificate

**Standalone Mode (Easiest):**
```bash
sudo certbot certonly --standalone \
  -d grc.yourcompany.com \
  -d api.grc.yourcompany.com \
  --email admin@yourcompany.com \
  --agree-tos \
  --non-interactive
```

**Expected Output:**
```
Congratulations! Your certificate and chain have been saved at:
/etc/letsencrypt/live/grc.yourcompany.com/fullchain.pem

Your key file has been saved at:
/etc/letsencrypt/live/grc.yourcompany.com/privkey.pem

Your certificate will expire on 2024-04-15.
```

#### 4. Verify Certificates
```bash
sudo ls -la /etc/letsencrypt/live/grc.yourcompany.com/
# Should see:
# fullchain.pem  (certificate + intermediate)
# privkey.pem    (private key)
# cert.pem       (certificate only)
# chain.pem      (intermediate only)
```

#### 5. Update .env Configuration
```bash
# Edit apps/bff/.env
SSL_ENABLED=true
SSL_CERT_PATH=/etc/letsencrypt/live/grc.yourcompany.com
SSL_KEY_PATH=/etc/letsencrypt/live/grc.yourcompany.com
NODE_ENV=production
```

#### 6. Update Docker Compose

**Add volume mounts to docker-compose.yml:**
```yaml
services:
  bff:
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
    environment:
      - SSL_ENABLED=true
      - SSL_CERT_PATH=/etc/letsencrypt/live/grc.yourcompany.com
      - SSL_KEY_PATH=/etc/letsencrypt/live/grc.yourcompany.com
    ports:
      - "443:3005"  # HTTPS
      - "80:3005"   # HTTP (will redirect)
```

#### 7. Start Services
```bash
docker-compose up -d
```

#### 8. Test HTTPS
```bash
# Test connection
curl -I https://grc.yourcompany.com/health

# Should return:
HTTP/2 200
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-request-id: req_...
```

#### 9. Setup Auto-Renewal

**Test renewal:**
```bash
sudo certbot renew --dry-run
```

**Add cron job:**
```bash
sudo crontab -e

# Add this line (renew daily, actual renewal only if <30 days left)
0 3 * * * certbot renew --quiet --deploy-hook "docker-compose -f /path/to/docker-compose.yml restart bff"
```

#### 10. Verify SSL Configuration

**SSL Labs Test:**
```
Visit: https://www.ssllabs.com/ssltest/analyze.html?d=grc.yourcompany.com
Target: A+ rating
```

---

## 🏢 Option 2: Commercial Certificate (DigiCert, GlobalSign)

### Step 1: Generate Certificate Signing Request (CSR)

```bash
# Create private key
openssl genrsa -out grc.yourcompany.com.key 2048

# Generate CSR
openssl req -new -key grc.yourcompany.com.key \
  -out grc.yourcompany.com.csr

# You'll be asked:
# Country Name: US
# State: California
# Locality: San Francisco
# Organization: Your Company Inc
# Common Name: grc.yourcompany.com
# Email: admin@yourcompany.com
```

### Step 2: Purchase Certificate

1. Go to DigiCert, GlobalSign, or other CA
2. Choose "SSL/TLS Certificate"
3. Submit the CSR file
4. Complete domain validation (email, DNS, or file)
5. Wait for certificate issuance (minutes to days)

### Step 3: Download Certificate

You'll receive:
- `grc.yourcompany.com.crt` (your certificate)
- `intermediate.crt` (CA intermediate)
- `root.crt` (CA root - optional)

### Step 4: Combine Certificates

```bash
# Create full chain
cat grc.yourcompany.com.crt intermediate.crt root.crt > fullchain.pem
```

### Step 5: Install Certificate

```bash
# Create SSL directory
sudo mkdir -p /etc/ssl/grc
sudo chmod 700 /etc/ssl/grc

# Copy files
sudo cp fullchain.pem /etc/ssl/grc/cert.pem
sudo cp grc.yourcompany.com.key /etc/ssl/grc/key.pem

# Set permissions
sudo chmod 600 /etc/ssl/grc/key.pem
sudo chmod 644 /etc/ssl/grc/cert.pem
```

### Step 6: Update .env
```bash
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/grc
SSL_KEY_PATH=/etc/ssl/grc
```

### Step 7: Test & Deploy
```bash
docker-compose restart bff
curl -I https://grc.yourcompany.com/health
```

---

## 🔧 Option 3: Self-Signed Certificate (Development Only)

**⚠️ WARNING: Only for development/testing! Not for production!**

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout selfsigned.key \
  -out selfsigned.crt \
  -subj "/CN=localhost"

# Create directory
mkdir -p certs

# Move files
mv selfsigned.crt certs/cert.pem
mv selfsigned.key certs/key.pem

# Update .env
SSL_ENABLED=true
SSL_CERT_PATH=./certs
SSL_KEY_PATH=./certs

# Test (ignore certificate warning)
curl -k https://localhost:3005/health
```

---

## 🐳 Docker-Specific Configuration

### Nginx Reverse Proxy (Recommended)

Create `nginx/nginx.conf`:
```nginx
upstream backend {
    server bff:3005;
}

server {
    listen 80;
    server_name grc.yourcompany.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name grc.yourcompany.com;

    ssl_certificate /etc/letsencrypt/live/grc.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/grc.yourcompany.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Update `docker-compose.yml`:
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - bff
```

---

## ✅ Post-Setup Verification

### 1. Check Certificate
```bash
openssl s_client -connect grc.yourcompany.com:443 -servername grc.yourcompany.com

# Look for:
# - Certificate chain OK
# - Verify return code: 0 (ok)
```

### 2. Test HTTP to HTTPS Redirect
```bash
curl -I http://grc.yourcompany.com/health

# Should return:
HTTP/1.1 301 Moved Permanently
Location: https://grc.yourcompany.com/health
```

### 3. Test HSTS Header
```bash
curl -I https://grc.yourcompany.com/health | grep -i strict

# Should return:
strict-transport-security: max-age=31536000; includeSubDomains; preload
```

### 4. Check Certificate Expiry
```bash
echo | openssl s_client -connect grc.yourcompany.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# notBefore=Jan 15 00:00:00 2024 GMT
# notAfter=Apr 15 23:59:59 2024 GMT
```

### 5. SSL Labs Test
```
Visit: https://www.ssllabs.com/ssltest/
Enter: grc.yourcompany.com
Target: A+ rating
```

### 6. Browser Test
```
Open: https://grc.yourcompany.com
Look for: 🔒 Secure padlock in address bar
Click padlock: Should show valid certificate
```

---

## 🚨 Troubleshooting

### Issue: Certificate Not Found
```bash
# Check path
sudo ls -la /etc/letsencrypt/live/grc.yourcompany.com/

# Check permissions
sudo ls -l /etc/letsencrypt/archive/grc.yourcompany.com/

# Fix permissions if needed
sudo chmod 755 /etc/letsencrypt/live
sudo chmod 755 /etc/letsencrypt/archive
```

### Issue: Permission Denied
```bash
# Docker needs access to certificates
sudo chmod 755 /etc/letsencrypt/live/grc.yourcompany.com/
sudo chmod 644 /etc/letsencrypt/live/grc.yourcompany.com/fullchain.pem
```

### Issue: Auto-Renewal Fails
```bash
# Test renewal manually
sudo certbot renew --dry-run

# Check cron logs
grep CRON /var/log/syslog

# Restart nginx/bff after renewal
sudo certbot renew --deploy-hook "systemctl reload nginx"
```

### Issue: Mixed Content Warning
```javascript
// Frontend: Check all HTTP resources
// Change to HTTPS or protocol-relative
<script src="//cdn.example.com/script.js"></script>

// In React
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://grc.yourcompany.com'
  : 'http://localhost:3005';
```

---

## 📊 Monitoring Certificate Expiry

### Option 1: Manual Check
```bash
# Check expiry date
openssl s_client -connect grc.yourcompany.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# Days until expiry
echo $(($(date -d "$(openssl s_client -connect grc.yourcompany.com:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)" +%s) - $(date +%s))) / 86400 | bc)
```

### Option 2: Monitoring Service
- **UptimeRobot** - Free SSL monitoring
- **Pingdom** - SSL certificate monitoring
- **SSL Monitor** - Dedicated SSL monitoring

### Option 3: Custom Script
```bash
#!/bin/bash
# Add to crontab: 0 9 * * * /path/to/check-ssl.sh

DOMAIN="grc.yourcompany.com"
DAYS_WARNING=30

expiry=$(echo | openssl s_client -connect $DOMAIN:443 2>/dev/null | \
         openssl x509 -noout -enddate | cut -d= -f2)
expiry_epoch=$(date -d "$expiry" +%s)
now_epoch=$(date +%s)
days_left=$(( ($expiry_epoch - $now_epoch) / 86400 ))

if [ $days_left -lt $DAYS_WARNING ]; then
    echo "WARNING: SSL certificate for $DOMAIN expires in $days_left days!"
    # Send email/Slack notification
fi
```

---

## 🎯 Security Best Practices

### 1. Use Strong Ciphers
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;
```

### 2. Enable HSTS
```javascript
// Already implemented in config/https.js
app.use((req, res, next) => {
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  next();
});
```

### 3. Implement OCSP Stapling
```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/grc.yourcompany.com/chain.pem;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
```

### 4. Disable Old Protocols
```nginx
# Only TLS 1.2 and 1.3
ssl_protocols TLSv1.2 TLSv1.3;

# NO SSLv3, TLS 1.0, TLS 1.1
```

### 5. Regular Updates
```bash
# Update certbot
sudo apt-get update && sudo apt-get upgrade certbot

# Renew certificates
sudo certbot renew
```

---

## 📋 Production Checklist

- [ ] SSL certificate installed
- [ ] HTTP redirects to HTTPS
- [ ] HSTS header present
- [ ] Certificate auto-renewal configured
- [ ] SSL Labs test: A+ rating
- [ ] All resources loaded over HTTPS
- [ ] Certificate expiry monitoring setup
- [ ] Tested on multiple browsers
- [ ] Mobile devices tested
- [ ] Certificate backup secured

---

## 📞 Support Resources

- **Let's Encrypt Docs:** https://letsencrypt.org/docs/
- **SSL Labs Test:** https://www.ssllabs.com/ssltest/
- **Certbot Docs:** https://certbot.eff.org/docs/
- **Mozilla SSL Config:** https://ssl-config.mozilla.org/

---

**SSL Setup Complete!** 🔒

Your GRC platform is now secure with HTTPS. Users will see the padlock icon and all data is encrypted in transit.
