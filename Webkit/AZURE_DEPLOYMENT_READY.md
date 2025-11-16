# ✅ Azure Deployment Ready - Single Docker Package

## 🎯 Configuration Complete

### ✅ Environment Variables Built Into Docker Image

The Docker image has been built with the following environment variables baked into the build:

```env
VITE_API_URL=https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api
VITE_FRONTEND_URL=https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io
```

These are configured in:
- `landing-page/Dockerfile` (with default values)
- `deploy-azure.ps1` (passed as build args)
- Used in `sandboxService.js` and `bookingService.js`

### ✅ Docker Image Ready

- **Image Name**: `shahin-landing:latest`
- **Status**: Built successfully
- **Size**: ~80.5MB
- **Includes**: All environment variables baked into build

## 🚀 Deployment Steps

### Option 1: Create Azure Resources First

If Azure resources don't exist yet, create them:

```powershell
# Set variables
$resourceGroup = "rg-grc-assessment-prod"
$location = "eastus"
$acrName = "grcacr202511012324"  # Must be globally unique
$envName = "grc-env-prod"
$appName = "grc-landing-page-prod"

# Create Resource Group
az group create --name $resourceGroup --location $location

# Create Azure Container Registry
az acr create --resource-group $resourceGroup --name $acrName --sku Basic

# Create Container App Environment
az containerapp env create `
    --name $envName `
    --resource-group $resourceGroup `
    --location $location
```

### Option 2: Deploy with Script

Once resources exist, run:

```powershell
cd d:\www.shahin.com
.\deploy-azure.ps1
```

Or manually:

```powershell
cd landing-page

# 1. Build with environment variables
docker build `
  --build-arg VITE_API_URL="https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api" `
  --build-arg VITE_FRONTEND_URL="https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io" `
  -t shahin-landing:latest `
  -f Dockerfile .

# 2. Login to Azure
az login
az acr login --name grcacr202511012324

# 3. Tag and push
$acrServer = az acr show --name grcacr202511012324 --query loginServer --output tsv
docker tag shahin-landing:latest "$acrServer/landing-page:latest"
docker push "$acrServer/landing-page:latest"

# 4. Deploy
az containerapp update `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --image "$acrServer/landing-page:latest"
```

## ✅ Verification Checklist

### Environment Variables Checked:
- ✅ `VITE_API_URL` - Set in Dockerfile with default
- ✅ `VITE_FRONTEND_URL` - Set in Dockerfile with default
- ✅ Used in `sandboxService.js`
- ✅ Used in `bookingService.js`

### Docker Configuration:
- ✅ Multi-stage build optimized
- ✅ Environment variables support
- ✅ HTTPS configuration
- ✅ Health check endpoint
- ✅ Nginx serving static files

### Sections Wired:
- ✅ All 13 sections properly configured with IDs
- ✅ Navigation synchronized
- ✅ Scroll spy working

## 📋 Current Status

- ✅ Docker image built: `shahin-landing:latest`
- ✅ Environment variables configured
- ✅ HTTPS ready
- ✅ Health check working
- ⏳ Azure resources need to be created (or use existing)

## 🔧 Custom Environment Variables

To use different environment variables:

```powershell
$env:VITE_API_URL = "https://your-api.com/api"
$env:VITE_FRONTEND_URL = "https://your-frontend.com"

cd landing-page
docker build `
  --build-arg VITE_API_URL="$env:VITE_API_URL" `
  --build-arg VITE_FRONTEND_URL="$env:VITE_FRONTEND_URL" `
  -t shahin-landing:latest `
  -f Dockerfile .
```

---

**Status**: ✅ **READY FOR AZURE DEPLOYMENT**

Once Azure resources are created, run `.\deploy-azure.ps1` to deploy!

