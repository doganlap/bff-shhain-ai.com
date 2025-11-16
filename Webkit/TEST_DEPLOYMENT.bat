@echo off
title Shahin GRC - Test Deployment
color 0A
echo.
echo ========================================
echo   Shahin GRC - Deployment Test
echo ========================================
echo.

:: Test 1: Build
echo [Test 1/5] Building frontend...
cd landing-page
call npm run build >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build successful
cd ..

:: Test 2: Check build output
echo.
echo [Test 2/5] Checking build output...
if not exist "landing-page\dist\index.html" (
    echo ❌ index.html not found!
    pause
    exit /b 1
)
echo ✅ index.html exists

if not exist "landing-page\dist\_redirects" (
    echo ⚠️  _redirects not found - copying...
    copy landing-page\public\_redirects landing-page\dist\_redirects >nul 2>&1
    if not exist "landing-page\dist\_redirects" (
        echo ❌ Failed to copy _redirects
        pause
        exit /b 1
    )
)
echo ✅ _redirects exists

:: Test 3: Check assets
echo.
echo [Test 3/5] Checking assets...
if not exist "landing-page\dist\assets" (
    echo ❌ assets folder not found!
    pause
    exit /b 1
)
echo ✅ assets folder exists

:: Test 4: Check file sizes
echo.
echo [Test 4/5] Checking file sizes...
for %%f in (landing-page\dist\index.html) do (
    set size=%%~zf
    if %%~zf LSS 1000 (
        echo ⚠️  index.html seems too small
    ) else (
        echo ✅ index.html size: %%~zf bytes
    )
)

:: Test 5: Preview test
echo.
echo [Test 5/5] Starting preview server...
echo.
echo Preview server will start at http://localhost:4173
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo   All Tests Passed! ✅
echo ========================================
echo.
echo Build output: landing-page\dist
echo Ready for Cloudflare deployment!
echo.
cd landing-page
call npm run preview

pause

