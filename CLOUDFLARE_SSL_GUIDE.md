# Cloudflare SSL Configuration Guide for Shahin BFF

## 🌐 Cloudflare SSL Setup Instructions

### Step 1: Domain Configuration
1. **Add Domain to Cloudflare:**
   - Login to Cloudflare Dashboard
   - Add your domain (e.g., `shahin-ai.com`)
   - Update nameservers to Cloudflare's nameservers

2. **DNS Records Setup:**
   ```
   Type: A
   Name: bff
   IPv4 Address: [YOUR_SERVER_IP]
   Proxy Status: Proxied (🟢)
   TTL: Auto
   ```

### Step 2: SSL/TLS Configuration

#### Option A: Cloudflare Flexible SSL (Recommended)
1. **SSL/TLS Mode:**
   - Go to SSL/TLS → Overview
   - Select **"Flexible"** mode
   - This encrypts traffic between Cloudflare and visitors
   - Traffic between Cloudflare and your server is HTTP

2. **Always Use HTTPS:**
   - Go to SSL/TLS → Edge Certificates
   - Enable **"Always Use HTTPS"**

3. **Automatic HTTPS Rewrites:**
   - Enable **"Automatic HTTPS Rewrites"**

#### Option B: Cloudflare Full SSL (Advanced)
1. **Generate Origin Certificate:**
   - Go to SSL/TLS → Origin Server
   - Click **"Create Certificate"**
   - Choose **"Generate private key and CSR with Cloudflare"**
   - Add hostnames: `bff.shahin-ai.com, *.shahin-ai.com`
   - Certificate Validity: 15 years
   - Click **"Create"**

2. **Save Certificates:**
   - Copy the Origin Certificate to `ssl/cloudflare-origin.crt`
   - Copy the Private Key to `ssl/cloudflare-origin.key`

3. **Update Nginx Configuration:**
   - Use `nginx.ssl.conf` configuration
   - Update certificate paths in the SSL server block

### Step 3: Security Settings

1. **Firewall Rules:**
   ```
   Rule Name: Allow BFF Traffic
   Field: URL Path
   Operator: Contains
   Value: /api/
   Action: Allow
   ```

2. **Rate Limiting:**
   ```
   Threshold: 100 requests per minute
   Action: Challenge (CAPTCHA)
   Duration: 1 hour
   ```

3. **Bot Management:**
   - Enable **"Bot Fight Mode"** for basic protection
   - Or use **"Super Bot Fight Mode"** for advanced protection

### Step 4: Performance Optimization

1. **Caching:**
   - Go to Caching → Configuration
   - Set **"Browser Cache TTL"** to 4 hours
   - Enable **"Always Online"**

2. **Speed:**
   - Enable **"Auto Minify"** for JavaScript, CSS, HTML
   - Enable **"Brotli"** compression
   - Enable **"Rocket Loader"** (test carefully)

### Step 5: DNS and Traffic

1. **Page Rules (Optional):**
   ```
   URL Pattern: bff.shahin-ai.com/api/*
   Settings:
   - Cache Level: Bypass
   - Security Level: Essentially Off
   - SSL: Flexible
   ```

2. **Load Balancing (Optional):**
   - Create load balancer for multiple BFF instances
   - Set health checks to `/health` endpoint
   - Configure failover rules

## 🔧 Docker SSL Configuration

### Update docker-compose.yml:
```yaml
nginx:
  image: nginx:alpine
  ports:
    - "443:443"   # Add HTTPS port
  volumes:
    - ./nginx.ssl.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/nginx/ssl:ro
  depends_on:
    - bff
  networks:
    - bff-network
```

### SSL Certificate Mounting:
```yaml
volumes:
  - ./ssl/shahin-bff.crt:/etc/nginx/ssl/cert.pem:ro
  - ./ssl/shahin-bff.key:/etc/nginx/ssl/key.pem:ro
  - ./ssl/dhparam.pem:/etc/nginx/ssl/dhparam.pem:ro
```

## 🚀 Deployment Commands

### Generate SSL Certificates:
```bash
cd apps/bff
chmod +x generate-ssl.sh
./generate-ssl.sh
```

### Deploy with SSL:
```bash
# Stop current services
docker-compose down

# Rebuild with SSL configuration
docker-compose -f docker-compose.ssl.yml up -d

# Or update existing docker-compose.yml
docker-compose up -d
```

## 🧪 Testing SSL Configuration

### Test HTTPS Endpoint:
```bash
# Test local SSL
curl -k https://localhost:443/health

# Test through Cloudflare
curl https://bff.shahin-ai.com/health
curl https://bff.shahin-ai.com/api/health
```

### SSL Certificate Check:
```bash
# Check certificate details
openssl s_client -connect bff.shahin-ai.com:443 -servername bff.shahin-ai.com < /dev/null

# Check SSL grade
# Use online tools like SSL Labs: https://www.ssllabs.com/ssltest/
```

## 📋 Production Checklist

- [ ] Domain added to Cloudflare
- [ ] DNS records configured and proxied
- [ ] SSL mode configured (Flexible/Full)
- [ ] Always HTTPS enabled
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] SSL certificates generated and mounted
- [ ] Docker services running with SSL
- [ ] Health checks passing
- [ ] API endpoints accessible via HTTPS
- [ ] Frontend can reach BFF through HTTPS

## 🔧 Troubleshooting

### Common Issues:
1. **Too Many Redirects:**
   - Check SSL mode in Cloudflare (Flexible vs Full)
   - Verify Nginx redirect configuration

2. **Certificate Errors:**
   - Ensure certificates are properly mounted in Docker
   - Check file permissions (600 for private key)

3. **Cloudflare 520/521 Errors:**
   - Check if BFF service is running
   - Verify firewall allows Cloudflare IPs
   - Check Nginx error logs

### Logs:
```bash
# Check Nginx logs
docker logs shahin-nginx

# Check BFF logs
docker logs shahin-bff

# Check SSL certificate details
docker exec shahin-nginx openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout
```