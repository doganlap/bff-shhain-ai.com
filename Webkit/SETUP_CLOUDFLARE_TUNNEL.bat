@echo off
title Shahin GRC - Setup Cloudflare Tunnel
color 0B
echo.
echo ========================================
echo   Shahin GRC - Cloudflare Tunnel Setup
echo ========================================
echo.

:: Check if cloudflared is installed
where cloudflared >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Cloudflared not found. Installing...
    echo.
    echo Downloading cloudflared...
    echo.
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
    if %errorlevel% neq 0 (
        echo ❌ Failed to download cloudflared
        echo.
        echo Please download manually:
        echo https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
        echo.
        pause
        exit /b 1
    )
    echo ✅ Cloudflared downloaded
) else (
    echo ✅ Cloudflared found
)

echo.
echo ========================================
echo   Cloudflare Tunnel Setup
echo ========================================
echo.
echo This will set up a tunnel to connect your backend to Cloudflare.
echo.
echo Steps:
echo 1. Login to Cloudflare (will open browser)
echo 2. Create tunnel
echo 3. Configure tunnel to route api.shahin-ai.com to localhost:3001
echo 4. Run tunnel
echo.
pause

:: Login to Cloudflare
echo.
echo [Step 1/4] Logging in to Cloudflare...
echo This will open your browser for authorization.
echo Please accept and authorize the connection.
echo.
cloudflared tunnel login
if %errorlevel% neq 0 (
    echo ❌ Login failed
    pause
    exit /b 1
)
echo ✅ Logged in to Cloudflare
echo.

:: Create tunnel
echo [Step 2/4] Creating tunnel...
set /p TUNNEL_NAME="Enter tunnel name (e.g., shahin-backend): "
if "%TUNNEL_NAME%"=="" (
    set TUNNEL_NAME=shahin-backend
)

cloudflared tunnel create %TUNNEL_NAME%
if %errorlevel% neq 0 (
    echo ❌ Failed to create tunnel
    pause
    exit /b 1
)
echo ✅ Tunnel created: %TUNNEL_NAME%
echo.

:: Create config file
echo [Step 3/4] Creating tunnel configuration...
(
echo tunnel: %TUNNEL_NAME%
echo credentials-file: %USERPROFILE%\.cloudflared\%TUNNEL_NAME%.json
echo.
echo ingress:
echo   - hostname: api.shahin-ai.com
echo     service: http://localhost:3001
echo   - service: http_status:404
) > cloudflared-config.yml

echo ✅ Configuration file created: cloudflared-config.yml
echo.

:: Route DNS
echo [Step 4/4] Routing DNS...
cloudflared tunnel route dns %TUNNEL_NAME% api.shahin-ai.com
if %errorlevel% neq 0 (
    echo ⚠️  DNS routing may need to be configured manually
    echo.
    echo Please configure DNS manually:
    echo 1. Go to Cloudflare Dashboard → DNS
    echo 2. Add CNAME record:
    echo    Name: api
    echo    Target: %TUNNEL_NAME%.cfargotunnel.com
    echo    Proxy: On
    echo.
) else (
    echo ✅ DNS routed
)
echo.

:: Run tunnel
echo ========================================
echo   Tunnel Setup Complete! ✅
echo ========================================
echo.
echo To run the tunnel:
echo   cloudflared tunnel run %TUNNEL_NAME%
echo.
echo Or use the configuration file:
echo   cloudflared tunnel --config cloudflared-config.yml run
echo.
echo ⚠️  IMPORTANT: Make sure your backend is running on localhost:3001
echo.
set /p RUN_TUNNEL="Run tunnel now? (y/n): "
if /i "%RUN_TUNNEL%"=="y" (
    echo.
    echo Starting tunnel...
    echo Press Ctrl+C to stop
    echo.
    cloudflared tunnel --config cloudflared-config.yml run
) else (
    echo.
    echo To run tunnel later:
    echo   cloudflared tunnel --config cloudflared-config.yml run
)

pause

