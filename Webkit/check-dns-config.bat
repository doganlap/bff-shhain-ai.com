@echo off
REM 🌐 DNS Configuration Checker for shahin-ai.com
REM This script helps verify your DNS configuration for Azure App Service

echo.
echo ========================================
echo   DNS Configuration Checker
echo   Domain: shahin-ai.com
echo   Azure App Service DNS Setup
echo ========================================
echo.

echo 📋 Required DNS Records:
echo.
echo [1] TXT Record (Verification)
echo     Name: asuid
echo     Value: 8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC
echo.
echo [2] A Record (Root Domain)
echo     Name: @ (or blank)
echo     Value: 20.74.192.6
echo.
echo [3] CNAME Record (www subdomain - optional)
echo     Name: www
echo     Value: shahin-ai.azurewebsites.net
echo.

echo ========================================
echo   Checking DNS Configuration...
echo ========================================
echo.

echo 🔍 Checking A Record for shahin-ai.com...
nslookup shahin-ai.com
echo.

echo 🔍 Checking TXT Record for asuid.shahin-ai.com...
nslookup -type=TXT asuid.shahin-ai.com
echo.

echo 🔍 Checking CNAME for www.shahin-ai.com...
nslookup www.shahin-ai.com
echo.

echo ========================================
echo   Expected Results:
echo ========================================
echo.
echo ✅ A Record should return: 20.74.192.6
echo ✅ TXT Record should contain: 8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC
echo ✅ CNAME should point to: shahin-ai.azurewebsites.net
echo.

echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. If DNS records are missing or incorrect:
echo    - Log in to your domain registrar
echo    - Add the records listed above
echo    - Wait 15-30 minutes for propagation
echo.
echo 2. After DNS is configured:
echo    - Go to Azure Portal
echo    - Navigate to your App Service
echo    - Click "Custom domains"
echo    - Click "Add custom domain"
echo    - Enter: shahin-ai.com
echo    - Click "Validate"
echo.
echo 3. Enable SSL:
echo    - After domain is added
echo    - Click "Add binding"
echo    - Select "App Service Managed Certificate"
echo.

echo ========================================
echo   Online DNS Checkers:
echo ========================================
echo.
echo 🌐 Check DNS propagation:
echo    - https://dnschecker.org
echo    - https://www.whatsmydns.net
echo.
echo 🌐 Azure verification links:
echo    A Record: https://dns.google/resolve?name=shahin-ai.com^&type=A
echo    TXT Record: https://dns.google/resolve?name=asuid.shahin-ai.com^&type=TXT
echo.

pause
