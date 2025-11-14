# Production Database Migration Script
Write-Host "🚀 Creating Production Databases on Vercel..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Create databases
Write-Host "📊 Creating 4 Vercel Postgres Databases..." -ForegroundColor Yellow
Write-Host ""

# Vector Database
Write-Host "1. Creating Vector Database (AI/ML)..." -ForegroundColor White
try {
    $vectorDb = vercel postgres create shahin-vector-db --yes 2>&1
    Write-Host "✅ Vector DB created successfully" -ForegroundColor Green
    Write-Host "   $vectorDb" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create Vector DB: $_" -ForegroundColor Red
}

Write-Host ""

# Compliance Database
Write-Host "2. Creating Compliance Database (GRC)..." -ForegroundColor White
try {
    $complianceDb = vercel postgres create shahin-compliance-db --yes 2>&1
    Write-Host "✅ Compliance DB created successfully" -ForegroundColor Green
    Write-Host "   $complianceDb" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create Compliance DB: $_" -ForegroundColor Red
}

Write-Host ""

# Main Application Database
Write-Host "3. Creating Main Application Database..." -ForegroundColor White
try {
    $mainDb = vercel postgres create shahin-main-db --yes 2>&1
    Write-Host "✅ Main App DB created successfully" -ForegroundColor Green
    Write-Host "   $mainDb" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create Main DB: $_" -ForegroundColor Red
}

Write-Host ""

# Controls Database
Write-Host "4. Creating Enterprise Controls Database..." -ForegroundColor White
try {
    $controlsDb = vercel postgres create shahin-controls-db --yes 2>&1
    Write-Host "✅ Controls DB created successfully" -ForegroundColor Green
    Write-Host "   $controlsDb" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create Controls DB: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Get database connection strings:" -ForegroundColor White
Write-Host "   vercel postgres ls" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "   VECTOR_DATABASE_URL=postgresql://..." -ForegroundColor Gray
Write-Host "   DATABASE_URL=postgresql://..." -ForegroundColor Gray
Write-Host "   SHAHIN_COMPLIANCE_URL=postgresql://..." -ForegroundColor Gray
Write-Host "   CONTROLS_DATABASE_URL=postgresql://..." -ForegroundColor Gray
Write-Host ""
Write-Host "3. Run Prisma migrations" -ForegroundColor White
Write-Host "   npx prisma db push --schema=apps/bff/prisma/schema_vector.prisma" -ForegroundColor Gray
Write-Host "   npx prisma db push --schema=apps/bff/prisma/schema_shahin_compliance.prisma" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy to Vercel" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Production databases created!" -ForegroundColor Green
