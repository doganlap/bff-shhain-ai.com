@echo off
REM Quick verification script for GRC production build

echo.
echo ================================
echo 🔍 GRC BUILD VERIFICATION
echo ================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Check if containers are running
echo 📊 Container Status:
echo ==================
docker-compose -f infra/deployment/docker-compose.production.yml ps
echo.

REM Check container health
echo 🏥 Health Checks:
echo ================
for /f "tokens=1" %%i in ('docker-compose -f infra/deployment/docker-compose.production.yml ps -q') do (
    for /f "tokens=*" %%j in ('docker inspect --format="{{.Name}}: {{.State.Health.Status}}" %%i 2^>nul') do (
        echo %%j
    )
)
echo.

REM Test frontend build
echo 🌐 Testing Frontend Build:
echo =========================
if exist "apps\web\dist\index.html" (
    echo ✅ Frontend build files exist
    for %%i in (apps\web\dist\*) do echo    - %%~nxi
) else (
    echo ❌ Frontend build files missing
)
echo.

REM Check Docker images
echo 🐳 Docker Images:
echo ================
docker images | findstr grc
echo.

REM Show recent build logs
echo 📝 Recent Build Activity:
echo ========================
docker-compose -f infra/deployment/docker-compose.production.yml logs --tail=5 web
echo.

echo ================================
echo 🎯 Verification Complete
echo ================================

pause
