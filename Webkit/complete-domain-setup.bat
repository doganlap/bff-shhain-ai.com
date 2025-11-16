@echo off
echo.
echo ============================================
echo   CUSTOM DOMAIN SETUP COMPLETION
echo ============================================
echo.
echo Checking DNS records...
echo.

REM Check TXT record
echo Checking TXT verification record...
nslookup -type=TXT asuid.www.shahin-ai.com

echo.
echo Checking CNAME record...
nslookup www.shahin-ai.com

echo.
echo ============================================
echo   ADDING DOMAIN TO AZURE
echo ============================================
echo.

REM Add custom domain to Azure Container App
az containerapp hostname add --hostname www.shahin-ai.com --name grc-landing-page-prod --resource-group rg-grc-assessment-prod

echo.
echo ============================================
echo   SETUP COMPLETE!
echo ============================================
echo.
echo Your site will be available at:
echo https://www.shahin-ai.com
echo.
echo SSL certificate will be automatically provisioned.
echo.
pause
