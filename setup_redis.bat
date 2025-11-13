@echo off
echo Setting up Redis for GRC Master Application...

REM Check if Docker is available
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop first
    pause
    exit /b 1
)

echo Docker is available

REM Stop existing Redis container if running
echo Stopping existing Redis container if any...
docker stop grc-redis >nul 2>&1
docker rm grc-redis >nul 2>&1

REM Start Redis container
echo Starting Redis container...
docker run -d --name grc-redis --restart unless-stopped -p 6379:6379 -e REDIS_PASSWORD=grc_redis_password_2024 redis:7-alpine redis-server --requirepass grc_redis_password_2024

if errorlevel 1 (
    echo ERROR: Failed to start Redis container
    pause
    exit /b 1
)

echo Redis container started successfully!

REM Wait for Redis to be ready
echo Waiting for Redis to be ready...
timeout /t 5 /nobreak >nul

REM Test Redis connection
echo Testing Redis connection...
docker exec grc-redis redis-cli -a grc_redis_password_2024 ping >nul 2>&1

if errorlevel 1 (
    echo ERROR: Redis is not responding properly
    pause
    exit /b 1
)

echo Redis is responding correctly!
echo.
echo Redis Connection Information:
echo   Host: localhost
echo   Port: 6379
echo   Password: grc_redis_password_2024
echo   Container: grc-redis
echo.
echo Redis setup completed successfully!
echo You can now start your GRC services that use Redis caching.
echo.
echo Next Steps:
echo   1. Redis is now running and ready for caching services
echo   2. Start your GRC API services to use Redis caching
echo   3. Monitor Redis with: docker logs grc-redis
echo   4. Connect to Redis CLI: docker exec -it grc-redis redis-cli -a grc_redis_password_2024
echo.
pause
