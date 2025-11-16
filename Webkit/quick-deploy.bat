@echo off
echo =========================================
echo 🚀 QUICK SHAHIN AI AZURE DEPLOYMENT
echo =========================================
echo.

REM Copy the index.html directly to see what we have
echo 📄 Current index.html content:
type "azure-deployment\index.html"
echo.

REM Try to update using revision
echo 🔄 Creating new revision with updated content...
az containerapp revision copy ^
  --name shahin-ai-platform ^
  --resource-group rg-grc-assessment-prod ^
  --from-revision shahin-ai-platform--y59y4vs ^
  --image nginx:alpine

echo.
echo ✅ Deployment attempted!
echo 🌐 Check: https://shahin-ai-platform.mangofield-b9b64fbb.eastus.azurecontainerapps.io
echo.
pause