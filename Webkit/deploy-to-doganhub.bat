@echo off
echo ========================================
echo 🌐 Dogan Hub - Shahin AI Management Platform
echo www.doganhub.com Deployment Script
echo Partnership: Dogan Consulting x Shahin AI
echo ========================================
echo.

REM Set production environment for Dogan Hub
set NODE_ENV=production
set VITE_API_URL=https://www.doganhub.com
set VITE_PLATFORM_NAME=Dogan Hub
set VITE_PARTNER_MODE=true

echo 📦 Step 1: Building frontend for www.doganhub.com...
cd landing-page

REM Install dependencies
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo 🎨 Configuring Dogan Hub branding...
REM Copy Dogan Hub specific configuration
copy ..\doganhub-domain-config.env .env.local

REM Build for production with Dogan Hub configuration
echo Building for Dogan Hub platform...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo ✅ Frontend built successfully for Dogan Hub

echo.
echo 🔧 Step 2: Preparing backend for partnership integration...
cd ..\backend

REM Copy production environment with Dogan Hub settings
copy .env.production .env
echo PLATFORM_NAME=Dogan Hub >> .env
echo PARTNER_INTEGRATION=true >> .env
echo CONSULTING_MODE=true >> .env

REM Install backend dependencies
call npm install --only=production
if %errorlevel% neq 0 (
    echo ❌ Backend setup failed!
    pause
    exit /b 1
)

echo ✅ Backend configured for Dogan Hub partnership

echo.
echo ========================================
echo 🎉 DOGAN HUB DEPLOYMENT READY
echo ========================================
echo.
echo 🏢 Platform: Dogan Hub (www.doganhub.com)
echo 🤝 Partnership: Dogan Consulting x Shahin AI
echo 📊 Purpose: Shahin AI Management Platform
echo.
echo 📁 Files to upload to your web server:
echo    • Upload 'landing-page/dist/*' to web root
echo    • Upload 'backend/' to server (keep folder structure)
echo.
echo 🔧 Server Configuration for Dogan Hub:
echo    1. Point DNS A record: www.doganhub.com → YOUR_SERVER_IP
echo    2. Install SSL certificate (Let's Encrypt recommended)
echo    3. Configure web server (Nginx/Apache) to serve files
echo    4. Start Node.js backend on port 3001
echo    5. Set up reverse proxy: /api/* → localhost:3001
echo.
echo 🌐 Expected Live URLs:
echo    • Frontend: https://www.doganhub.com
echo    • API Health: https://www.doganhub.com/api/ai/health
echo    • AI Management: https://www.doganhub.com/api/ai/chat
echo    • Consulting Dashboard: https://www.doganhub.com/consulting
echo.
echo 🤝 Partnership Integration URLs:
echo    • Shahin AI Link: https://www.shahin-ai.com
echo    • Dogan Consulting: https://doganconsult.com
echo    • Cross-platform Auth: https://www.doganhub.com/auth
echo.
echo 📋 Quick Server Setup Commands (Ubuntu/CentOS):
echo    sudo apt update && sudo apt install nginx nodejs npm
echo    sudo certbot --nginx -d www.doganhub.com
echo    sudo systemctl start nginx
echo    cd backend && npm start
echo.
echo 🎯 DNS Configuration Required:
echo    Type: A Record
echo    Name: @ (or www)
echo    Value: YOUR_SERVER_IP
echo    TTL: 300 (5 minutes)
echo.
echo ✅ Dogan Hub - Shahin AI Management Platform is ready!
echo 🚀 Deploy to www.doganhub.com now!

pause