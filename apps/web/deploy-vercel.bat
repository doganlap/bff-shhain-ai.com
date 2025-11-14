@echo off
echo 🚀 Deploying Shahin AI GRC to Vercel...

REM Build the frontend
echo 📦 Building frontend...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    exit /b 1
)

echo ✅ Frontend build successful

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...

REM Use Vercel CLI with specific configuration
call npx vercel deploy ^
  --prod ^
  --name="shahin-ai-grc" ^
  --regions="iad1" ^
  --build-env="NODE_ENV=production" ^
  --env="VITE_API_URL=https://grc-backend.shahin-ai.com/api" ^
  --env="VITE_API_BASE_URL=https://grc-backend.shahin-ai.com/api" ^
  --env="VITE_WS_URL=wss://grc-backend.shahin-ai.com" ^
  --env="NODE_ENV=production" ^
  --confirm

if %errorlevel% equ 0 (
    echo ✅ Deployment successful!
    echo 🌐 Your GRC platform is now live on Vercel
) else (
    echo ❌ Deployment failed
    exit /b 1
)