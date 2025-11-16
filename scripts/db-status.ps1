# Database Status Script for Shahin Platform
# Shows the status of database services

Write-Host "📊 Shahin Platform Database Status" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check Docker containers
Write-Host "`n🐳 Docker Containers:" -ForegroundColor Yellow
$containers = @("shahin-db-local", "shahin-shadow-local", "shahin-redis-local")

foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($status) {
        Write-Host $status -ForegroundColor Green
    } else {
        Write-Host "$container\tNot Running" -ForegroundColor Red
    }
}

# Check database connectivity
Write-Host "`n🗄️ Database Connectivity:" -ForegroundColor Yellow

# Test PostgreSQL main database
$dbTest = docker exec shahin-db-local pg_isready -U shahin_local -d shahin_local_db 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Main PostgreSQL (shahin_local_db): Ready" -ForegroundColor Green
} else {
    Write-Host "❌ Main PostgreSQL (shahin_local_db): Not Ready" -ForegroundColor Red
}

# Test PostgreSQL shadow database
$shadowTest = docker exec shahin-shadow-local pg_isready -U shahin_local -d shahin_local_shadow 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Shadow PostgreSQL (shahin_local_shadow): Ready" -ForegroundColor Green
} else {
    Write-Host "❌ Shadow PostgreSQL (shahin_local_shadow): Not Ready" -ForegroundColor Red
}

# Test Redis
$redisTest = docker exec shahin-redis-local redis-cli ping 2>$null
if ($redisTest -eq "PONG") {
    Write-Host "✅ Redis: Ready" -ForegroundColor Green
} else {
    Write-Host "❌ Redis: Not Ready" -ForegroundColor Red
}

Write-Host "`n📈 Resource Usage:" -ForegroundColor Yellow
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $containers

Write-Host "`n🎉 Status check complete!" -ForegroundColor Green