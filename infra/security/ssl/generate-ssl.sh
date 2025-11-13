#!/bin/bash

# SSL Certificate Generation Script for GRC Application
# Supports both self-signed (development) and Let's Encrypt (production)

set -e

DOMAIN=${1:-localhost}
SSL_DIR="/app/ssl"
COUNTRY="SA"
STATE="Riyadh"
CITY="Riyadh"
ORG="Shahin-AI"
OU="GRC Platform"

echo "🔐 Generating SSL certificates for domain: $DOMAIN"

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

# Function to generate self-signed certificate
generate_self_signed() {
    echo "📝 Generating self-signed certificate for development..."
    
    # Generate private key
    openssl genrsa -out $SSL_DIR/private.key 2048
    
    # Generate certificate signing request
    openssl req -new -key $SSL_DIR/private.key -out $SSL_DIR/cert.csr -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=$DOMAIN"
    
    # Generate self-signed certificate
    openssl x509 -req -days 365 -in $SSL_DIR/cert.csr -signkey $SSL_DIR/private.key -out $SSL_DIR/certificate.crt
    
    # Create combined certificate for nginx
    cat $SSL_DIR/certificate.crt > $SSL_DIR/fullchain.pem
    cp $SSL_DIR/private.key $SSL_DIR/privkey.pem
    
    echo "✅ Self-signed certificate generated successfully"
}

# Function to generate Let's Encrypt certificate
generate_letsencrypt() {
    echo "🌐 Generating Let's Encrypt certificate for production..."
    
    # Install certbot if not available
    if ! command -v certbot &> /dev/null; then
        echo "Installing certbot..."
        apt-get update && apt-get install -y certbot
    fi
    
    # Generate certificate using webroot method
    certbot certonly --webroot \
        --webroot-path=/var/www/html \
        --email admin@$DOMAIN \
        --agree-tos \
        --no-eff-email \
        --domains $DOMAIN
    
    # Copy certificates to SSL directory
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/
    
    echo "✅ Let's Encrypt certificate generated successfully"
}

# Function to setup certificate renewal
setup_renewal() {
    echo "⏰ Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
if [ $? -eq 0 ]; then
    docker-compose restart nginx
    echo "$(date): SSL certificate renewed successfully" >> /var/log/ssl-renewal.log
fi
EOF
    
    chmod +x /usr/local/bin/renew-ssl.sh
    
    # Add to crontab (runs twice daily)
    (crontab -l 2>/dev/null; echo "0 */12 * * * /usr/local/bin/renew-ssl.sh") | crontab -
    
    echo "✅ Automatic renewal configured"
}

# Main execution
case "${2:-self-signed}" in
    "letsencrypt"|"production")
        generate_letsencrypt
        setup_renewal
        ;;
    "self-signed"|"development"|*)
        generate_self_signed
        ;;
esac

# Set proper permissions
chmod 600 $SSL_DIR/privkey.pem
chmod 644 $SSL_DIR/fullchain.pem

echo "🎉 SSL setup completed for $DOMAIN"
echo "📁 Certificates location: $SSL_DIR"
echo "🔧 Update your nginx configuration to use these certificates"
