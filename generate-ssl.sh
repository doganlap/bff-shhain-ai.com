#!/bin/bash

# SSL Certificate Generation Script for Shahin BFF
# This script generates SSL certificates for production deployment

echo "🔐 SSL Certificate Generation for Shahin BFF"
echo "=========================================="

# Create SSL directory
mkdir -p ssl
cd ssl

# Generate private key
echo "Generating private key..."
openssl genrsa -out shahin-bff.key 4096

# Generate certificate signing request (CSR)
echo "Generating Certificate Signing Request..."
openssl req -new -key shahin-bff.key -out shahin-bff.csr \
    -subj "/C=US/ST=State/L=City/O=Shahin AI/CN=bff.shahin-ai.com"

# Generate self-signed certificate (for development/testing)
echo "Generating self-signed certificate..."
openssl x509 -req -days 365 -in shahin-bff.csr -signkey shahin-bff.key -out shahin-bff.crt

# Generate DH parameters for perfect forward secrecy
echo "Generating DH parameters..."
openssl dhparam -out dhparam.pem 2048

# Set proper permissions
chmod 600 shahin-bff.key
chmod 644 shahin-bff.crt
chmod 644 dhparam.pem

echo ""
echo "✅ SSL certificates generated successfully!"
echo ""
echo "Files created:"
echo "  - ssl/shahin-bff.key (Private key)"
echo "  - ssl/shahin-bff.csr (Certificate Signing Request)"
echo "  - ssl/shahin-bff.crt (Self-signed certificate)"
echo "  - ssl/dhparam.pem (DH parameters)"
echo ""
echo "📋 Next steps:"
echo "1. For production: Submit the CSR (shahin-bff.csr) to your Certificate Authority"
echo "2. Update nginx.ssl.conf with your domain name"
echo "3. Mount the certificates in your Docker container"
echo "4. Configure Cloudflare SSL/TLS settings"
echo ""
echo "🔒 Certificate Details:"
openssl x509 -in shahin-bff.crt -text -noout | grep -A 1 "Subject:"
openssl x509 -in shahin-bff.crt -text -noout | grep -A 1 "Issuer:"
openssl x509 -in shahin-bff.crt -text -noout | grep -A 1 "Validity"