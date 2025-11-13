@echo off
REM GRC Ecosystem Fresh Build Script for Windows
REM This script ensures completely fresh Docker builds with no cached layers

echo 🚀 Starting Fresh Docker Build for GRC Ecosystem
echo ================================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo 📋 Step 1: Stopping all running containers...
docker-compose -f infra/deployment/docker-compose.production.yml down --remove-orphans 2>nul
docker-compose -f docker-compose.ecosystem.yml down --remove-orphans 2>nul

echo 🧹 Step 2: Cleaning up Docker system...
echo This will remove all unused containers, networks, images, and build cache
docker system prune -af --volumes
docker builder prune -af

echo 📦 Step 3: Building frontend...
cd apps\web
call npm run build
cd ..\..

echo 🔨 Step 4: Building Docker images with no cache...
docker-compose -f infra/deployment/docker-compose.production.yml build --no-cache --pull --parallel

echo 🚀 Step 5: Starting services...
docker-compose -f infra/deployment/docker-compose.production.yml up -d

echo ⏳ Step 6: Waiting for services to be ready...
timeout /t 30 /nobreak >nul

echo 🔍 Step 7: Checking service health...
docker-compose -f infra/deployment/docker-compose.production.yml ps

echo ✅ Fresh build completed successfully!
echo 🌐 Your GRC application should be available at:
echo    - Frontend: https://localhost (or your configured domain)
echo    - API: https://localhost/api

echo.
echo 📊 Service Status:
docker-compose -f infra/deployment/docker-compose.production.yml ps

echo.
echo 📝 To view logs:
echo    docker-compose -f infra/deployment/docker-compose.production.yml logs -f [service-name]
echo.
echo 🛑 To stop all services:
echo    docker-compose -f infra/deployment/docker-compose.production.yml down

pause
