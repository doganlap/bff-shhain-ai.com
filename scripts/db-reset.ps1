# Database Reset Script for Shahin Platform
# Resets the database by dropping and recreating it

Write-Host "WARNING: This will reset all database data!" -ForegroundColor Red
Write-Host "Are you sure you want to continue? (yes/no)" -ForegroundColor Yellow

$response = Read-Host
if ($response -ne "yes") {
Write-Host "Database reset cancelled." -ForegroundColor Green
    exit 0
}

Write-Host "Resetting Shahin Platform Database..." -ForegroundColor Yellow

# Change to the project root directory
Set-Location -Path $PSScriptRoot\..

Write-Host "1. Stopping database services..." -ForegroundColor Blue
docker compose -f docker-compose.db.yml down

Write-Host "2. Removing database volumes..." -ForegroundColor Blue
docker volume rm shahin-ai-app_shahin_db_data_local 2>$null
docker volume rm shahin-ai-app_shahin_shadow_data_local 2>$null
docker volume rm shahin-ai-app_shahin_redis_data_local 2>$null

Write-Host "3. Starting fresh database services..." -ForegroundColor Blue
docker compose -f docker-compose.db.yml up -d

Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "4. Running migrations..." -ForegroundColor Blue
Set-Location -Path apps\bff
Get-Content prisma\migrations\20251113062242_init\migration.sql | docker exec -i shahin-db-local psql -U shahin_local -d shahin_local_db
Get-Content prisma\migrations\20251114_three_access_paths\migration.sql | docker exec -i shahin-db-local psql -U shahin_local -d shahin_local_db

Write-Host "Database reset completed successfully!" -ForegroundColor Green
Write-Host "You can now run 'npm run db:local:seed' to populate with test data" -ForegroundColor Cyan