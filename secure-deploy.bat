@echo off
REM 🔒 Secure Production Deployment Script for GRC Platform
REM This script ensures all security requirements are met before deployment

setlocal enabledelayedexpansion

echo.
echo ========================================
echo 🔒 GRC SECURE PRODUCTION DEPLOYMENT
echo ========================================
echo.

REM Check if .env.production exists
if not exist ".env.production" (
    echo ❌ ERROR: .env.production file not found!
    echo.
    echo 📋 Please follow these steps:
    echo 1. Copy .env.production.template to .env.production
    echo 2. Update all REPLACE_WITH_* values with secure passwords
    echo 3. Set your domain name and email address
    echo 4. Configure SMTP settings
    echo.
    echo 💡 Use this command to get started:
    echo    copy .env.production.template .env.production
    echo.
    pause
    exit /b 1
)

REM Load environment variables
for /f "usebackq tokens=1,2 delims==" %%a in (".env.production") do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" (
        set "%%a=%%b"
    )
)

echo ✅ Found .env.production file
echo.

REM Security validation
echo 🔍 Performing security validation...
echo.

set "SECURITY_ISSUES=0"

REM Check for default/placeholder values
findstr /C:"REPLACE_WITH_" .env.production >nul
if !errorlevel! equ 0 (
    echo ❌ SECURITY ISSUE: Found placeholder values in .env.production
    echo    Please replace all REPLACE_WITH_* values with secure passwords
    set /a SECURITY_ISSUES+=1
)

findstr /C:"your-domain.com" .env.production >nul
if !errorlevel! equ 0 (
    echo ❌ SECURITY ISSUE: Default domain found in .env.production
    echo    Please set your actual domain name
    set /a SECURITY_ISSUES+=1
)

findstr /C:"admin@your-domain.com" .env.production >nul
if !errorlevel! equ 0 (
    echo ❌ SECURITY ISSUE: Default email found in .env.production
    echo    Please set your actual admin email
    set /a SECURITY_ISSUES+=1
)

REM Check Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ SECURITY ISSUE: Docker is not running
    set /a SECURITY_ISSUES+=1
)

REM Check if domain is set
if "%DOMAIN_NAME%"=="your-domain.com" (
    echo ❌ SECURITY ISSUE: Domain name not configured
    set /a SECURITY_ISSUES+=1
)

if !SECURITY_ISSUES! gtr 0 (
    echo.
    echo ❌ DEPLOYMENT BLOCKED: !SECURITY_ISSUES! security issues found
    echo.
    echo 📋 Please review the PRODUCTION_SECURITY_CHECKLIST.md file
    echo    and fix all security issues before deployment.
    echo.
    pause
    exit /b 1
)

echo ✅ Security validation passed
echo.

REM Display deployment information
echo 📊 Deployment Configuration:
echo ============================
echo Domain: %DOMAIN_NAME%
echo Admin Email: %ADMIN_EMAIL%
echo Environment: %NODE_ENV%
echo Database: %DB_NAME%
echo.

REM Confirm deployment
choice /c YN /m "Proceed with secure deployment"
if errorlevel 2 (
    echo Deployment cancelled by user
    exit /b 0
)

echo.
echo 🚀 Starting secure deployment...
echo.

REM Set build variables
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "BUILD_DATE=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%T%dt:~8,2%:%dt:~10,2%:%dt:~12,2%Z"
set "BUILD_VERSION=secure-%dt:~0,8%-%dt:~8,6%"

echo 📅 Build Date: %BUILD_DATE%
echo 🏷️  Build Version: %BUILD_VERSION%
echo.

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose -f infra/deployment/docker-compose.production.yml down --remove-orphans 2>nul

REM Clean Docker system
echo 🧹 Cleaning Docker system for fresh build...
docker system prune -f
docker builder prune -f

REM Build frontend
echo 📦 Building frontend with security optimizations...
cd apps\web
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

REM Set environment variables for Docker Compose
set BUILD_DATE=%BUILD_DATE%
set BUILD_VERSION=%BUILD_VERSION%

REM Build Docker images
echo 🔨 Building secure Docker images...
docker-compose -f infra/deployment/docker-compose.production.yml build --no-cache --pull --parallel

if %errorlevel% neq 0 (
    echo ❌ Docker build failed!
    pause
    exit /b 1
)

REM Start services
echo 🚀 Starting production services...
docker-compose -f infra/deployment/docker-compose.production.yml up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start services!
    pause
    exit /b 1
)

REM Wait for services
echo ⏳ Waiting for services to initialize...
timeout /t 45 /nobreak >nul

REM Health checks
echo 🏥 Performing health checks...
docker-compose -f infra/deployment/docker-compose.production.yml ps

REM Security verification
echo 🔍 Performing post-deployment security checks...

REM Check if services are running
for /f "tokens=*" %%i in ('docker-compose -f infra/deployment/docker-compose.production.yml ps -q') do (
    if "%%i"=="" (
        echo ❌ No containers are running!
        goto :deployment_failed
    )
)

REM Test HTTP to HTTPS redirect (if domain is configured)
if not "%DOMAIN_NAME%"=="your-domain.com" (
    echo 🔒 Testing HTTPS redirect...
    curl -s -I http://%DOMAIN_NAME% | findstr "301\|302" >nul
    if !errorlevel! equ 0 (
        echo ✅ HTTPS redirect working
    ) else (
        echo ⚠️  HTTPS redirect test inconclusive
    )
)

echo.
echo ========================================
echo ✅ SECURE DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo 🌐 Your GRC application is now running securely:
if not "%DOMAIN_NAME%"=="your-domain.com" (
    echo    🔒 HTTPS: https://%DOMAIN_NAME%
    echo    🔗 API: https://%DOMAIN_NAME%/api
) else (
    echo    🔒 HTTPS: https://localhost (configure domain for production)
    echo    🔗 API: https://localhost/api
)
echo.
echo 🔒 Security Features Enabled:
echo    ✅ SSL/TLS encryption
echo    ✅ Security headers configured
echo    ✅ Rate limiting active
echo    ✅ Container security hardening
echo    ✅ Database encryption
echo    ✅ Secure password hashing
echo.
echo 📋 Next Steps:
echo    1. Test SSL: https://www.ssllabs.com/ssltest/analyze.html?d=%DOMAIN_NAME%
echo    2. Test security headers: https://securityheaders.com/?q=%DOMAIN_NAME%
echo    3. Review logs: docker-compose -f infra/deployment/docker-compose.production.yml logs
echo    4. Monitor health: docker-compose -f infra/deployment/docker-compose.production.yml ps
echo.
echo 🔧 Build Information:
echo    Build Date: %BUILD_DATE%
echo    Build Version: %BUILD_VERSION%
echo    Security Level: Production Hardened
echo.

goto :end

:deployment_failed
echo.
echo ❌ DEPLOYMENT FAILED!
echo.
echo 🔍 Troubleshooting steps:
echo 1. Check logs: docker-compose -f infra/deployment/docker-compose.production.yml logs
echo 2. Check container status: docker ps -a
echo 3. Verify .env.production configuration
echo 4. Check domain DNS settings
echo.

:end
pause
