# Complete Database Setup Script for Shahin Platform
# This script sets up the entire database infrastructure for local development

Write-Host "🚀 Shahin Platform - Complete Database Setup" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Change to the project root directory
Set-Location -Path $PSScriptRoot\..

Write-Host "`n📋 Step 1: Starting database services..." -ForegroundColor Yellow
docker compose -f docker-compose.db.yml up -d

Write-Host "`n⏳ Step 2: Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`n🔍 Step 3: Checking service status..." -ForegroundColor Yellow
$services = @("shahin-db-local", "shahin-shadow-local", "shahin-redis-local")
$allHealthy = $true

foreach ($service in $services) {
    $status = docker ps --filter "name=$service" --format "{{.Status}}"
    if ($status -and $status -match "Up") {
        Write-Host "✅ $service is running" -ForegroundColor Green
    } else {
        Write-Host "❌ $service is not running properly" -ForegroundColor Red
        $allHealthy = $false
    }
}

if (-not $allHealthy) {
    Write-Host "`n❌ Some services are not running properly. Please check Docker logs." -ForegroundColor Red
    exit 1
}

Write-Host "`n🗄️ Step 4: Setting up database permissions..." -ForegroundColor Yellow
docker exec shahin-db-local psql -U shahin_local -d shahin_local_db -c "GRANT ALL PRIVILEGES ON DATABASE shahin_local_db TO shahin_local;" 2>$null
docker exec shahin-db-local psql -U shahin_local -d shahin_local_db -c "GRANT ALL ON SCHEMA public TO shahin_local;" 2>$null

Write-Host "`n🏗️ Step 5: Applying database migrations..." -ForegroundColor Yellow
Set-Location -Path apps\bff

Write-Host "   Applying initial migration..." -ForegroundColor Blue
Get-Content prisma\migrations\20251113062242_init\migration.sql | docker exec -i shahin-db-local psql -U shahin_local -d shahin_local_db

Write-Host "   Applying three access paths migration..." -ForegroundColor Blue
Get-Content prisma\migrations\20251114_three_access_paths\migration.sql | docker exec -i shahin-db-local psql -U shahin_local -d shahin_local_db

Write-Host "`n✅ Step 6: Verifying database setup..." -ForegroundColor Yellow
$tableCount = docker exec shahin-db-local psql -U shahin_local -d shahin_local_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>$null
$tableCount = $tableCount.Trim()

if ([int]$tableCount -gt 0) {
    Write-Host "✅ Database setup successful! $tableCount tables created." -ForegroundColor Green
} else {
    Write-Host "❌ Database setup failed - no tables found." -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host "`n📊 Connection Information:" -ForegroundColor Cyan
Write-Host "   Main Database: postgresql://shahin_local:shahin_local_password@localhost:5432/shahin_local_db" -ForegroundColor White
Write-Host "   Shadow Database: postgresql://shahin_local:shahin_local_password@localhost:5433/shahin_local_shadow" -ForegroundColor White
Write-Host "   Redis: redis://localhost:6379" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Start BFF: cd apps/bff && npm run dev" -ForegroundColor White
Write-Host "   2. Start Frontend: cd apps/web && npm run dev" -ForegroundColor White
Write-Host "   3. Test health: curl http://localhost:3005/health" -ForegroundColor White
Write-Host "   4. Test detailed health: curl http://localhost:3005/health/detailed" -ForegroundColor White

Write-Host "`n📁 Useful Scripts:" -ForegroundColor Cyan
Write-Host "   ./scripts/db-status.ps1 - Check service status" -ForegroundColor White
Write-Host "   ./scripts/db-stop.ps1 - Stop services" -ForegroundColor White
Write-Host "   ./scripts/db-reset.ps1 - Reset everything" -ForegroundColor White