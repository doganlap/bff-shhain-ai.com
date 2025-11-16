@echo off
echo ===============================================
echo 🚀 DEPLOYING SHAHIN AI TO AZURE CONTAINER APP
echo ===============================================
echo.
echo Target: grc-landing-page-prod
echo Location: East US  
echo URL: https://grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io
echo.

REM Set correct subscription
echo ⚙️  Setting Azure subscription...
az account set --subscription "19634f31-afc3-438c-a37e-820c16db7585"

REM Build the frontend for production
echo 📦 Building frontend for production...
cd landing-page
call npm run build
cd ..

REM Deploy to existing Container App
echo 🚀 Deploying to Azure Container App...
az containerapp update ^
  --name "grc-landing-page-prod" ^
  --resource-group "rg-grc-assessment-prod" ^
  --source . ^
  --target-port 80 ^
  --ingress external

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 🌐 Your Shahin AI platform is now live at:
echo https://grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io
echo.
echo 📋 Next Steps:
echo 1. Test the deployed application
echo 2. Configure custom domain (shahin-ai.com)
echo 3. Set up SSL certificate
echo.
pause