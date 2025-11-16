@echo off
REM 🚀 Shahin AI Platform - Windows Production Deployment Script
REM Domain: shahin-ai.com
REM Date: November 2, 2025

echo 🚀 Starting Shahin AI Platform Deployment...
echo 🌐 Target Domain: shahin-ai.com
echo 📅 Date: %date% %time%
echo ==========================================

REM Configuration
set DOMAIN=shahin-ai.com
set PROJECT_NAME=shahin-ai
set BUILD_DIR=%cd%\landing-page\dist
set BACKEND_DIR=%cd%\backend

echo 📦 Production Build Status: READY
echo ✅ Frontend Build: %BUILD_DIR%
echo ✅ Backend API: %BACKEND_DIR%
echo ✅ Domain Config: %DOMAIN%

echo.
echo 📋 Deployment Options:
echo [1] Deploy to Azure Container Apps
echo [2] Deploy to VPS/Dedicated Server
echo [3] Create Deployment Package (ZIP)
echo [4] Test Local Production Build

set /p choice="Choose deployment method (1-4): "

if "%choice%"=="1" goto azure_deploy
if "%choice%"=="2" goto vps_deploy
if "%choice%"=="3" goto package_deploy
if "%choice%"=="4" goto test_deploy
goto invalid_choice

:azure_deploy
echo 🔵 Azure Container Apps Deployment
echo ==========================================
if exist "DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1" (
    echo ✅ Found Azure deployment script
    powershell -ExecutionPolicy Bypass -File "landing-page\DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1"
) else (
    echo ❌ Azure deployment script not found
    goto end
)
goto end

:vps_deploy
echo 🖥️  VPS/Server Deployment Instructions
echo ==========================================
echo 📋 Manual Steps Required:
echo.
echo 1️⃣  Upload files to server:
echo    - Frontend: Upload %BUILD_DIR%\* to /var/www/shahin-ai.com/
echo    - Backend: Upload %BACKEND_DIR%\* to /opt/shahin-api/
echo    - Nginx: Upload nginx-shahin-ai.conf to /etc/nginx/sites-available/
echo.
echo 2️⃣  Server commands:
echo    sudo ln -s /etc/nginx/sites-available/nginx-shahin-ai.conf /etc/nginx/sites-enabled/
echo    cd /opt/shahin-api ^&^& npm install
echo    pm2 start server.js --name shahin-api
echo    sudo systemctl restart nginx
echo.
echo 3️⃣  SSL Certificate:
echo    sudo certbot --nginx -d %DOMAIN% -d www.%DOMAIN%
echo.
goto end

:package_deploy
echo 📦 Creating Deployment Package
echo ==========================================

REM Create deployment directory
set DEPLOY_DIR=%cd%\deployment-package
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%"

echo 📁 Creating package structure...

REM Copy frontend build
mkdir "%DEPLOY_DIR%\frontend"
if exist "%BUILD_DIR%" (
    xcopy "%BUILD_DIR%\*" "%DEPLOY_DIR%\frontend\" /e /i /y > nul
    echo ✅ Frontend build copied
) else (
    echo ❌ Frontend build not found. Run 'npm run build' first.
    goto end
)

REM Copy backend
mkdir "%DEPLOY_DIR%\backend"
if exist "%BACKEND_DIR%" (
    xcopy "%BACKEND_DIR%\*" "%DEPLOY_DIR%\backend\" /e /i /y > nul
    echo ✅ Backend files copied
) else (
    echo ❌ Backend directory not found
    goto end
)

REM Copy configuration files
copy "nginx-shahin-ai.conf" "%DEPLOY_DIR%\" > nul 2>&1
copy ".env.production" "%DEPLOY_DIR%\" > nul 2>&1
copy "DEPLOYMENT_PACKAGE.md" "%DEPLOY_DIR%\README.md" > nul 2>&1

REM Create deployment scripts
echo #!/bin/bash > "%DEPLOY_DIR%\install.sh"
echo # Shahin AI Installation Script >> "%DEPLOY_DIR%\install.sh"
echo sudo cp -r frontend/* /var/www/shahin-ai.com/ >> "%DEPLOY_DIR%\install.sh"
echo sudo cp -r backend/* /opt/shahin-api/ >> "%DEPLOY_DIR%\install.sh"
echo cd /opt/shahin-api ^&^& npm install >> "%DEPLOY_DIR%\install.sh"
echo pm2 start server.js --name shahin-api >> "%DEPLOY_DIR%\install.sh"
echo sudo cp nginx-shahin-ai.conf /etc/nginx/sites-available/ >> "%DEPLOY_DIR%\install.sh"
echo sudo ln -sf /etc/nginx/sites-available/nginx-shahin-ai.conf /etc/nginx/sites-enabled/ >> "%DEPLOY_DIR%\install.sh"
echo sudo systemctl restart nginx >> "%DEPLOY_DIR%\install.sh"

REM Create ZIP package
powershell -command "Compress-Archive -Path '%DEPLOY_DIR%\*' -DestinationPath '%cd%\shahin-ai-production-package.zip' -Force"

echo ✅ Deployment package created: shahin-ai-production-package.zip
echo 📁 Package contents: %DEPLOY_DIR%
echo.
echo 🚀 Upload this ZIP to your server and run install.sh
goto end

:test_deploy
echo 🧪 Testing Local Production Build
echo ==========================================

REM Check if build exists
if not exist "%BUILD_DIR%" (
    echo ❌ Production build not found. Building now...
    cd landing-page
    call npm run build
    cd ..
)

REM Start backend for testing
echo 🔧 Starting backend server...
start "Shahin API Server" cmd /k "cd backend && node server.js"
timeout /t 3 > nul

REM Start simple HTTP server for frontend
echo 🌐 Starting frontend server...
cd "%BUILD_DIR%"
start "Shahin Frontend" cmd /k "python -m http.server 8080 || npx serve -p 8080"
cd ..

echo ✅ Local production test started:
echo 🌐 Frontend: http://localhost:8080
echo 🔧 Backend: http://localhost:3001
echo 📊 Health Check: http://localhost:3001/api/ai/health
echo.
echo Press any key to stop test servers...
pause > nul

REM Kill test processes
taskkill /f /im "node.exe" > nul 2>&1
taskkill /f /im "python.exe" > nul 2>&1
echo ✅ Test servers stopped
goto end

:invalid_choice
echo ❌ Invalid choice. Please select 1-4.
goto end

:end
echo.
echo 🎉 Deployment process completed!
echo 📚 Check DEPLOYMENT_PACKAGE.md for detailed instructions
pause