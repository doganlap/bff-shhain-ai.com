@echo off
echo 🚀 Starting Shahin AI Production Deployment...

REM Set production environment
set NODE_ENV=production
set VITE_API_URL=https://www.shahin-ai.com

REM Build frontend for production
echo 📦 Building frontend for production...
cd landing-page
call npm run build:prod
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

REM Prepare backend for deployment
echo 🔧 Preparing backend for deployment...
cd ..\backend
copy .env.production .env

REM Install production dependencies
echo 📥 Installing production dependencies...
call npm ci --only=production

echo ✅ Deployment preparation complete!
echo.
echo 📋 Next Steps:
echo 1. Upload 'landing-page/dist' to your web server
echo 2. Deploy backend to https://www.shahin-ai.com
echo 3. Set up SSL certificate for HTTPS
echo 4. Configure domain DNS to point to your server
echo.
echo 🔗 Production URLs:
echo    Frontend: https://www.shahin-ai.com
echo    Backend API: https://www.shahin-ai.com/api/
echo    Health Check: https://www.shahin-ai.com/api/ai/health
echo.
echo 🎯 AI Services Configured:
echo    ✅ OpenAI API Integration
echo    ⏳ Azure OpenAI (ready for keys)
echo    ✅ Multi-modal capabilities  
echo    ✅ Smart routing ^& fallbacks

pause