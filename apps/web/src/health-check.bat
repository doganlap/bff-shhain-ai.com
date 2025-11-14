@echo off
REM Health Check Script for GRC Platform Services (Windows)
REM Production-grade health monitoring

echo =====================================
echo GRC Platform Health Check (Windows)
echo =====================================

set "failed_checks=0"

REM Check infrastructure services
echo.
echo Infrastructure Services:
echo Checking PostgreSQL...
docker exec docker-postgres-1 pg_isready -U grc_user -d grc_ecosystem >nul 2>&1
if %errorlevel% equ 0 (
    echo [92m✓ PostgreSQL Connected[0m
) else (
    echo [91m✗ PostgreSQL Connection Failed[0m
    set /a failed_checks+=1
)

echo Checking Redis...
docker ps --filter "name=redis" --format "{{.Names}}" > temp_redis.txt
set /p redis_container=<temp_redis.txt
del temp_redis.txt
if defined redis_container (
    docker exec %redis_container% redis-cli ping >nul 2>&1
    if !errorlevel! equ 0 (
        echo [92m✓ Redis Connected[0m
    ) else (
        echo [91m✗ Redis Connection Failed[0m
        set /a failed_checks+=1
    )
) else (
    echo [91m✗ Redis Container Not Found[0m
    set /a failed_checks+=1
)

REM Function to check HTTP endpoints
echo.
echo Application Services:

echo Checking Web Frontend...
curl -f -s -o nul http://localhost:5174/
if %errorlevel% equ 0 (
    echo [92m✓ Web Frontend Healthy[0m
) else (
    echo [91m✗ Web Frontend Unhealthy[0m
    set /a failed_checks+=1
)

echo Checking BFF API...
curl -f -s -o nul http://localhost:3005/api/health
if %errorlevel% equ 0 (
    echo [92m✓ BFF API Healthy[0m
) else (
    echo [91m✗ BFF API Unhealthy[0m
    set /a failed_checks+=1
)

echo Checking GRC API...
curl -f -s -o nul http://localhost:3000/api/health
if %errorlevel% equ 0 (
    echo [92m✓ GRC API Healthy[0m
) else (
    echo [91m✗ GRC API Unhealthy[0m
    set /a failed_checks+=1
)

echo Checking Auth Service...
curl -f -s -o nul http://localhost:3001/api/health
if %errorlevel% equ 0 (
    echo [92m✓ Auth Service Healthy[0m
) else (
    echo [91m✗ Auth Service Unhealthy[0m
    set /a failed_checks+=1
)

echo Checking Document Service...
curl -f -s -o nul http://localhost:3002/api/health
if %errorlevel% equ 0 (
    echo [92m✓ Document Service Healthy[0m
) else (
    echo [91m✗ Document Service Unhealthy[0m
    set /a failed_checks+=1
)

echo Checking Partner Service...
curl -f -s -o nul http://localhost:3003/api/health
if %errorlevel% equ 0 (
    echo [92m✓ Partner Service Healthy[0m
) else (
    echo [91m✗ Partner Service Unhealthy[0m
    set /a failed_checks+=1
)

echo Checking Notification Service...
curl -f -s -o nul http://localhost:3004/api/health
if %errorlevel% equ 0 (
    echo [92m✓ Notification Service Healthy[0m
) else (
    echo [91m✗ Notification Service Unhealthy[0m
    set /a failed_checks+=1
)

REM Check load balancer
echo.
echo Security and Load Balancer:
echo Checking Nginx...
curl -f -s -o nul http://localhost/health
if %errorlevel% equ 0 (
    echo [92m✓ Nginx Healthy[0m
) else (
    echo [91m✗ Nginx Unhealthy[0m
    set /a failed_checks+=1
)

echo.
echo =====================================

if %failed_checks% equ 0 (
    echo [92m✓ All services healthy![0m
    echo [92mPlatform Status: PRODUCTION READY[0m
    exit /b 0
) else (
    echo [91m✗ %failed_checks% service(s) failed health check[0m
    echo [91mPlatform Status: DEGRADED[0m
    exit /b 1
)
