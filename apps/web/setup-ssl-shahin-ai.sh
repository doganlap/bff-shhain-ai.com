# Complete SSL & Domain Configuration for shahin-ai.com
# This script configures SSL certificates and domain settings for production

# Domain Configuration
SHAHIN_DOMAIN="shahin-ai.com"
WWW_SHAHIN_DOMAIN="www.shahin-ai.com"
GRC_DOMAIN="grc.shahin-ai.com"
GRC_BACKEND_DOMAIN="grc-backend.shahin-ai.com"

# SSL Certificate Paths
SSL_CERT_PATH="/etc/ssl/certs/shahin-ai-com.crt"
SSL_KEY_PATH="/etc/ssl/private/shahin-ai-com.key"
SSL_CHAIN_PATH="/etc/ssl/certs/shahin-ai-com-chain.crt"

# Let's Encrypt Configuration
ACME_EMAIL="admin@shahin-ai.com"
CERTBOT_DOMAINS="-d ${SHAHIN_DOMAIN} -d ${WWW_SHAHIN_DOMAIN} -d ${GRC_DOMAIN} -d ${GRC_BACKEND_DOMAIN}"

echo "🔐 Configuring SSL for shahin-ai.com domains..."
echo "📋 Primary Domain: ${SHAHIN_DOMAIN}"
echo "📋 WWW Domain: ${WWW_SHAHIN_DOMAIN}"
echo "📋 GRC Domain: ${GRC_DOMAIN}"
echo "📋 Backend Domain: ${GRC_BACKEND_DOMAIN}"

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Generate SSL certificates
echo "🔑 Generating SSL certificates with Let's Encrypt..."
sudo certbot certonly --standalone \
    --email ${ACME_EMAIL} \
    --agree-tos \
    --no-eff-email \
    ${CERTBOT_DOMAINS}

# Create comprehensive nginx configuration
echo "📝 Creating nginx configuration..."
sudo tee /etc/nginx/sites-available/shahin-ai-grc > /dev/null <<EOF
# Frontend Configuration - Main Shahin AI Site
server {
    listen 443 ssl http2;
    server_name ${SHAHIN_DOMAIN} ${WWW_SHAHIN_DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/${SHAHIN_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SHAHIN_DOMAIN}/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Robots-Tag "index, follow" always;
    
    # Frontend proxy to Vercel
    location / {
        proxy_pass https://grc.shahin-ai.com;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        # CORS headers for cross-domain access
        add_header Access-Control-Allow-Origin "https://www.shahin-ai.com,https://shahin-ai.com";
        add_header Access-Control-Allow-Credentials "true";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-Tenant-ID";
    }
    
    # GRC Platform access
    location /grc/ {
        proxy_pass https://grc.shahin-ai.com/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # GRC-specific CORS
        add_header Access-Control-Allow-Origin "https://www.shahin-ai.com";
        add_header Access-Control-Allow-Credentials "true";
    }
    
    # API access from shahin-ai.com
    location /api/ {
        proxy_pass https://grc-backend.shahin-ai.com/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # API CORS headers
        add_header Access-Control-Allow-Origin "https://www.shahin-ai.com,https://shahin-ai.com";
        add_header Access-Control-Allow-Credentials "true";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-Tenant-ID";
    }
}

# GRC Frontend Configuration
server {
    listen 443 ssl http2;
    server_name ${GRC_DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/${SHAHIN_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SHAHIN_DOMAIN}/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Frontend proxy to Vercel
    location / {
        proxy_pass https://grc.shahin-ai.com;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://www.shahin-ai.com,https://shahin-ai.com";
        add_header Access-Control-Allow-Credentials "true";
    }
}

# Backend API Configuration
server {
    listen 443 ssl http2;
    server_name ${GRC_BACKEND_DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/${SHAHIN_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SHAHIN_DOMAIN}/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    location / {
        proxy_pass http://localhost:3005;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS for cross-domain access
        add_header Access-Control-Allow-Origin "https://www.shahin-ai.com,https://shahin-ai.com,https://grc.shahin-ai.com";
        add_header Access-Control-Allow-Credentials "true";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-Tenant-ID";
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3005/health;
        access_log off;
    }
}

# HTTP to HTTPS redirect for all domains
server {
    listen 80;
    server_name ${SHAHIN_DOMAIN} ${WWW_SHAHIN_DOMAIN} ${GRC_DOMAIN} ${GRC_BACKEND_DOMAIN};
    return 301 https://\$server_name\$request_uri;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/shahin-ai-grc /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Setup automatic renewal
echo "🔄 Setting up automatic SSL renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

echo "✅ SSL Configuration Complete!"
echo ""
echo "📋 Domain Summary:"
echo "   • Main Site: https://${SHAHIN_DOMAIN}"
echo "   • WWW Site: https://${WWW_SHAHIN_DOMAIN}"
echo "   • GRC Platform: https://${GRC_DOMAIN}"
echo "   • Backend API: https://${GRC_BACKEND_DOMAIN}"
echo ""
echo "🔒 SSL Certificates: /etc/letsencrypt/live/${SHAHIN_DOMAIN}/"
echo "📝 Nginx Config: /etc/nginx/sites-available/shahin-ai-grc"
echo "🔄 Auto-renewal: Enabled via cron"