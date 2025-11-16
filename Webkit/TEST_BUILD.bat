@echo off
title Shahin GRC - Test Build
color 0A
echo.
echo ========================================
echo   Shahin GRC - Build Test
echo ========================================
echo.

:: Change to landing-page directory
cd landing-page

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
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

:: Build
echo Building for production...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.

:: Check build output
echo Checking build output...
if not exist "dist\index.html" (
    echo ❌ index.html not found!
    pause
    exit /b 1
)
echo ✅ index.html exists

if not exist "dist\_redirects" (
    echo ⚠️  _redirects not found in dist
    if exist "public\_redirects" (
        echo Copying _redirects from public folder...
        copy public\_redirects dist\_redirects >nul 2>&1
        if exist "dist\_redirects" (
            echo ✅ _redirects copied to dist
        ) else (
            echo ❌ Failed to copy _redirects
        )
    ) else (
        echo ❌ _redirects not found in public folder
    )
) else (
    echo ✅ _redirects exists
)

if not exist "dist\assets" (
    echo ❌ assets folder not found!
    pause
    exit /b 1
)
echo ✅ assets folder exists

:: Calculate build size
echo.
echo ========================================
echo   Build Summary
echo ========================================
echo.
echo Build output: dist\
echo.

:: List key files
echo Key files:
dir /b dist\index.html >nul 2>&1 && echo   ✅ index.html
dir /b dist\_redirects >nul 2>&1 && echo   ✅ _redirects
dir /b dist\assets >nul 2>&1 && echo   ✅ assets\

echo.
echo ========================================
echo   Build Test Complete! ✅
echo ========================================
echo.
echo Build is ready for deployment!
echo.
echo Next steps:
echo 1. Test preview: npm run preview
echo 2. Deploy to Cloudflare: DEPLOY_CLOUDFLARE.bat
echo.
pause

