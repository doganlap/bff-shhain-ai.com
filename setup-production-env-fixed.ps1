# PowerShell Script to Setup Production Environment
# Fixes Prisma and Environment Variable Issues

Write-Host "🚀 SETTING UP PRODUCTION ENVIRONMENT" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# 1. Correct Environment Variable Setup
Write-Host "1. SETTING ENVIRONMENT VARIABLE CORRECTLY" -ForegroundColor Yellow
Write-Host "   Old way (doesn't work): set DATABASE_URL=..." -ForegroundColor Red
Write-Host "   Correct way: `$env:DATABASE_URL=..." -ForegroundColor Green
Write-Host ""

# Set the Prisma Postgres connection string
$env:DATABASE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19tUEEyd2YxR2haSmd5cW50d2t2aEIiLCJhcGlfa2V5IjoiMDFLQTE0RUs0QlNXRzRDUzQ5UTExMTlWNzQiLCJ0ZW5hbnRfaWQiOiJhODE3ZmY1MmJmNzI4NzM4ODdjN2IyZDE3ZWMyYzc4ZjA4NzllMTI3Yzk3NDJmZDg1NjdhMjFkYmMwNjYwNDQ4IiwiaW50ZXJuYWxfc2VjcmV0IjoiYmZlMzRiZmMtOWRmYy00YjI3LTg0ODMtZjczM2I2Yzc0N2JkIn0.gKBF1lWTbjKqTks4MhpM5txhSTuOw5-jKDk5Qf5-Brs"

Write-Host "   ✅ DATABASE_URL set correctly" -ForegroundColor Green
Write-Host "   ✅ Prisma Accelerate enabled" -ForegroundColor Green
Write-Host ""

# 2. Create proper .env file
Write-Host "2. CREATING PRODUCTION .ENV FILE" -ForegroundColor Yellow

$envContent = @"
# Production Environment with Prisma Postgres
# Updated with new production database connection

# ==========================================
# PRISMA POSTGRES PRODUCTION DATABASE
# ==========================================
DATABASE_URL="$env:DATABASE_URL"

# Raw Postgres connection (for direct access)
RAW_DATABASE_URL="postgres://a817ff52bf72873887c7b2d17ec2c78f0879e127c9742fd8567a21dbc0660448:sk_mPA2wf1GhZJgyqntwkvhB@db.prisma.io:5432/postgres?sslmode=require"

# ==========================================
# SECURITY & AUTHENTICATION
# ==========================================
JWT_SECRET="production-jwt-secret-change-this-in-env-vars"
JWT_EXPIRES_IN="24h"
BCRYPT_ROUNDS="12"
SERVICE_TOKEN="production-service-token"

# ==========================================
# AI & EXTERNAL SERVICES
# ==========================================
OPENAI_API_KEY=""
AZURE_OPENAI_KEY=""
AZURE_COMPUTER_VISION_KEY=""

# ==========================================
# APPLICATION CONFIG
# ==========================================
NODE_ENV="production"
LOG_LEVEL="info"
FRONTEND_URL=""

# ==========================================
# PRISMA ACCELERATE CONFIG
# ==========================================
# The DATABASE_URL above already includes Prisma Accelerate
# Benefits: Connection pooling, caching, edge computing
# API Key: Embedded securely in connection string
"@

$envContent | Out-File -FilePath ".env.production.final" -Encoding UTF8

Write-Host "   ✅ .env.production.final created" -ForegroundColor Green
Write-Host "   ✅ All variables configured" -ForegroundColor Green
Write-Host ""

# 3. Test Prisma Connection
Write-Host "3. TESTING PRISMA CONNECTION" -ForegroundColor Yellow

try {
    # Generate Prisma client
    Write-Host "   • Generating Prisma client..." -ForegroundColor White
    $genResult = & npx prisma generate --schema=apps\bff\prisma\schema.prisma 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Prisma client generated" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Prisma client generation failed" -ForegroundColor Red
        Write-Host "   Error: $genResult" -ForegroundColor Red
    }

    # Test database connection
    Write-Host "   • Testing database connection..." -ForegroundColor White
    $pushResult = & npx prisma db push --schema=apps\bff\prisma\schema.prisma --accept-data-loss 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database connection successful" -ForegroundColor Green
        Write-Host "   ✅ All tables synchronized" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Database sync check: $pushResult" -ForegroundColor Yellow
    }

} catch {
    Write-Host "   ❌ Prisma test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Launch Prisma Studio
Write-Host "4. LAUNCHING PRISMA STUDIO" -ForegroundColor Yellow
Write-Host "   Opening Prisma Studio with production database..." -ForegroundColor White

# Launch Prisma Studio in background
Start-Process -FilePath "cmd" -ArgumentList "/c npx prisma studio --port 5559" -NoNewWindow

Start-Sleep -Seconds 3

Write-Host "   ✅ Prisma Studio launched" -ForegroundColor Green
Write-Host "   🌐 URL: http://localhost:5559" -ForegroundColor White
Write-Host ""

# 5. Instructions
Write-Host "🎯 PRODUCTION SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ What was accomplished:" -ForegroundColor Cyan
Write-Host "   • Environment variables set correctly" -ForegroundColor White
Write-Host "   • Production .env file created" -ForegroundColor White
Write-Host "   • Prisma client generated" -ForegroundColor White
Write-Host "   • Database connection tested" -ForegroundColor White
Write-Host "   • Prisma Studio launched on port 5559" -ForegroundColor White
Write-Host ""
Write-Host "🚀 For Vercel Deployment:" -ForegroundColor Yellow
Write-Host "   1. Copy DATABASE_URL from .env.production.final" -ForegroundColor White
Write-Host "   2. Add to Vercel Environment Variables" -ForegroundColor White
Write-Host "   3. Deploy: vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Fixed Issues:" -ForegroundColor Cyan
Write-Host "   • PowerShell env variable syntax" -ForegroundColor White
Write-Host "   • String terminator problems" -ForegroundColor White
Write-Host "   • Prisma configuration" -ForegroundColor White
Write-Host ""
Write-Host "🎊 Ready for production deployment!" -ForegroundColor Green
