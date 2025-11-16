@echo off
title Shahin GRC - Test Cloudflare Build
color 0E
echo.
echo ========================================
echo   Shahin GRC - Test Cloudflare Build
echo ========================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

:: Install dependencies if needed
echo [1/3] Installing dependencies...
cd landing-page
if not exist "node_modules" (
    call npm install
)
cd ..

:: Build
echo.
echo [2/3] Building for production...
cd landing-page
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
cd ..

echo ✅ Build successful!
echo.

:: Check build output
echo [3/3] Checking build output...
if not exist "landing-page\dist\index.html" (
    echo ❌ index.html not found in build output!
    pause
    exit /b 1
)

echo ✅ index.html found
if not exist "landing-page\dist\_redirects" (
    echo ⚠️  _redirects file not found (will be created)
    copy landing-page\public\_redirects landing-page\dist\_redirects >nul 2>&1
)

echo ✅ _redirects file found
echo.

:: Test preview
echo Starting preview server...
echo.
echo Preview will open at: http://localhost:4173
echo Press Ctrl+C to stop the preview server
echo.
cd landing-page
call npm run preview

pause

