@echo off
echo Deploying GRC Frontend to Production...
cd apps\web
echo Building frontend...
call pnpm build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    exit /b 1
)
echo Deploying to Vercel...
call npx vercel --prod --yes
echo Done!
