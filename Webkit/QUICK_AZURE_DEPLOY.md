# 🚀 Quick Azure Deployment

## One-Command Deploy

```powershell
.\deploy-azure.ps1
```

That's it! Your app will be deployed to Azure Container Apps with HTTPS.

## 📋 What It Does

1. ✅ Builds optimized Docker image
2. ✅ Pushes to Azure Container Registry
3. ✅ Deploys to Container Apps
4. ✅ Returns HTTPS URL

## 🔧 Customize (Optional)

```powershell
.\deploy-azure.ps1 `
    -ResourceGroup "my-rg" `
    -ContainerRegistry "myacr" `
    -AppName "my-app" `
    -ImageTag "v1.0.0"
```

## 🔄 Update Deployment

Just run the same command again:
```powershell
.\deploy-azure.ps1
```

## 📍 Default Configuration

- **Resource Group**: `rg-grc-assessment-prod`
- **Container Registry**: `grcacr202511012324`
- **App Name**: `grc-landing-page-prod`
- **Environment**: `grc-env-prod`

## 🌐 Get Your URL

The script will show your HTTPS URL automatically. Or get it manually:

```powershell
az containerapp show `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --query properties.configuration.ingress.fqdn `
    --output tsv
```

## 🐛 Quick Fixes

**Build fails?**
```powershell
docker builder prune -a
```

**Push fails?**
```powershell
az acr login --name grcacr202511012324
```

**View logs?**
```powershell
az containerapp logs show `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --follow
```

For detailed documentation, see `AZURE_DEPLOYMENT.md`

