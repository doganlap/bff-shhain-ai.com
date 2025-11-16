@echo off
echo ===== GRC Project Quick Deployment =====
echo This script will deploy both BFF and Web applications
echo.

echo Step 1: Deploying BFF Application
cd /d "d:\Projects\GRC-Master\Assessmant-GRC\apps\bff"
echo Current directory: %CD%
vercel --prod --yes
echo BFF deployment completed
echo.

echo Step 2: Deploying Web Application
cd /d "d:\Projects\GRC-Master\Assessmant-GRC\apps\web"
echo Current directory: %CD%
vercel --prod --yes
echo Web deployment completed
echo.

echo ===== Deployment Summary =====
echo BFF: https://bff-shahin-ai-com.vercel.app
echo Web: https://app-shahin-ai-com.vercel.app
echo.
echo Environment variables have been set through Vercel dashboard
echo CORS should now be configured correctly
echo.
echo Next step: Test your application!
echo.
pause
