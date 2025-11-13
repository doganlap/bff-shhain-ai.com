# Build All Services Script (PowerShell)
# Builds all services with dependencies

Write-Host "🚀 Building GRC Ecosystem - All Services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function to build service
function Build-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath
    )
    
    Write-Host "📦 Building $ServiceName..." -ForegroundColor Blue
    
    if (Test-Path $ServicePath) {
        Push-Location $ServicePath
        
        if (Test-Path "package.json") {
            Write-Host "  Installing dependencies..." -ForegroundColor Gray
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ $ServiceName dependencies installed" -ForegroundColor Green
            } else {
                Write-Host "  ❌ Failed to install dependencies" -ForegroundColor Red
            }
        } else {
            Write-Host "  ⚠️  No package.json found, skipping" -ForegroundColor Yellow
        }
        
        Pop-Location
    } else {
        Write-Host "  ⚠️  Directory not found: $ServicePath" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Build all services
Write-Host "Building Backend Services..." -ForegroundColor Blue
Write-Host ""

# BFF
Build-Service "BFF" "apps/bff"

# Auth Service
Build-Service "Auth Service" "apps/services/auth-service"

# Document Service
Build-Service "Document Service" "apps/services/document-service"

# Partner Service
Build-Service "Partner Service" "apps/services/partner-service"

# Notification Service
Build-Service "Notification Service" "apps/services/notification-service"

# GRC API
Build-Service "GRC API" "apps/services/grc-api"

# Frontend
Write-Host "Building Frontend..." -ForegroundColor Blue
Build-Service "Frontend Web" "apps/web"

Write-Host "✅ All services built successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Copy .env.example files to .env in each service"
Write-Host "  2. Update environment variables"
Write-Host "  3. Run: docker-compose -f infra/docker/docker-compose.ecosystem.yml up"

