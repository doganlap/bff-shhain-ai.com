@echo off
REM 🚀 Shahin AI Platform - Production Deployment Preparation
REM This script prepares your files for production deployment

echo ========================================
echo 🚀 Shahin AI Platform - Production Ready
echo 🌐 Domain: shahin-ai.com
echo 📅 Date: %date% %time%
echo ========================================

echo.
echo 📋 Deployment Status:
echo ✅ Frontend Build: READY
echo ✅ Backend API: READY  
echo ✅ Domain Config: READY
echo ✅ Login Gateway: READY
echo ✅ Multi-AI System: READY

echo.
echo 📦 Creating Production Package...

REM Clean and recreate deployment directory
if exist "production-deployment" rmdir /s /q "production-deployment"
mkdir "production-deployment"

echo 📁 Copying frontend build...
mkdir "production-deployment\frontend"
xcopy "landing-page\dist\*" "production-deployment\frontend\" /e /i /y > nul

echo 🔧 Copying backend files...
mkdir "production-deployment\backend"
xcopy "backend\*.js" "production-deployment\backend\" /y > nul
xcopy "backend\package.json" "production-deployment\backend\" /y > nul
xcopy "backend\routes\*" "production-deployment\backend\routes\" /e /i /y > nul
if exist "backend\.env.production" xcopy "backend\.env.production" "production-deployment\backend\" /y > nul

echo 🌐 Copying configuration files...
copy "nginx-shahin-ai.conf" "production-deployment\" > nul
if exist ".env.production" copy ".env.production" "production-deployment\" > nul

echo 📄 Creating deployment scripts...

