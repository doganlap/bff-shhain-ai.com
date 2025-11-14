# SSL Certificate Configuration for GRC Platform
# This configuration sets up SSL certificates for the production deployment

# Domain Configuration
DOMAIN="grc.shahin-ai.com"
BACKEND_DOMAIN="grc-backend.shahin-ai.com"
SHAHIN_DOMAIN="www.shahin-ai.com"

# SSL Certificate Configuration
SSL_CERT_PATH="/etc/ssl/certs/grc-shahin-ai-com.crt"
SSL_KEY_PATH="/etc/ssl/private/grc-shahin-ai-com.key"
SSL_CHAIN_PATH="/etc/ssl/certs/grc-shahin-ai-com-chain.crt"

# Let's Encrypt Configuration (if using ACME)
ACME_EMAIL="admin@shahin-ai.com"
ACME_STAGING=false

# Nginx SSL Configuration
NGINX_SSL_CONFIG="""
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    ssl_certificate ${SSL_CERT_PATH};
    ssl_certificate_key ${SSL_KEY_PATH};
    ssl_trusted_certificate ${SSL_CHAIN_PATH};
    
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
    
    # Frontend proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3005;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://www.shahin-ai.com";
        add_header Access-Control-Allow-Credentials "true";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
    }
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}
"""

# Backend SSL Configuration
BACKEND_SSL_CONFIG="""
server {
    listen 443 ssl http2;
    server_name ${BACKEND_DOMAIN};
    
    ssl_certificate ${SSL_CERT_PATH};
    ssl_certificate_key ${SSL_KEY_PATH};
    ssl_trusted_certificate ${SSL_CHAIN_PATH};
    
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
    }
}

server {
    listen 80;
    server_name ${BACKEND_DOMAIN};
    return 301 https://\$server_name\$request_uri;
}
"""

echo "🔐 SSL Configuration Generated"
echo "📋 Frontend Domain: ${DOMAIN}"
echo "📋 Backend Domain: ${BACKEND_DOMAIN}"
echo "📋 Shahin AI Domain: ${SHAHIN_DOMAIN}"
echo ""
echo "📝 Nginx Configuration:"
echo "${NGINX_SSL_CONFIG}" > nginx-frontend.conf
echo "${BACKEND_SSL_CONFIG}" > nginx-backend.conf

echo ""
echo "🔧 Next Steps:"
echo "1. Obtain SSL certificates for domains"
echo "2. Configure DNS A records to point to server IP"
echo "3. Install nginx and copy configurations"
echo "4. Test SSL configuration"
echo "5. Enable automatic HTTPS redirects"