# Redis Setup Script for GRC Master Application
# This script sets up Redis using Docker for caching services

Write-Host "🔧 Setting up Redis for GRC Master Application..." -ForegroundColor Green

# Check if Docker is running
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Stop existing Redis container if running
Write-Host "🔄 Stopping existing Redis container (if any)..." -ForegroundColor Yellow
docker stop grc-redis 2>$null
docker rm grc-redis 2>$null

# Start Redis container
Write-Host "🚀 Starting Redis container..." -ForegroundColor Green
docker run -d `
    --name grc-redis `
    --restart unless-stopped `
    -p 6379:6379 `
    -e REDIS_PASSWORD=grc_redis_password_2024 `
    redis:7-alpine redis-server --requirepass grc_redis_password_2024

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Redis container started successfully!" -ForegroundColor Green
    
    # Wait for Redis to be ready
    Write-Host "⏳ Waiting for Redis to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Test Redis connection
    Write-Host "🧪 Testing Redis connection..." -ForegroundColor Yellow
    $testResult = docker exec grc-redis redis-cli -a grc_redis_password_2024 ping 2>$null
    
    if ($testResult -eq "PONG") {
        Write-Host "✅ Redis is responding correctly!" -ForegroundColor Green
        
        # Display connection info
        Write-Host "`n📋 Redis Connection Information:" -ForegroundColor Cyan
        Write-Host "   Host: localhost" -ForegroundColor White
        Write-Host "   Port: 6379" -ForegroundColor White
        Write-Host "   Password: grc_redis_password_2024" -ForegroundColor White
        Write-Host "   Container: grc-redis" -ForegroundColor White
        
        # Update environment variables
        Write-Host "`n🔧 Updating environment variables..." -ForegroundColor Yellow
        $envFile = ".env"
        if (Test-Path $envFile) {
            $envContent = Get-Content $envFile
            $newEnvContent = @()
            $redisHostFound = $false
            $redisPortFound = $false
            $redisPasswordFound = $false
            
            foreach ($line in $envContent) {
                if ($line -match "^REDIS_HOST=") {
                    $newEnvContent += "REDIS_HOST=localhost"
                    $redisHostFound = $true
                } elseif ($line -match "^REDIS_PORT=") {
                    $newEnvContent += "REDIS_PORT=6379"
                    $redisPortFound = $true
                } elseif ($line -match "^REDIS_PASSWORD=") {
                    $newEnvContent += "REDIS_PASSWORD=grc_redis_password_2024"
                    $redisPasswordFound = $true
                } else {
                    $newEnvContent += $line
                }
            }
            
            # Add missing Redis environment variables
            if (-not $redisHostFound) {
                $newEnvContent += "`n# Redis Configuration"
                $newEnvContent += "REDIS_HOST=localhost"
            }
            if (-not $redisPortFound) {
                $newEnvContent += "REDIS_PORT=6379"
            }
            if (-not $redisPasswordFound) {
                $newEnvContent += "REDIS_PASSWORD=grc_redis_password_2024"
            }
            
            $newEnvContent | Out-File -FilePath $envFile -Encoding UTF8
            Write-Host "✅ Environment variables updated in .env file" -ForegroundColor Green
        }
        
        Write-Host "`n🎉 Redis setup completed successfully!" -ForegroundColor Green
        Write-Host "   You can now start your GRC services that use Redis caching." -ForegroundColor White
        
    } else {
        Write-Host "❌ Redis is not responding properly" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Failed to start Redis container" -ForegroundColor Red
    exit 1
}

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Redis is now running and ready for caching services" -ForegroundColor White
Write-Host "   2. Start your GRC API services to use Redis caching" -ForegroundColor White
Write-Host "   3. Monitor Redis with: docker logs grc-redis" -ForegroundColor White
Write-Host "   4. Connect to Redis CLI: docker exec -it grc-redis redis-cli -a grc_redis_password_2024" -ForegroundColor White
