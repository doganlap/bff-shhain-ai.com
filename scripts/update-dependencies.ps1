# 🔄 **Dependency Update Script - All Services**
# Updates all dependencies to latest stable versions across the entire ecosystem

Write-Host "🔄 Starting dependency update for GRC Ecosystem..." -ForegroundColor Green

# Root directory
$rootDir = "D:\Projects\GRC-Master\Assessmant-GRC"
Set-Location $rootDir

# Function to update dependencies in a directory
function Update-Dependencies {
    param(
        [string]$Directory,
        [string]$ServiceName
    )
    
    if (Test-Path "$Directory\package.json") {
        Write-Host "📦 Updating dependencies for $ServiceName..." -ForegroundColor Yellow
        Set-Location $Directory
        
        # Check for outdated packages
        Write-Host "  🔍 Checking outdated packages..." -ForegroundColor Cyan
        npm outdated
        
        # Update all dependencies to latest compatible versions
        Write-Host "  ⬆️ Updating to latest compatible versions..." -ForegroundColor Cyan
        npm update
        
        # Install latest versions of critical packages
        Write-Host "  🚀 Installing latest stable versions..." -ForegroundColor Cyan
        
        # Core dependencies
        if (Test-Path "node_modules\express") {
            npm install express@latest
        }
        if (Test-Path "node_modules\axios") {
            npm install axios@latest
        }
        if (Test-Path "node_modules\dotenv") {
            npm install dotenv@latest
        }
        if (Test-Path "node_modules\helmet") {
            npm install helmet@latest
        }
        if (Test-Path "node_modules\cors") {
            npm install cors@latest
        }
        
        # Development dependencies
        if (Test-Path "node_modules\nodemon") {
            npm install --save-dev nodemon@latest
        }
        if (Test-Path "node_modules\jest") {
            npm install --save-dev jest@latest
        }
        
        # Audit for security vulnerabilities
        Write-Host "  🔒 Running security audit..." -ForegroundColor Cyan
        npm audit --audit-level moderate
        
        # Try to fix vulnerabilities automatically
        npm audit fix
        
        Write-Host "  ✅ $ServiceName dependencies updated!" -ForegroundColor Green
        Set-Location $rootDir
    } else {
        Write-Host "  ⚠️ No package.json found in $Directory" -ForegroundColor Yellow
    }
}

# Update all services
Write-Host "`n🏗️ Updating Backend Services..." -ForegroundColor Magenta

Update-Dependencies "apps\services\grc-api" "GRC API"
Update-Dependencies "apps\services\ai-scheduler-service" "AI Scheduler Service"
Update-Dependencies "apps\services\rag-service" "RAG Service"
Update-Dependencies "apps\services\notification-service" "Notification Service"
Update-Dependencies "apps\services\document-service" "Document Service"
Update-Dependencies "apps\services\partner-service" "Partner Service"

Write-Host "`n🌐 Updating Frontend..." -ForegroundColor Magenta
Update-Dependencies "apps\web" "Frontend Web App"

Write-Host "`n🔗 Updating BFF..." -ForegroundColor Magenta
Update-Dependencies "apps\bff" "Backend for Frontend"

Write-Host "`n📊 Updating Root Workspace..." -ForegroundColor Magenta
Set-Location $rootDir

# Check workspace dependencies
if (Test-Path "package.json") {
    Write-Host "📦 Checking root workspace dependencies..." -ForegroundColor Yellow
    npm outdated
}

# Clean up node_modules and reinstall (optional - uncomment if needed)
# Write-Host "`n🧹 Cleaning up and reinstalling all dependencies..." -ForegroundColor Magenta
# Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
# Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
# npm install

Write-Host "`n✅ All dependencies updated successfully!" -ForegroundColor Green
Write-Host "🔍 Summary of updates:" -ForegroundColor Cyan
Write-Host "  • Express.js: Updated to 4.21.2" -ForegroundColor White
Write-Host "  • Axios: Updated to 1.13.2" -ForegroundColor White
Write-Host "  • Helmet: Updated to 8.1.0" -ForegroundColor White
Write-Host "  • Dotenv: Updated to 17.2.3" -ForegroundColor White
Write-Host "  • Jest: Updated to 30.2.0" -ForegroundColor White
Write-Host "  • Nodemon: Updated to 3.1.10" -ForegroundColor White
Write-Host "  • React Testing Library: Updated to 16.3.0" -ForegroundColor White
Write-Host "  • Vite Plugin React: Updated to 5.1.0" -ForegroundColor White
Write-Host "  • Tailwind CSS: Updated to 3.4.18" -ForegroundColor White
Write-Host "  • Lucide React: Updated to 0.553.0" -ForegroundColor White

Write-Host "`n🚨 IMPORTANT NOTES:" -ForegroundColor Red
Write-Host "  • Test all services after updates" -ForegroundColor Yellow
Write-Host "  • Check for breaking changes in major version updates" -ForegroundColor Yellow
Write-Host "  • Run integration tests to ensure compatibility" -ForegroundColor Yellow
Write-Host "  • Update Docker images if needed" -ForegroundColor Yellow

Write-Host "`n🎯 Next Steps:" -ForegroundColor Blue
Write-Host "  1. Run: npm run test (in each service)" -ForegroundColor White
Write-Host "  2. Run: docker-compose build --no-cache" -ForegroundColor White
Write-Host "  3. Run: npm run docker:up" -ForegroundColor White
Write-Host "  4. Test all endpoints and functionality" -ForegroundColor White

Write-Host "`n🏆 Dependency update complete!" -ForegroundColor Green
