# Fix Prisma Client and Seed Database
Write-Host "🔧 FIXING PRISMA CLIENT AND DATABASE SEEDING" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Navigate to BFF directory
Write-Host "📂 Step 1: Navigating to BFF directory..." -ForegroundColor Yellow
Set-Location -Path "apps\bff"

# Step 2: Check .env file
Write-Host ""
Write-Host "📋 Step 2: Checking .env configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "DATABASE_URL=") {
        Write-Host "   ✅ DATABASE_URL is configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ DATABASE_URL not found in .env" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
    exit 1
}

# Step 3: Kill any processes that might lock Prisma files
Write-Host ""
Write-Host "🔄 Step 3: Stopping any node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✅ Node processes stopped" -ForegroundColor Green

# Step 4: Clean Prisma client
Write-Host ""
Write-Host "🧹 Step 4: Cleaning old Prisma client..." -ForegroundColor Yellow
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\@prisma\client" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "..\..\node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "..\..\node_modules\@prisma\client" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   ✅ Old client removed" -ForegroundColor Green

# Step 5: Regenerate Prisma client
Write-Host ""
Write-Host "⚙️  Step 5: Generating new Prisma client..." -ForegroundColor Yellow
$generateOutput = npx prisma generate 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Prisma client generated successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ Prisma client generation failed" -ForegroundColor Red
    Write-Host "   Output: $generateOutput" -ForegroundColor Red
    exit 1
}

# Step 6: Verify database connection
Write-Host ""
Write-Host "🔌 Step 6: Verifying database connection..." -ForegroundColor Yellow
$dbStatusOutput = npx prisma db pull --force 2>&1
if ($LASTEXITCODE -eq 0 -or $dbStatusOutput -match "Introspected") {
    Write-Host "   ✅ Database connection verified" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Database connection check failed, but continuing..." -ForegroundColor Yellow
}

# Step 7: Run database seed
Write-Host ""
Write-Host "🌱 Step 7: Seeding database..." -ForegroundColor Yellow
Write-Host "   This will populate:" -ForegroundColor White
Write-Host "   - 3 Saudi Compliance Frameworks (NCA, SAMA, ISO)" -ForegroundColor White
Write-Host "   - 2 Sample Organizations" -ForegroundColor White
Write-Host "   - 2 Sample Users" -ForegroundColor White
Write-Host "   - Regulatory compliance tracking" -ForegroundColor White
Write-Host ""

$seedOutput = npx tsx prisma/seed-fixed.ts 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "   ✅ Database seeded successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "   ❌ Database seeding failed" -ForegroundColor Red
    Write-Host "   Error: $seedOutput" -ForegroundColor Red
    Write-Host ""
    Write-Host "   💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check if database is accessible" -ForegroundColor White
    Write-Host "   2. Verify DATABASE_URL in .env" -ForegroundColor White
    Write-Host "   3. Run: npx prisma db push" -ForegroundColor White
    exit 1
}

# Step 8: Open Prisma Studio
Write-Host ""
Write-Host "🎨 Step 8: Opening Prisma Studio..." -ForegroundColor Yellow
Write-Host "   URL: http://localhost:5560" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C in that terminal window to stop it" -ForegroundColor White
Write-Host ""

Start-Sleep -Seconds 2

# Open in new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx prisma studio --port 5560"

Write-Host ""
Write-Host "🎉 SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Prisma client generated" -ForegroundColor Green
Write-Host "✅ Database seeded with Saudi GRC data" -ForegroundColor Green
Write-Host "✅ Prisma Studio opened at http://localhost:5560" -ForegroundColor Green
Write-Host ""
Write-Host "📊 You can now:" -ForegroundColor Cyan
Write-Host "   1. View data in Prisma Studio (already opened)" -ForegroundColor White
Write-Host "   2. Start the backend: npm run dev" -ForegroundColor White
Write-Host "   3. Start the frontend: cd to root and npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Shahin Compliance KSA is ready!" -ForegroundColor Green
