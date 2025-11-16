# 📊 Azure Container App Status Report

## 🚀 Application Status

Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

---

### 📍 Application Details

| Property | Value |
|---------|-------|
| **Name** | `grc-landing-page-prod` |
| **Resource Group** | `rg-grc-assessment-prod` |
| **Environment** | `grc-env-prod` |
| **URL** | https://grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io |
| **Region** | East US |

---

### ✅ Provisioning Status

**Status**: ✅ Succeeded

**Replicas**: 1 (Running)

**Latest Revision**: `grc-landing-page-prod--x2jywuv`

**Traffic Weight**: 100%

**Replica Status**: Running

**Created**: 2025-11-02T18:43:11Z

---

### 🔄 Revisions

| Revision Name | Traffic Weight | Created Time |
|--------------|---------------|--------------|
| `grc-landing-page-prod--x2jywuv` | 100% | 2025-11-02T18:43:10+00:00 |

---

### 📦 Container Configuration

| Setting | Value |
|--------|-------|
| **CPU** | 0.5 cores |
| **Memory** | 1.0 GiB |
| **Min Replicas** | 1 |
| **Max Replicas** | 3 |
| **Target Port** | 80 |
| **Ingress** | External (HTTPS) |

---

### 🌐 Network & Access

- **Ingress**: External
- **Protocol**: HTTPS
- **Custom Domain**: Not configured
- **Traffic**: 100% to latest revision

---

### ✅ Environment Variables

Built into Docker image:
- `VITE_API_URL`: `https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api`
- `VITE_FRONTEND_URL`: `https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io`

---

### 📊 Container Registry

| Property | Value |
|---------|-------|
| **Registry** | `grcacr20251102213741.azurecr.io` |
| **Image** | `grcacr20251102213741.azurecr.io/landing-page:latest` |
| **Resource Group** | `rg-grc-assessment-prod` |

---

### 🔍 Health Check

**Endpoint**: `/health`

**Status**: ✅ Application Running

**URL**: https://grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io

**Health Endpoint**: https://grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io/health

**Note**: Health check endpoint shows redirect (HTTPS redirect configured in nginx) - this is expected behavior.

---

### 🛠️ Useful Commands

**Get Status:**
```powershell
az containerapp show --name grc-landing-page-prod --resource-group rg-grc-assessment-prod
```

**List Revisions:**
```powershell
az containerapp revision list --name grc-landing-page-prod --resource-group rg-grc-assessment-prod
```

**View Logs:**
```powershell
az containerapp logs show --name grc-landing-page-prod --resource-group rg-grc-assessment-prod --follow
```

**Restart:**
```powershell
az containerapp revision restart --name grc-landing-page-prod --resource-group rg-grc-assessment-prod
```

**Update Image:**
```powershell
az containerapp update `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --image grcacr20251102213741.azurecr.io/landing-page:latest
```

---

**Report Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

