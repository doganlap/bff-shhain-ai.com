@echo off
REM GRC Assessment App Docker Build Script for Windows
REM This script builds and runs the GRC Assessment application in Docker Desktop

setlocal enabledelayedexpansion

echo 🚀 Starting GRC Assessment App Docker Build...

REM Check if Docker is running
echo [INFO] Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
echo [INFO] Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose and try again.
    pause
    exit /b 1
)

echo [INFO] Docker is running and ready!

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "ssl" mkdir ssl

REM Build the application
echo [INFO] Building GRC Assessment application...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed. Check the output above for details.
    pause
    exit /b 1
)

REM Start the services
echo [INFO] Starting services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services. Check the output above for details.
    pause
    exit /b 1
)

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check if services are running
echo [INFO] Checking service health...
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo [INFO] ✅ Services are running successfully!
) else (
    echo [ERROR] ❌ Some services failed to start. Check logs with: docker-compose logs
    pause
    exit /b 1
)

REM Test the application
echo [INFO] Testing application endpoints...
timeout /t 10 /nobreak >nul

REM Test health endpoint
echo [INFO] Testing backend API...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5001/api/health' -UseBasicParsing -TimeoutSec 5 | Out-Null; Write-Host '[INFO] ✅ Backend API is responding!' } catch { Write-Host '[WARNING] ⚠️  Backend API health check failed. Check logs with: docker-compose logs grc-app' }"

REM Test frontend
echo [INFO] Testing frontend...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost' -UseBasicParsing -TimeoutSec 5 | Out-Null; Write-Host '[INFO] ✅ Frontend is accessible!' } catch { Write-Host '[WARNING] ⚠️  Frontend is not responding. Check logs with: docker-compose logs nginx' }"

REM Display access information
echo.
echo ═══════════════════════════════════════
echo 🎉 GRC Assessment App is ready!
echo ═══════════════════════════════════════
echo.
echo 📋 Access Information:
echo    • Frontend: http://localhost
echo    • Backend API: http://localhost:5001
echo    • Health Check: http://localhost:5001/api/health
echo.
echo 🔧 Management Commands:
echo    • View logs: docker-compose logs -f
echo    • Stop services: docker-compose down
echo    • Restart services: docker-compose restart
echo    • Rebuild: docker-compose build --no-cache
echo.
echo 📊 Database Information:
echo    • Database: grc_template
echo    • User: grc_user
echo    • Password: grc_secure_password_2024
echo    • Port: 5432 (internal only)
echo.
echo 📝 Useful Docker Commands:
echo    • View running containers: docker ps
echo    • View images: docker images
echo    • Clean up: docker system prune -f
echo.
echo ═══════════════════════════════════════

REM Keep services running
echo.
echo [INFO] Services are running in the background.
echo [INFO] You can now open Docker Desktop to manage the containers.
echo [INFO] Press any key to exit this script (services will continue running).

pause >nul

REM Show logs
echo [INFO] Showing logs (Press Ctrl+C to exit logs)...
docker-compose logs -f