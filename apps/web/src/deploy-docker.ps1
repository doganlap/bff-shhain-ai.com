# Docker Deployment Script
# Deploys the entire GRC Ecosystem to Docker

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "production")]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [switch]$Build,
    
    [Parameter(Mandatory=$false)]
    [switch]$Stop,
    
    [Parameter(Mandatory=$false)]
    [switch]$Remove
)

$ErrorActionPreference = "Stop"

Write-Host "🐳 GRC Ecosystem - Docker Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Determine compose file
if ($Environment -eq "production") {
    $ComposeFile = "infra/docker/docker-compose.production.yml"
    Write-Host "Environment: PRODUCTION" -ForegroundColor Red
} else {
    $ComposeFile = "infra/docker/docker-compose.ecosystem.yml"
    Write-Host "Environment: DEVELOPMENT" -ForegroundColor Yellow
}

Write-Host "Compose File: $ComposeFile" -ForegroundColor Gray
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Blue
try {
    docker ps | Out-Null
    Write-Host "  ✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if compose file exists
if (-not (Test-Path $ComposeFile)) {
    Write-Host "  ❌ Compose file not found: $ComposeFile" -ForegroundColor Red
    exit 1
}

# Stop services if requested
if ($Stop) {
    Write-Host "Stopping services..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile down
    Write-Host "  ✅ Services stopped" -ForegroundColor Green
    Write-Host ""
    exit 0
}

# Remove services if requested
if ($Remove) {
    Write-Host "Removing services and volumes..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile down -v
    Write-Host "  ✅ Services and volumes removed" -ForegroundColor Green
    Write-Host ""
    exit 0
}

# Check for .env file
$EnvFile = ".env"
if (-not (Test-Path $EnvFile)) {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
    Write-Host "   Creating from .env.example..." -ForegroundColor Gray
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   ✅ Created .env file. Please update with your values!" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "   ❌ .env.example not found. Please create .env manually." -ForegroundColor Red
        exit 1
    }
}

# Build images if requested
if ($Build) {
    Write-Host "Building Docker images..." -ForegroundColor Blue
    docker-compose -f $ComposeFile build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✅ Images built successfully" -ForegroundColor Green
    Write-Host ""
}

# Start services
Write-Host "Starting services..." -ForegroundColor Blue
docker-compose -f $ComposeFile up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Failed to start services" -ForegroundColor Red
    exit 1
}

Write-Host "  ✅ Services started" -ForegroundColor Green
Write-Host ""

# Wait for services to be healthy
Write-Host "Waiting for services to be healthy..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
docker-compose -f $ComposeFile ps

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Access Services:" -ForegroundColor Yellow
if ($Environment -eq "production") {
    Write-Host "  Frontend:    http://localhost" -ForegroundColor White
} else {
    Write-Host "  Frontend:    http://localhost:5173" -ForegroundColor White
}
Write-Host "  BFF API:     http://localhost:3000" -ForegroundColor White
Write-Host "  Consul UI:   http://localhost:8500" -ForegroundColor White
Write-Host "  RabbitMQ UI: http://localhost:15672" -ForegroundColor White
Write-Host ""
Write-Host "View Logs:" -ForegroundColor Yellow
Write-Host "  docker-compose -f $ComposeFile logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "Stop Services:" -ForegroundColor Yellow
Write-Host "  .\scripts\deploy-docker.ps1 -Stop" -ForegroundColor Gray
Write-Host ""

