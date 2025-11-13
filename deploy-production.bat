@echo off
REM GRC Ecosystem Production Deployment Script
REM Ensures completely fresh Docker builds for production

setlocal enabledelayedexpansion

echo.
echo ========================================
echo 🚀 GRC ECOSYSTEM PRODUCTION DEPLOYMENT
echo ========================================
echo.

REM Set build variables for cache busting
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "BUILD_DATE=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%T%dt:~8,2%:%dt:~10,2%:%dt:~12,2%Z"
set "BUILD_VERSION=prod-%dt:~0,8%-%dt:~8,6%"

echo 📅 Build Date: %BUILD_DATE%
echo 🏷️  Build Version: %BUILD_VERSION%
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose -f infra/deployment/docker-compose.production.yml down --remove-orphans 2>nul
echo.

REM Clean up Docker system for fresh build
echo 🧹 Cleaning Docker system...
echo ⚠️  This will remove unused containers, networks, and images
choice /c YN /m "Continue with cleanup"
if errorlevel 2 goto :skip_cleanup

docker system prune -f
docker builder prune -f
echo ✅ Docker cleanup completed
echo.

:skip_cleanup

REM Build frontend first
echo 📦 Building frontend application...
cd apps\web
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo ✅ Frontend build completed
echo.

REM Set environment variables for Docker Compose
set BUILD_DATE=%BUILD_DATE%
set BUILD_VERSION=%BUILD_VERSION%

REM Build Docker images with no cache
echo 🔨 Building Docker images (this may take several minutes)...
docker-compose -f infra/deployment/docker-compose.production.yml build --no-cache --pull --parallel

if %errorlevel% neq 0 (
    echo ❌ Docker build failed!
    pause
    exit /b 1
)

echo ✅ Docker images built successfully
echo.

REM Start services
echo 🚀 Starting production services...
docker-compose -f infra/deployment/docker-compose.production.yml up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start services!
    pause
    exit /b 1
)

echo ✅ Services started successfully
echo.

REM Wait for services to initialize
echo ⏳ Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

REM Check service status
echo 🔍 Checking service health...
docker-compose -f infra/deployment/docker-compose.production.yml ps
echo.

REM Display success message
echo ========================================
echo ✅ DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo 🌐 Your GRC application is now running:
echo    Frontend: https://localhost (or your configured domain)
echo    API: https://localhost/api
echo.
echo 📊 Service Management Commands:
echo    View logs: docker-compose -f infra/deployment/docker-compose.production.yml logs -f [service]
echo    Stop all:  docker-compose -f infra/deployment/docker-compose.production.yml down
echo    Restart:   docker-compose -f infra/deployment/docker-compose.production.yml restart [service]
echo.
echo 🔧 Build Information:
echo    Build Date: %BUILD_DATE%
echo    Build Version: %BUILD_VERSION%
echo.

pause
