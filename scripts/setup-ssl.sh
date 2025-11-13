#!/bin/bash

# 🔐 SSL Certificate Setup Script for GRC Platform
# This script sets up Let's Encrypt SSL certificates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
else
    print_error ".env.production file not found!"
    print_warning "Please create .env.production with your domain configuration"
    exit 1
fi

# Validate required variables
if [ -z "$DOMAIN_NAME" ] || [ -z "$ADMIN_EMAIL" ]; then
    print_error "DOMAIN_NAME and ADMIN_EMAIL must be set in .env.production"
    exit 1
fi

print_status "Setting up SSL certificates for $DOMAIN_NAME"

# Create directories
sudo mkdir -p /etc/letsencrypt
sudo mkdir -p /var/www/certbot

# Set proper permissions
sudo chown -R $USER:$USER /var/www/certbot

print_status "Starting nginx for initial certificate request..."

# Start nginx with HTTP only configuration for initial setup
docker-compose -f infra/deployment/docker-compose.production.yml up -d nginx

# Wait for nginx to start
sleep 10

print_status "Requesting SSL certificate from Let's Encrypt..."

# Request certificate using certbot
docker-compose -f infra/deployment/docker-compose.production.yml run --rm certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email $ADMIN_EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN_NAME \
    -d www.$DOMAIN_NAME

if [ $? -eq 0 ]; then
    print_success "SSL certificate obtained successfully!"
    
    # Update nginx configuration with SSL
    print_status "Updating nginx configuration for HTTPS..."
    
    # Replace domain placeholders in nginx config
    sed -i "s/DOMAIN_NAME/$DOMAIN_NAME/g" infra/deployment/nginx.production.conf
    
    # Restart nginx with SSL configuration
    docker-compose -f infra/deployment/docker-compose.production.yml restart nginx
    
    print_success "SSL setup completed successfully!"
    print_success "Your site should now be available at https://$DOMAIN_NAME"
    
    # Set up certificate renewal
    print_status "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > /tmp/renew-certs.sh << EOF
#!/bin/bash
cd $(pwd)
docker-compose -f infra/deployment/docker-compose.production.yml run --rm certbot renew --quiet
docker-compose -f infra/deployment/docker-compose.production.yml restart nginx
EOF
    
    sudo mv /tmp/renew-certs.sh /etc/cron.daily/renew-grc-certs
    sudo chmod +x /etc/cron.daily/renew-grc-certs
    
    print_success "Automatic certificate renewal configured"
    
else
    print_error "Failed to obtain SSL certificate"
    print_warning "Please check your domain DNS settings and try again"
    exit 1
fi

# Test SSL configuration
print_status "Testing SSL configuration..."
sleep 5

if curl -s -I https://$DOMAIN_NAME | grep -q "200 OK"; then
    print_success "SSL test passed! Site is accessible via HTTPS"
else
    print_warning "SSL test failed. Please check the configuration manually"
fi

print_success "SSL setup script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test your site: https://$DOMAIN_NAME"
echo "2. Check SSL rating: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN_NAME"
echo "3. Monitor certificate expiry (auto-renewal is configured)"
