@echo off
echo ================================================
echo 🚀 UPLOADING SHAHIN AI TO AZURE CONTAINER APP
echo ================================================
echo.
echo Target: shahin-ai-platform
echo URL: https://shahin-ai-platform.mangofield-b9b64fbb.eastus.azurecontainerapps.io
echo.

REM Create a simple static deployment
echo 📦 Copying built files to deployment directory...
if not exist "azure-deployment" mkdir azure-deployment
xcopy "landing-page\dist\*" "azure-deployment\" /E /Y

REM Create a simple Dockerfile for static content
echo 🐳 Creating Dockerfile for deployment...
(
echo FROM nginx:alpine
echo COPY . /usr/share/nginx/html
echo COPY nginx.conf /etc/nginx/conf.d/default.conf
echo EXPOSE 80
echo CMD ["nginx", "-g", "daemon off;"]
) > azure-deployment\Dockerfile

REM Copy nginx config
copy "landing-page\nginx.conf" "azure-deployment\" >nul

echo ✅ Deployment package ready in 'azure-deployment' folder
echo.
echo 🚀 To complete deployment, run:
echo    az containerapp update --name shahin-ai-platform --resource-group rg-grc-assessment-prod --source azure-deployment
echo.
pause