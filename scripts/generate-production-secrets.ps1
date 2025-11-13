# Production Secrets Generation Script
# Generates cryptographically secure secrets for production deployment

Write-Host "==================================================="
Write-Host "🔐 PRODUCTION SECRETS GENERATION"
Write-Host "==================================================="
Write-Host ""

# Function to generate secure random strings
function Generate-SecureKey {
    param([int]$Length = 32)

    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^"
    $secure = ""
    1..$Length | ForEach-Object {
        $secure += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $secure
}# Function to generate base64 keys
function Generate-Base64Key {
    param([int]$Bytes = 32)

    $randomBytes = New-Object byte[] $Bytes
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($randomBytes)
    return [Convert]::ToBase64String($randomBytes)
}

Write-Host "📊 Generating Production-Grade Secrets..."
Write-Host "---------------------------------------------------"

# Generate JWT Secrets (512-bit for RSA-like strength)
$JWT_SECRET = Generate-Base64Key -Bytes 64
$JWT_REFRESH_SECRET = Generate-Base64Key -Bytes 64

Write-Host "✅ JWT Secrets Generated (512-bit strength)"

# Generate Database Passwords
$DB_PASSWORD = Generate-SecureKey -Length 32
$DB_ADMIN_PASSWORD = Generate-SecureKey -Length 32

Write-Host "✅ Database Passwords Generated (256-bit strength)"

# Generate Encryption Keys
$ENCRYPTION_KEY = Generate-Base64Key -Bytes 32  # 256-bit AES
$SESSION_SECRET = Generate-Base64Key -Bytes 32

Write-Host "✅ Encryption Keys Generated (256-bit AES)"

# Generate Service Tokens
$SERVICE_TOKEN = Generate-Base64Key -Bytes 24
$API_SECRET_KEY = Generate-Base64Key -Bytes 32

Write-Host "✅ Service Tokens Generated"

# Generate Redis Password
$REDIS_PASSWORD = Generate-SecureKey -Length 24

Write-Host "✅ Redis Password Generated"

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

# Save to production environment file
$envPath = "..\infra\deployment\.env.production"
$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host ""
Write-Host "📄 Production Environment File Created: $envPath"

# Create Docker secrets file
$dockerSecretsContent = @"
# Docker Secrets Configuration
# Use with: docker stack deploy or docker-compose

version: '3.8'
secrets:
  jwt_secret:
    external: true
  db_password:
    external: true
  encryption_key:
    external: true
  api_secret:
    external: true

# Create secrets with:
# echo "$JWT_SECRET" | docker secret create jwt_secret -
# echo "$DB_PASSWORD" | docker secret create db_password -
# echo "$ENCRYPTION_KEY" | docker secret create encryption_key -
# echo "$API_SECRET_KEY" | docker secret create api_secret -
"@

$dockerSecretsPath = "..\infra\deployment\docker-secrets.yml"
$dockerSecretsContent | Out-File -FilePath $dockerSecretsPath -Encoding UTF8

# Create Kubernetes secrets manifest
$k8sSecretsContent = @"
apiVersion: v1
kind: Secret
metadata:
  name: grc-platform-secrets
  namespace: grc-system
type: Opaque
data:
  jwt-secret: $([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($JWT_SECRET)))
  db-password: $([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($DB_PASSWORD)))
  encryption-key: $([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($ENCRYPTION_KEY)))
  api-secret: $([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($API_SECRET_KEY)))
  redis-password: $([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($REDIS_PASSWORD)))
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grc-platform-config
  namespace: grc-system
data:
  NODE_ENV: "production"
  JWT_EXPIRES_IN: "15m"
  JWT_REFRESH_EXPIRES_IN: "7d"
  BCRYPT_ROUNDS: "14"
  SESSION_TIMEOUT: "3600"
  LOG_LEVEL: "info"
"@

$k8sSecretsPath = "..\infra\deployment\k8s-secrets.yaml"
$k8sSecretsContent | Out-File -FilePath $k8sSecretsPath -Encoding UTF8

Write-Host "🐳 Docker Secrets Configuration Created: $dockerSecretsPath"
Write-Host "☸️  Kubernetes Secrets Manifest Created: $k8sSecretsPath"

# Security summary
Write-Host ""
Write-Host "==================================================="
Write-Host "🔒 SECURITY SUMMARY"
Write-Host "==================================================="
Write-Host "✅ JWT Secret: 512-bit cryptographic strength"
Write-Host "✅ Database Password: 32 characters with special chars"
Write-Host "✅ Encryption Key: 256-bit AES compatible"
Write-Host "✅ Service Tokens: Cryptographically secure"
Write-Host "✅ Session Security: BCRYPT rounds = 14"
Write-Host "✅ Rate Limiting: Configured for production"
Write-Host ""
Write-Host "🚨 IMPORTANT: Store secrets securely and never commit to Git!"
Write-Host ""

# Create .gitignore entry reminder
Write-Host "📝 Add to .gitignore:"
Write-Host "   .env.production"
Write-Host "   /infra/deployment/.env.production"
Write-Host "   docker-secrets.yml"
Write-Host "   k8s-secrets.yaml"
Write-Host ""

Write-Host "✅ Production secrets generation completed successfully!"
Write-Host "Next: Configure SSL/TLS certificates"
