# Database Start Script for Shahin Platform
# Starts PostgreSQL and Redis services for local development

Write-Host "🚀 Starting Shahin Platform Database Services..." -ForegroundColor Green

# Change to the project root directory
Set-Location -Path $PSScriptRoot\..

# Start the database services
docker compose -f docker-compose.db.yml up -d

Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if services are running
Write-Host "🔍 Checking service status..." -ForegroundColor Blue
$services = @("shahin-db-local", "shahin-shadow-local", "shahin-redis-local")

foreach ($service in $services) {
    $status = docker ps --filter "name=$service" --format "{{.Status}}"
    if ($status) {
        Write-Host "✅ $service is running: $status" -ForegroundColor Green
    } else {
        Write-Host "❌ $service is not running" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Database services started successfully!" -ForegroundColor Green
Write-Host "📊 PostgreSQL: localhost:5432 (main), localhost:5433 (shadow)" -ForegroundColor Cyan
Write-Host "🔄 Redis: localhost:6379" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run migrations: cd apps/bff && npm run migrate:local" -ForegroundColor White
Write-Host "  2. Seed database: cd apps/bff && npm run db:local:seed" -ForegroundColor White
Write-Host "  3. Start BFF: cd apps/bff && npm run dev" -ForegroundColor White