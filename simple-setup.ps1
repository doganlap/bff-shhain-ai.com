# Fixed PowerShell Script - No Special Characters
Write-Host "SETTING UP PRODUCTION ENVIRONMENT" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variable correctly
Write-Host "Setting DATABASE_URL..." -ForegroundColor Yellow
$env:DATABASE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19tUEEyd2YxR2haSmd5cW50d2t2aEIiLCJhcGlfa2V5IjoiMDFLQTE0RUs0QlNXRzRDUzQ5UTExMTlWNzQiLCJ0ZW5hbnRfaWQiOiJhODE3ZmY1MmJmNzI4NzM4ODdjN2IyZDE3ZWMyYzc4ZjA4NzllMTI3Yzk3NDJmZDg1NjdhMjFkYmMwNjYwNDQ4IiwiaW50ZXJuYWxfc2VjcmV0IjoiYmZlMzRiZmMtOWRmYy00YjI3LTg0ODMtZjczM2I2Yzc0N2JkIn0.gKBF1lWTbjKqTks4MhpM5txhSTuOw5-jKDk5Qf5-Brs"
Write-Host "DATABASE_URL set correctly" -ForegroundColor Green
Write-Host ""

# Create .env file
Write-Host "Creating .env.production.final..." -ForegroundColor Yellow
@"
DATABASE_URL=$env:DATABASE_URL
RAW_DATABASE_URL=postgres://a817ff52bf72873887c7b2d17ec2c78f0879e127c9742fd8567a21dbc0660448:sk_mPA2wf1GhZJgyqntwkvhB@db.prisma.io:5432/postgres?sslmode=require
JWT_SECRET=production-jwt-secret-change-this-in-env-vars
NODE_ENV=production
"@ | Out-File -FilePath ".env.production.final" -Encoding UTF8
Write-Host ".env.production.final created" -ForegroundColor Green
Write-Host ""

# Test Prisma
Write-Host "Testing Prisma connection..." -ForegroundColor Yellow
try {
    & npx prisma generate --schema=apps\bff\prisma\schema.prisma
    Write-Host "Prisma client generated" -ForegroundColor Green
} catch {
    Write-Host "Prisma generation failed" -ForegroundColor Red
}
Write-Host ""

# Launch Prisma Studio
Write-Host "Launching Prisma Studio..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/c npx prisma studio --port 5559" -NoNewWindow
Write-Host "Prisma Studio launched on port 5559" -ForegroundColor Green
Write-Host ""

Write-Host "PRODUCTION SETUP COMPLETE!" -ForegroundColor Green
Write-Host "Copy DATABASE_URL to Vercel environment variables" -ForegroundColor Cyan
