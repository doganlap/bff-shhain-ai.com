# GRC Assessment System - Quick Start Script (PowerShell)
# This script helps you get started with the improved GRC system

$ErrorActionPreference = "Stop"

Write-Host "🚀 GRC Assessment System - Quick Start" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
function Check-EnvFile {
    Write-Host "📋 Checking environment configuration..." -ForegroundColor Yellow
    
    if (-not (Test-Path "apps\bff\.env")) {
        Write-Host "⚠️  .env file not found in apps\bff\" -ForegroundColor Yellow
        Write-Host "Creating from template..."
        
        if (Test-Path "apps\bff\.env.example") {
            Copy-Item "apps\bff\.env.example" "apps\bff\.env"
            Write-Host "✅ Created .env file" -ForegroundColor Green
            Write-Host "⚠️  IMPORTANT: Edit apps\bff\.env and set your secrets!" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Generate secrets with:"
            Write-Host '  node -e "console.log(require(' -NoNewline
            Write-Host "'" -NoNewline
            Write-Host 'crypto' -NoNewline
            Write-Host "'" -NoNewline
            Write-Host ').randomBytes(64).toString(' -NoNewline
            Write-Host "'" -NoNewline
            Write-Host 'hex' -NoNewline
            Write-Host "'" -NoNewline
            Write-Host '))"'
            Write-Host ""
            Read-Host "Press Enter when you've configured .env..."
        } else {
            Write-Host "❌ .env.example not found!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ .env file found" -ForegroundColor Green
    }
    
    # Check if JWT_SECRET is set
    $envContent = Get-Content "apps\bff\.env" -Raw
    if ($envContent -match "your-secure-jwt-secret-here") {
        Write-Host "⚠️  Default JWT_SECRET detected! Please update your .env file." -ForegroundColor Yellow
        exit 1
    }
}

# Check Docker
function Check-Docker {
    Write-Host ""
    Write-Host "🐳 Checking Docker..." -ForegroundColor Yellow
    
    try {
        $dockerVersion = docker --version 2>$null
        if (-not $?) {
            throw "Docker not found"
        }
        
        docker info 2>&1 | Out-Null
        if (-not $?) {
            Write-Host "❌ Docker daemon not running! Please start Docker Desktop." -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Docker is running" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker not found! Please install Docker Desktop first." -ForegroundColor Red
        exit 1
    }
}

# Check Node.js
function Check-Node {
    Write-Host ""
    Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
    
    try {
        $nodeVersion = node --version 2>$null
        if (-not $?) {
            throw "Node.js not found"
        }
        
        $version = $nodeVersion -replace 'v', '' -split '\.' | Select-Object -First 1
        if ([int]$version -lt 18) {
            Write-Host "⚠️  Node.js version $nodeVersion detected. Version 18+ recommended." -ForegroundColor Yellow
        } else {
            Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Node.js not found! Please install Node.js 18+" -ForegroundColor Red
        exit 1
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Host ""
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    
    # Root dependencies
    if (Test-Path "package.json") {
        Write-Host "Installing root dependencies..."
        npm install
    }
    
    # BFF dependencies
    if (Test-Path "apps\bff\package.json") {
        Write-Host "Installing BFF dependencies..."
        Push-Location apps\bff
        npm install
        Pop-Location
    }
    
    # Web dependencies
    if (Test-Path "apps\web\package.json") {
        Write-Host "Installing Web dependencies..."
        Push-Location apps\web
        npm install
        Pop-Location
    }
    
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

# Health check
function Test-Health {
    Write-Host ""
    Write-Host "🏥 Running health check..." -ForegroundColor Yellow
    
    # Wait for services to start
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3005/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ BFF is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  BFF health check failed (might still be starting...)" -ForegroundColor Yellow
    }
}

# Start with Docker
function Start-Docker {
    Write-Host ""
    Write-Host "🐳 Starting with Docker..." -ForegroundColor Cyan
    
    # Find docker-compose file
    $composeFile = ""
    if (Test-Path "infra\docker\docker-compose.yml") {
        $composeFile = "infra\docker\docker-compose.yml"
    } elseif (Test-Path "docker-compose.yml") {
        $composeFile = "docker-compose.yml"
    } else {
        Write-Host "❌ docker-compose.yml not found!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Using compose file: $composeFile"
    Write-Host ""
    
    # Start services
    docker-compose -f $composeFile up -d
    
    Write-Host ""
    Write-Host "✅ Services started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access points:" -ForegroundColor Cyan
    Write-Host "  📱 Frontend:    http://localhost:5173"
    Write-Host "  🔧 BFF API:     http://localhost:3005"
    Write-Host "  🏥 Health:      http://localhost:3005/health"
    Write-Host "  📊 Monitoring:  http://localhost:3005/health/detailed"
    Write-Host ""
    Write-Host "To view logs:"
    Write-Host "  docker-compose -f $composeFile logs -f"
    Write-Host ""
    Write-Host "To stop services:"
    Write-Host "  docker-compose -f $composeFile down"
    
    Test-Health
}

# Start locally
function Start-Local {
    Write-Host ""
    Write-Host "💻 Starting development servers locally..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This will start:"
    Write-Host "  - BFF (Backend for Frontend) on port 3005"
    Write-Host "  - Web frontend on port 5173"
    Write-Host ""
    Write-Host "Make sure PostgreSQL is running and configured!"
    Write-Host ""
    
    # Start BFF
    Write-Host "Starting BFF..."
    $bffJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        Set-Location apps\bff
        npm run dev
    }
    
    # Start Web
    Write-Host "Starting Web..."
    $webJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        Set-Location apps\web
        npm run dev
    }
    
    Write-Host ""
    Write-Host "✅ Services starting..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Job IDs: BFF=$($bffJob.Id), WEB=$($webJob.Id)"
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all services"
    Write-Host ""
    
    # Wait for user interrupt
    try {
        while ($true) {
            Start-Sleep -Seconds 1
            
            # Check if jobs are still running
            if ($bffJob.State -eq 'Failed') {
                Write-Host "❌ BFF job failed!" -ForegroundColor Red
                break
            }
            if ($webJob.State -eq 'Failed') {
                Write-Host "❌ Web job failed!" -ForegroundColor Red
                break
            }
        }
    } finally {
        Write-Host "Stopping services..."
        Stop-Job -Job $bffJob, $webJob
        Remove-Job -Job $bffJob, $webJob -Force
        Write-Host "Services stopped" -ForegroundColor Yellow
    }
}

# Health check only
function Show-HealthCheck {
    Write-Host ""
    Write-Host "🏥 Running comprehensive health checks..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check BFF
    Write-Host "Checking BFF..."
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3005/health" -Method Get
        Write-Host ($response | ConvertTo-Json -Depth 10)
        Write-Host "✅ BFF is healthy" -ForegroundColor Green
    } catch {
        Write-Host "❌ BFF is not responding" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Checking all services..."
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3005/health/detailed" -Method Get
        Write-Host ($response | ConvertTo-Json -Depth 10)
        Write-Host "✅ Detailed health check complete" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Some services may be unavailable" -ForegroundColor Yellow
    }
}

# Main menu
function Show-MainMenu {
    Write-Host ""
    Write-Host "Choose an option:" -ForegroundColor Cyan
    Write-Host "1) Start with Docker (recommended)"
    Write-Host "2) Start development servers locally"
    Write-Host "3) Run health checks only"
    Write-Host "4) Install dependencies"
    Write-Host "5) View documentation"
    Write-Host "6) Exit"
    Write-Host ""
    
    $choice = Read-Host "Enter your choice [1-6]"
    
    switch ($choice) {
        "1" { Start-Docker; Show-MainMenu }
        "2" { Start-Local; Show-MainMenu }
        "3" { Show-HealthCheck; Show-MainMenu }
        "4" { Install-Dependencies; Show-MainMenu }
        "5" { 
            Write-Host ""
            Write-Host "📚 Documentation files:" -ForegroundColor Cyan
            Write-Host "  - README.md"
            Write-Host "  - IMPROVEMENTS.md"
            Write-Host "  - PRODUCTION_READINESS_CHECKLIST.md"
            Write-Host ""
            Show-MainMenu
        }
        "6" { 
            Write-Host "Goodbye! 👋" -ForegroundColor Cyan
            exit 0
        }
        default { 
            Write-Host "Invalid option!" -ForegroundColor Red
            Show-MainMenu
        }
    }
}

# Main execution
Write-Host "Running pre-flight checks..." -ForegroundColor Yellow
Check-EnvFile
Check-Docker
Check-Node

Write-Host ""
Write-Host "✅ All pre-flight checks passed!" -ForegroundColor Green

Show-MainMenu
