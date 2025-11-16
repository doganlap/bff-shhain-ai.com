# Azure Container Apps Deployment Guide

Complete guide for deploying the Shahin GRC Landing Page as a single Docker package to Azure Container Apps.

## 🚀 Quick Start (One Command)

From the project root directory:

```powershell
.\deploy-azure.ps1
```

That's it! The script will:
1. ✅ Build optimized production Docker image
2. ✅ Push to Azure Container Registry
3. ✅ Deploy to Azure Container Apps
4. ✅ Return your HTTPS URL

## 📋 Prerequisites

1. **Docker Desktop** - Installed and running
2. **Azure CLI** - Installed and logged in
3. **Azure Resources** - Created and ready:
   - Resource Group
   - Azure Container Registry (ACR)
   - Container App Environment

### Verify Prerequisites

```powershell
# Check Docker
docker --version

# Check Azure CLI
az --version

# Check Azure login
az account show

# Login if needed
az login
```

## 🔧 Setup Azure Resources (First Time)

If you haven't created the Azure resources yet, run these commands:

```powershell
# Variables (customize as needed)
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

## 📝 Deployment Script Options

The `deploy-azure.ps1` script accepts optional parameters:

```powershell
.\deploy-azure.ps1 `
    -ResourceGroup "rg-grc-assessment-prod" `
    -ContainerRegistry "grcacr202511012324" `
    -AppName "grc-landing-page-prod" `
    -Environment "grc-env-prod" `
    -ImageTag "v1.0.0"
```

### Default Values

- **ResourceGroup**: `rg-grc-assessment-prod`
- **ContainerRegistry**: `grcacr202511012324`
- **AppName**: `grc-landing-page-prod`
- **Environment**: `grc-env-prod`
- **ImageTag**: `latest`

## 🔄 Update/Redeploy

To update the deployment with new changes:

```powershell
# Simply run the script again
.\deploy-azure.ps1

# Or with a new tag
.\deploy-azure.ps1 -ImageTag "v1.1.0"
```

The script automatically:
- Builds the latest code
- Pushes to ACR
- Updates the Container App with zero downtime

## 📁 Alternative: Using the Original Script

If you prefer to use the original deployment script:

```powershell
cd landing-page
.\DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1
```

## 🐳 What Gets Deployed

The Docker package includes:

- ✅ **Optimized React build** (minified, code-split)
- ✅ **Nginx web server** (lightweight, production-ready)
- ✅ **Health check endpoint** at `/health`
- ✅ **Security headers** configured
- ✅ **Gzip compression** enabled
- ✅ **SPA routing** support
- ✅ **Static asset caching** (1 year)

### Image Size
- **Total**: ~50-60 MB (Alpine-based)
- **Build time**: 2-5 minutes
- **Startup time**: < 1 second

## 🌐 Access Your Deployment

After deployment, you'll get an HTTPS URL like:
```
https://grc-landing-page-prod.xyz.azurecontainerapps.io
```

### Health Check

Verify deployment:
```powershell
# Get the URL
$url = az containerapp show `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --query properties.configuration.ingress.fqdn `
    --output tsv

# Check health
Invoke-WebRequest "https://$url/health"
```

## 📊 Container App Configuration

The deployment creates/updates a Container App with:

- **CPU**: 0.5 cores
- **Memory**: 1.0 GiB
- **Min Replicas**: 1
- **Max Replicas**: 3
- **Port**: 80
- **Ingress**: External with HTTPS
- **Auto-scaling**: Enabled

## 🔍 Monitoring & Logs

### View Logs

```powershell
az containerapp logs show `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --follow
```

### Check Status

```powershell
az containerapp show `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --query properties.runningStatus
```

### View Metrics

```powershell
az monitor metrics list `
    --resource /subscriptions/{sub-id}/resourceGroups/rg-grc-assessment-prod/providers/Microsoft.App/containerApps/grc-landing-page-prod
```

## 🛠️ Troubleshooting

### Build Fails

```powershell
# Clean Docker cache
docker builder prune -a

# Rebuild without cache
cd landing-page
docker build --no-cache -t shahin-landing:latest -f Dockerfile .
```

### Push Fails

```powershell
# Verify ACR login
az acr login --name grcacr202511012324

# Check ACR exists
az acr show --name grcacr202511012324
```

### Deployment Fails

```powershell
# Check Container App Environment exists
az containerapp env show `
    --name grc-env-prod `
    --resource-group rg-grc-assessment-prod

# Verify Resource Group
az group show --name rg-grc-assessment-prod
```

### Container Won't Start

```powershell
# Check logs
az containerapp logs show `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --tail 50

# Check events
az containerapp show `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --query properties.latestRevisionStatus
```

## 🔐 Security Features

The production build includes:

- ✅ HTTPS/SSL (automatic with Azure)
- ✅ Security headers (XSS, Frame Options, CSP)
- ✅ No debug information in production
- ✅ Content Security Policy
- ✅ Gzip compression
- ✅ Static asset caching

## 💰 Cost Optimization

The deployment is configured for cost efficiency:

- **Min replicas**: 1 (always running)
- **CPU**: 0.5 cores (sufficient for landing page)
- **Memory**: 1.0 GiB
- **Auto-scaling**: 1-3 replicas based on traffic

### Estimated Monthly Cost

- **Container App**: ~$10-15/month (basic tier)
- **Container Registry**: ~$5/month (basic tier)
- **Data transfer**: Variable (based on traffic)

## 📚 Additional Resources

- [Azure Container Apps Documentation](https://docs.microsoft.com/azure/container-apps/)
- [Azure Container Registry Documentation](https://docs.microsoft.com/azure/container-registry/)
- [Docker Setup Guide](./DOCKER_SETUP.md)

## 🆘 Support

For issues or questions:
- Check container logs
- Review build output
- Verify Azure resources exist
- Check network connectivity

---

**Last Updated**: November 2025  
**Maintained by**: DoganConsult

