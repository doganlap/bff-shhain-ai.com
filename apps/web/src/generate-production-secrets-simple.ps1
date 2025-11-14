# Production Secrets Generation Script
# Generates cryptographically secure secrets for production deployment

Write-Host "==================================================="
Write-Host "PRODUCTION SECRETS GENERATION"
Write-Host "==================================================="
Write-Host ""

# Function to generate base64 keys
function Generate-Base64Key {
    param([int]$Bytes = 32)

    $randomBytes = New-Object byte[] $Bytes
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($randomBytes)
    return [Convert]::ToBase64String($randomBytes)
}

Write-Host "Generating Production-Grade Secrets..."
Write-Host "---------------------------------------------------"

# Generate JWT Secrets (512-bit for RSA-like strength)
$JWT_SECRET = Generate-Base64Key -Bytes 64
$JWT_REFRESH_SECRET = Generate-Base64Key -Bytes 64

Write-Host "JWT Secrets Generated (512-bit strength)"

# Generate Database Passwords
$DB_PASSWORD = Generate-Base64Key -Bytes 24
$DB_ADMIN_PASSWORD = Generate-Base64Key -Bytes 24

Write-Host "Database Passwords Generated"

# Generate Encryption Keys
$ENCRYPTION_KEY = Generate-Base64Key -Bytes 32  # 256-bit AES
$SESSION_SECRET = Generate-Base64Key -Bytes 32

Write-Host "Encryption Keys Generated (256-bit AES)"

# Generate Service Tokens
$SERVICE_TOKEN = Generate-Base64Key -Bytes 24
$API_SECRET_KEY = Generate-Base64Key -Bytes 32

Write-Host "Service Tokens Generated"

# Generate Redis Password
$REDIS_PASSWORD = Generate-Base64Key -Bytes 24

Write-Host "Redis Password Generated"

# Create production environment file
$envContent = @"
# GRC Platform Production Environment Variables
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Security Level: Production-Grade (256-512 bit)

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ALGORITHM=HS256

# Database Configuration
DB_PASSWORD=$DB_PASSWORD
DB_ADMIN_PASSWORD=$DB_ADMIN_PASSWORD
DB_HOST=postgres
DB_PORT=5432
DB_NAME=grc_ecosystem
DB_USER=grc_user

# Encryption Configuration
ENCRYPTION_KEY=$ENCRYPTION_KEY
SESSION_SECRET=$SESSION_SECRET

# Service Authentication
SERVICE_TOKEN=$SERVICE_TOKEN
API_SECRET_KEY=$API_SECRET_KEY

# Redis Configuration
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_HOST=redis
REDIS_PORT=6379

# Security Configuration
BCRYPT_ROUNDS=14
SESSION_TIMEOUT=3600
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Environment
NODE_ENV=production
LOG_LEVEL=info
"@

# Ensure directory exists
$deployDir = "infra\deployment"
if (!(Test-Path $deployDir)) {
    New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
}

# Save to production environment file
$envPath = "$deployDir\.env.production"
$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host ""
Write-Host "Production Environment File Created: $envPath"

# Create quick setup script
$setupScript = @"
#!/bin/bash
# Quick Production Setup Script

echo "Setting up production environment..."

# Export environment variables
export JWT_SECRET="$JWT_SECRET"
export DB_PASSWORD="$DB_PASSWORD"
export ENCRYPTION_KEY="$ENCRYPTION_KEY"
export SERVICE_TOKEN="$SERVICE_TOKEN"
export REDIS_PASSWORD="$REDIS_PASSWORD"

echo "Production secrets loaded"
echo "Next: docker-compose -f docker-compose.production.yml --env-file .env.production up -d"
"@

$setupScript | Out-File -FilePath "$deployDir\setup-production.sh" -Encoding UTF8

Write-Host "Setup script created: $deployDir\setup-production.sh"

# Security summary
Write-Host ""
Write-Host "==================================================="
Write-Host "SECURITY SUMMARY"
Write-Host "==================================================="
Write-Host "JWT Secret: 512-bit cryptographic strength"
Write-Host "Database Password: 192-bit base64 encoded"
Write-Host "Encryption Key: 256-bit AES compatible"
Write-Host "Service Tokens: Cryptographically secure"
Write-Host "Session Security: BCRYPT rounds = 14"
Write-Host "Rate Limiting: Configured for production"
Write-Host ""
Write-Host "IMPORTANT: Store secrets securely and never commit to Git!"
Write-Host ""

Write-Host "Production secrets generation completed successfully!"
Write-Host "Next: Configure SSL/TLS certificates"
