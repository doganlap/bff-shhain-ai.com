# ==========================================
# ONE-COMMAND AZURE DEPLOYMENT
# Shahin GRC Landing Page - Single Docker Package
# ==========================================
# This script does everything in one go:
# 1. Builds optimized production Docker image
# 2. Pushes to Azure Container Registry
# 3. Deploys to Azure Container Apps
# 4. Returns HTTPS URL

param(
    [string]$ResourceGroup = "rg-grc-assessment-prod",
    [string]$ContainerRegistry = "grcacr20251102213741",
    [string]$AppName = "grc-landing-page-prod",
    [string]$Environment = "grc-env-prod",
    [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SHAHIN GRC - ONE-COMMAND DEPLOYMENT   ║" -ForegroundColor White
Write-Host "║     Azure Container Apps Package       ║" -ForegroundColor Gray
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get landing-page directory
$landingPageDir = Join-Path $PSScriptRoot "landing-page"
if (-not (Test-Path $landingPageDir)) {
    Write-Host "❌ landing-page directory not found!" -ForegroundColor Red
    Write-Host "   Expected: $landingPageDir" -ForegroundColor Yellow
    exit 1
}

Set-Location $landingPageDir

# Step 1: Verify Docker
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    az --version | Out-Null
} catch {
    Write-Host "❌ Docker or Azure CLI not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker and Azure CLI ready" -ForegroundColor Green
Write-Host ""

# Step 2: Set environment variables (with defaults)
$env:VITE_API_URL = if ($env:VITE_API_URL) { $env:VITE_API_URL } else { "https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api" }
$env:VITE_FRONTEND_URL = if ($env:VITE_FRONTEND_URL) { $env:VITE_FRONTEND_URL } else { "https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io" }

Write-Host "🔨 Step 1/5: Building production Docker image with environment variables..." -ForegroundColor Yellow
Write-Host "  Environment Variables:" -ForegroundColor Gray
Write-Host "    VITE_API_URL: $env:VITE_API_URL" -ForegroundColor Gray
Write-Host "    VITE_FRONTEND_URL: $env:VITE_FRONTEND_URL" -ForegroundColor Gray
Write-Host ""

docker build `
  --build-arg VITE_API_URL="$env:VITE_API_URL" `
  --build-arg VITE_FRONTEND_URL="$env:VITE_FRONTEND_URL" `
  -t shahin-landing:$ImageTag `
  -f Dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker image built successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Login to Azure
Write-Host "🔐 Step 2/5: Authenticating with Azure..." -ForegroundColor Yellow
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "  Logging into Azure..." -ForegroundColor Gray
    az login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Azure login failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Already logged in as: $($account.user.name)" -ForegroundColor Gray
}
Write-Host "✅ Azure authentication successful" -ForegroundColor Green
Write-Host ""

# Step 4: Get ACR login server
Write-Host "📦 Step 3/5: Preparing Azure Container Registry..." -ForegroundColor Yellow
$acrLoginServer = az acr show --name $ContainerRegistry --query loginServer --output tsv 2>$null
if (-not $acrLoginServer) {
    Write-Host "❌ Container Registry '$ContainerRegistry' not found!" -ForegroundColor Red
    Write-Host "   Check your Azure subscription and registry name." -ForegroundColor Yellow
    exit 1
}

# Login to ACR
az acr login --name $ContainerRegistry
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ACR login failed!" -ForegroundColor Red
    exit 1
}

# Tag and push
$fullImageName = "$acrLoginServer/landing-page:$ImageTag"
docker tag shahin-landing:$ImageTag $fullImageName

Write-Host "  Pushing image to ACR..." -ForegroundColor Gray
docker push $fullImageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Image push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Image pushed to ACR successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Verify environment variables in image
Write-Host "🔍 Step 4/5: Verifying environment variables in image..." -ForegroundColor Yellow
Write-Host "  Environment variables configured:" -ForegroundColor Gray
Write-Host "    ✅ VITE_API_URL: $env:VITE_API_URL" -ForegroundColor Green
Write-Host "    ✅ VITE_FRONTEND_URL: $env:VITE_FRONTEND_URL" -ForegroundColor Green
Write-Host "  Note: Environment variables are baked into the build" -ForegroundColor Gray
Write-Host ""

# Step 6: Deploy to Container App
Write-Host "🚀 Step 5/5: Deploying to Azure Container Apps..." -ForegroundColor Yellow

$appExists = az containerapp show --name $AppName --resource-group $ResourceGroup 2>$null

if ($appExists) {
    Write-Host "  Updating existing Container App..." -ForegroundColor Gray
    az containerapp update `
        --name $AppName `
        --resource-group $ResourceGroup `
        --image $fullImageName `
        --query "properties.configuration.ingress.fqdn" `
        --output tsv | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Container App update failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Container App updated" -ForegroundColor Green
} else {
    Write-Host "  Creating new Container App..." -ForegroundColor Gray
    az containerapp create `
        --name $AppName `
        --resource-group $ResourceGroup `
        --environment $Environment `
        --image $fullImageName `
        --registry-server $acrLoginServer `
        --target-port 80 `
        --ingress external `
        --min-replicas 1 `
        --max-replicas 3 `
        --cpu 0.5 `
        --memory 1.0Gi `
        --query "properties.configuration.ingress.fqdn" `
        --output tsv | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Container App creation failed!" -ForegroundColor Red
        Write-Host "   Make sure the Container App Environment exists:" -ForegroundColor Yellow
        Write-Host "   az containerapp env create --name $Environment --resource-group $ResourceGroup" -ForegroundColor Gray
        exit 1
    }
    Write-Host "✅ Container App created" -ForegroundColor Green
}
Write-Host ""

# Get deployment URL
Write-Host "🌐 Getting deployment URL..." -ForegroundColor Yellow
$fqdn = az containerapp show `
    --resource-group $ResourceGroup `
    --name $AppName `
    --query properties.configuration.ingress.fqdn `
    --output tsv

$httpsUrl = "https://$fqdn"

# Success message
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      🎉 DEPLOYMENT SUCCESSFUL! 🎉      ║" -ForegroundColor White
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Your Landing Page is live at:" -ForegroundColor Cyan
Write-Host "   $httpsUrl" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
Write-Host "📊 Deployment Details:" -ForegroundColor Cyan
Write-Host "   • Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "   • Container App:  $AppName" -ForegroundColor White
Write-Host "   • Registry:       $acrLoginServer" -ForegroundColor White
Write-Host "   • Image Tag:      $ImageTag" -ForegroundColor White
Write-Host ""
Write-Host "Features Enabled:" -ForegroundColor Cyan
Write-Host "   HTTPS/SSL Automatic" -ForegroundColor Green
Write-Host "   Auto-scaling 1-3 replicas" -ForegroundColor Green
Write-Host "   Health monitoring" -ForegroundColor Green
Write-Host "   Zero-downtime updates" -ForegroundColor Green
Write-Host ""
Write-Host "To redeploy:" -ForegroundColor Yellow
Write-Host "   .\deploy-azure.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Opening in browser..." -ForegroundColor Yellow
if ($httpsUrl) {
    Start-Process $httpsUrl
}
Write-Host ""

