# Check Vercel Deployment Status
Write-Host "🔍 Checking Vercel Deployment Status..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Get deployment info
Write-Host "📊 Deployment Information:" -ForegroundColor Yellow
vercel ls
Write-Host ""

# Check if deployment is ready
Write-Host "🌐 Production URL Check:" -ForegroundColor Yellow
$deployments = vercel ls 2>$null
$prodUrl = $deployments | Select-String "https://" | Select-Object -First 1

if ($prodUrl) {
    Write-Host "✅ Production URL found:" -ForegroundColor Green
    Write-Host "   $prodUrl" -ForegroundColor White
    Write-Host ""

    # Test health endpoint
    Write-Host "🩺 Testing Health Endpoint:" -ForegroundColor Yellow
    try {
        $healthResponse = Invoke-WebRequest -Uri "$prodUrl/api/health" -TimeoutSec 30 -ErrorAction Stop
        Write-Host "✅ Health check: $($healthResponse.StatusCode) - OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   This may take a few more minutes..." -ForegroundColor Yellow
    }

    Write-Host ""

    # Test main app
    Write-Host "🏠 Testing Main Application:" -ForegroundColor Yellow
    try {
        $appResponse = Invoke-WebRequest -Uri "$prodUrl" -TimeoutSec 30 -ErrorAction Stop
        Write-Host "✅ Main app: $($appResponse.StatusCode) - OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ Main app failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Deployment may still be in progress..." -ForegroundColor Yellow
    }

} else {
    Write-Host "❌ No production URL found yet" -ForegroundColor Red
    Write-Host "   Deployment may still be in progress..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔄 Check again in 2-3 minutes" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 Next Steps After Successful Deployment:" -ForegroundColor Green
Write-Host "1. Test all API endpoints manually" -ForegroundColor White
Write-Host "2. Verify database connections" -ForegroundColor White
Write-Host "3. Test user authentication" -ForegroundColor White
Write-Host "4. Check AI/ML features" -ForegroundColor White
Write-Host "5. Monitor performance and logs" -ForegroundColor White
Write-Host ""
Write-Host "🛠️ Useful Commands:" -ForegroundColor Cyan
Write-Host "• View logs: vercel logs" -ForegroundColor White
Write-Host "• Re-deploy: vercel --prod" -ForegroundColor White
Write-Host "• Environment: vercel env ls" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Shahin-AI is going LIVE! 🚀" -ForegroundColor Green
