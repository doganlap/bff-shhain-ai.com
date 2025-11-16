@echo off
echo ========================================
echo 🌐 Shahin AI Domain Deployment Script
echo www.shahin-ai.com Configuration
echo ========================================
echo.

REM Set production environment
set NODE_ENV=production
set VITE_API_URL=https://www.shahin-ai.com

echo 📦 Step 1: Building frontend for www.shahin-ai.com...
cd landing-page

REM Install dependencies
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

REM Build for production with domain configuration
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo ✅ Frontend built successfully in 'dist' folder

echo.
echo 🔧 Step 2: Preparing backend...
cd ..\backend

REM Copy production environment
copy .env.production .env

REM Install backend dependencies
call npm install --only=production
if %errorlevel% neq 0 (
    echo ❌ Backend setup failed!
    pause
    exit /b 1
)

echo ✅ Backend ready for deployment

echo.
echo ========================================
echo 🎉 DEPLOYMENT READY FOR www.shahin-ai.com
echo ========================================
echo.
echo 📁 Files to upload to your web server:
echo    • Upload 'landing-page/dist/*' to web root
echo    • Upload 'backend/' to server (keep folder structure)
echo.
echo 🔧 Server Configuration Needed:
echo    1. Point DNS A record: www.shahin-ai.com → YOUR_SERVER_IP
echo    2. Install SSL certificate (Let's Encrypt recommended)
echo    3. Configure web server (Nginx/Apache) to serve files
echo    4. Start Node.js backend on port 3001
echo    5. Set up reverse proxy: /api/* → localhost:3001
echo.
echo 🌐 Expected Live URLs:
echo    • Frontend: https://www.shahin-ai.com
echo    • API Health: https://www.shahin-ai.com/api/ai/health
echo    • AI Chat: https://www.shahin-ai.com/api/ai/chat
echo.
echo 📋 Quick Server Setup Commands (Ubuntu/CentOS):
echo    sudo apt update && sudo apt install nginx nodejs npm
echo    sudo certbot --nginx -d www.shahin-ai.com
echo    sudo systemctl start nginx
echo    cd backend && npm start
echo.
echo ✅ Your Shahin AI platform is ready for www.shahin-ai.com!

pause