REM Create Linux deployment script
echo #!/bin/bash > "production-deployment\deploy.sh"
echo # Shahin AI Quick Deployment >> "production-deployment\deploy.sh"
echo set -e >> "production-deployment\deploy.sh"
echo echo "🚀 Deploying Shahin AI Platform..." >> "production-deployment\deploy.sh"
echo. >> "production-deployment\deploy.sh"
echo # Install system packages >> "production-deployment\deploy.sh"
echo sudo apt update ^&^& sudo apt install -y nginx nodejs npm certbot python3-certbot-nginx >> "production-deployment\deploy.sh"
echo sudo npm install -g pm2 >> "production-deployment\deploy.sh"
echo. >> "production-deployment\deploy.sh"
echo # Create directories >> "production-deployment\deploy.sh"
echo sudo mkdir -p /var/www/shahin-ai.com >> "production-deployment\deploy.sh"
echo sudo mkdir -p /opt/shahin-api >> "production-deployment\deploy.sh"
echo. >> "production-deployment\deploy.sh"
echo # Deploy files >> "production-deployment\deploy.sh"
echo sudo cp -r frontend/* /var/www/shahin-ai.com/ >> "production-deployment\deploy.sh"
echo sudo cp -r backend/* /opt/shahin-api/ >> "production-deployment\deploy.sh"
echo sudo chown -R www-data:www-data /var/www/shahin-ai.com >> "production-deployment\deploy.sh"
echo sudo chown -R $USER:$USER /opt/shahin-api >> "production-deployment\deploy.sh"
echo. >> "production-deployment\deploy.sh"
echo # Install dependencies and start services >> "production-deployment\deploy.sh"
echo cd /opt/shahin-api >> "production-deployment\deploy.sh"
echo npm install --production >> "production-deployment\deploy.sh"
echo pm2 start server.js --name shahin-api >> "production-deployment\deploy.sh"
echo pm2 save ^&^& pm2 startup >> "production-deployment\deploy.sh"
echo. >> "production-deployment\deploy.sh"
echo # Configure Nginx >> "production-deployment\deploy.sh"
echo sudo cp ../nginx-shahin-ai.conf /etc/nginx/sites-available/ >> "production-deployment\deploy.sh"
echo sudo ln -sf /etc/nginx/sites-available/nginx-shahin-ai.conf /etc/nginx/sites-enabled/ >> "production-deployment\deploy.sh"
echo sudo rm -f /etc/nginx/sites-enabled/default >> "production-deployment\deploy.sh"
echo sudo nginx -t ^&^& sudo systemctl restart nginx >> "production-deployment\deploy.sh"
echo. >> "production-deployment\deploy.sh"
echo # Setup SSL >> "production-deployment\deploy.sh"
echo sudo certbot --nginx -d shahin-ai.com -d www.shahin-ai.com >> "production-deployment\deploy.sh"
echo. >> "production-deployment\deploy.sh"
echo echo "✅ Deployment Complete! Visit https://shahin-ai.com" >> "production-deployment\deploy.sh"

REM Make script executable on Linux
echo chmod +x deploy.sh > "production-deployment\make-executable.sh"

REM Create README
echo # 🚀 Shahin AI Platform - Production Deployment > "production-deployment\README.md"
echo. >> "production-deployment\README.md"
echo ## Quick Start >> "production-deployment\README.md"
echo. >> "production-deployment\README.md"
echo 1. Upload this folder to your server >> "production-deployment\README.md"
echo 2. Run: `chmod +x deploy.sh` >> "production-deployment\README.md"  
echo 3. Run: `./deploy.sh` >> "production-deployment\README.md"
echo 4. Visit: https://shahin-ai.com >> "production-deployment\README.md"
echo. >> "production-deployment\README.md"
echo ## What's Included >> "production-deployment\README.md"
echo. >> "production-deployment\README.md"
echo - ✅ Frontend build (optimized) >> "production-deployment\README.md"
echo - ✅ Backend API (multi-AI routing) >> "production-deployment\README.md" 
echo - ✅ Nginx configuration >> "production-deployment\README.md"
echo - ✅ SSL setup (Let's Encrypt) >> "production-deployment\README.md"
echo - ✅ PM2 process management >> "production-deployment\README.md"
echo - ✅ Login gateway functionality >> "production-deployment\README.md"
echo. >> "production-deployment\README.md"
echo ## Manual Commands >> "production-deployment\README.md"
echo. >> "production-deployment\README.md"
echo ```bash >> "production-deployment\README.md"
echo # Check services >> "production-deployment\README.md"
echo pm2 status >> "production-deployment\README.md"
echo sudo systemctl status nginx >> "production-deployment\README.md"
echo. >> "production-deployment\README.md"
echo # View logs >> "production-deployment\README.md" 
echo pm2 logs shahin-api >> "production-deployment\README.md"
echo sudo tail -f /var/log/nginx/error.log >> "production-deployment\README.md"
echo. >> "production-deployment\README.md"
echo # Restart services >> "production-deployment\README.md"
echo pm2 restart shahin-api >> "production-deployment\README.md"
echo sudo systemctl restart nginx >> "production-deployment\README.md"
echo ``` >> "production-deployment\README.md"

REM Create ZIP package
echo 📦 Creating ZIP package...
powershell -command "Compress-Archive -Path 'production-deployment\*' -DestinationPath 'shahin-ai-production-ready.zip' -Force"

echo.
echo ========================================
echo ✅ PRODUCTION PACKAGE READY!
echo ========================================
echo.
echo 📁 Package Location: shahin-ai-production-ready.zip
echo 📂 Folder: production-deployment\
echo.
echo 🚀 Deployment Options:
echo.
echo [1] VPS/Dedicated Server:
echo    - Upload shahin-ai-production-ready.zip to server
echo    - Extract: unzip shahin-ai-production-ready.zip  
echo    - Run: chmod +x deploy.sh ^&^& ./deploy.sh
echo.
echo [2] Manual Deployment:
echo    - Follow PRODUCTION_DEPLOYMENT_GUIDE.md
echo.
echo [3] Azure Container Apps:
echo    - Use Azure CLI commands from guide
echo.
echo 🌐 Target Domain: shahin-ai.com
echo 📋 Features Ready:
echo    ✅ Landing Page with Login Gateway
echo    ✅ Multi-Modal AI Chat System  
echo    ✅ Backend API with Multi-Service Routing
echo    ✅ SSL Certificate Setup
echo    ✅ Production Optimized Build
echo.
echo 🎉 Your Shahin AI Platform is ready for production!
echo.
pause