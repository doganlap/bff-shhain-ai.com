@echo off
title Vercel DNS Setup Monitor - www.shahin-ai.com
color 0A
echo.
echo ===============================================
echo    VERCEL DNS SETUP MONITOR
echo    Domain: www.shahin-ai.com
echo ===============================================
echo.

echo [%TIME%] Checking DNS propagation status...
echo.

:CHECK_DNS
echo ----------------------------------------
echo Checking TXT record (verification)...
nslookup -type=TXT asuid.www.shahin-ai.com
if %ERRORLEVEL% EQU 0 (
    echo ✅ TXT record found!
    set TXT_OK=1
) else (
    echo ❌ TXT record not ready yet
    set TXT_OK=0
)

echo.
echo Checking CNAME record (domain pointer)...
nslookup www.shahin-ai.com
if %ERRORLEVEL% EQU 0 (
    echo ✅ CNAME record found!
    set CNAME_OK=1
) else (
    echo ❌ CNAME record not ready yet
    set CNAME_OK=0
)

echo.
if %TXT_OK%==1 if %CNAME_OK%==1 (
    echo ✅ ✅ BOTH RECORDS READY! ✅ ✅
    echo.
    echo Attempting Azure Container App setup...
    az containerapp hostname add --hostname www.shahin-ai.com --name grc-landing-page-prod --resource-group rg-grc-assessment-prod
    echo.
    echo ===============================================
    echo    SETUP COMPLETE!
    echo    Your site should be available at:
    echo    https://www.shahin-ai.com
    echo ===============================================
    echo.
    pause
    exit
) else (
    echo ⏰ DNS records still propagating...
    echo Waiting 2 minutes before next check...
    timeout /t 120 /nobreak >nul
    echo.
    goto CHECK_DNS
)

pause
