# Database Stop Script for Shahin Platform
# Stops PostgreSQL and Redis services

Write-Host "🛑 Stopping Shahin Platform Database Services..." -ForegroundColor Yellow

# Change to the project root directory
Set-Location -Path $PSScriptRoot\..

# Stop the database services
docker compose -f docker-compose.db.yml down

Write-Host "✅ Database services stopped successfully!" -ForegroundColor Green