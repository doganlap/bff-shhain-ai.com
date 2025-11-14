# Complete AI Ecosystem - Rebuild and Run (PowerShell)
# Advanced version with progress tracking and error handling

$ErrorActionPreference = "Continue"

function Write-Header {
    param([string]$Text)
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $($Text.PadRight(60)) ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Text)
    Write-Host "→ $Text" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor Red
}

Clear-Host
Write-Header "COMPLETE AI ECOSYSTEM - REBUILD AND RUN"

$totalSteps = 10
$currentStep = 0

function Show-Progress {
    param([string]$Status)
    $script:currentStep++
    $percent = [math]::Round(($script:currentStep / $totalSteps) * 100)
    Write-Progress -Activity "Rebuilding AI Ecosystem" -Status $Status -PercentComplete $percent
}

# ============================================
# AI TRAINING PLATFORM
# ============================================
Write-Header "REBUILDING AI TRAINING PLATFORM"

Set-Location D:\LLM\ai_training_platform

# Backend Setup
Show-Progress "Setting up Python environment..."
Write-Step "Cleaning old virtual environment..."
if (Test-Path "venv") {
    Remove-Item -Recurse -Force venv -ErrorAction SilentlyContinue
}

Write-Step "Creating new virtual environment..."
python -m venv venv
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create virtual environment"
    pause
    exit 1
}

Write-Step "Activating virtual environment..."
& .\venv\Scripts\Activate.ps1

Show-Progress "Installing Python dependencies..."
Write-Step "Upgrading pip..."
python -m pip install --upgrade pip --quiet

Write-Step "Installing requirements..."
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install Python dependencies"
    pause
    exit 1
}
Write-Success "Python dependencies installed"

Show-Progress "Setting up project structure..."
Write-Step "Creating directories..."
python -c "from config import create_directories; create_directories()" 2>$null

Write-Step "Creating sample datasets..."
python -c "from train import AgentTrainer; AgentTrainer('coding').create_sample_dataset(); AgentTrainer('accounting').create_sample_dataset()" 2>$null

Write-Success "Backend setup complete"

# Frontend Setup
Show-Progress "Setting up frontend..."
Set-Location frontend

Write-Step "Cleaning old node_modules..."
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item package-lock.json -ErrorAction SilentlyContinue
}

Write-Step "Installing Node.js dependencies (this may take 2-3 minutes)..."
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install Node dependencies"
    Set-Location ..
    pause
    exit 1
}
Write-Success "Frontend dependencies installed"

Set-Location ..
Write-Success "AI Training Platform rebuilt successfully!`n"

# ============================================
# AGENT FACTORY
# ============================================
Write-Header "REBUILDING AGENT FACTORY"

Set-Location D:\LLM\agent_factory_project

Show-Progress "Setting up Agent Factory backend..."
Write-Step "Installing Python dependencies..."
pip install Flask Flask-CORS Flask-SQLAlchemy --quiet

Write-Step "Checking database..."
if (-not (Test-Path "database\enterprise_complete.db")) {
    Write-Step "Creating database..."
    python backend\create_agent_factory_tables.py 2>$null
}
Write-Success "Backend setup complete"

Show-Progress "Setting up Agent Factory frontend..."
Set-Location frontend

Write-Step "Cleaning old node_modules..."
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item package-lock.json -ErrorAction SilentlyContinue
}

Write-Step "Installing Node.js dependencies..."
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install Node dependencies"
    Set-Location ..\..
    pause
    exit 1
}
Write-Success "Frontend dependencies installed"

Set-Location ..\..
Write-Success "Agent Factory rebuilt successfully!`n"

Write-Progress -Activity "Rebuilding AI Ecosystem" -Completed

# ============================================
# START SERVICES
# ============================================
Write-Header "REBUILD COMPLETE - READY TO START"

Write-Host @"
Both platforms have been rebuilt successfully!

Select which system to start:

  [1] AI Training Platform (Ports 8000 + 3001)
  [2] Agent Factory (Ports 5000 + 3000)
  [3] BOTH SYSTEMS (All ports)
  [4] Just rebuild (don't start anything)
  [0] Exit

"@ -ForegroundColor White

$choice = Read-Host "Enter choice (0-4)"

if ($choice -eq "0" -or $choice -eq "4") {
    Write-Host "`nExiting..." -ForegroundColor Yellow
    exit 0
}

Write-Host "`n" -NoNewline
Write-Header "STARTING SERVICES"

switch ($choice) {
    "1" {
        Write-Host "Starting AI Training Platform...`n" -ForegroundColor Green
        
        Set-Location D:\LLM\ai_training_platform
        
        Write-Step "Starting backend (port 8000)..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", 
            "cd '$PWD'; `$host.UI.RawUI.WindowTitle = 'AI Training Backend'; .\venv\Scripts\Activate.ps1; Write-Host '✓ Backend Ready' -ForegroundColor Green; python server.py"
        
        Start-Sleep -Seconds 5
        
        Write-Step "Starting frontend (port 3001)..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", 
            "cd '$PWD\frontend'; `$host.UI.RawUI.WindowTitle = 'AI Training Frontend'; Write-Host '✓ Frontend Ready' -ForegroundColor Green; npm run dev"
        
        Write-Success "AI Training Platform started!`n"
        Write-Host "Access at:" -ForegroundColor Cyan
        Write-Host "  Backend:   http://localhost:8000" -ForegroundColor White
        Write-Host "  Dashboard: http://localhost:3001/dashboard" -ForegroundColor White
        Write-Host "  API Docs:  http://localhost:8000/docs`n" -ForegroundColor White
        
        Start-Sleep -Seconds 10
        Start-Process "http://localhost:3001/dashboard"
    }
    
    "2" {
        Write-Host "Starting Agent Factory...`n" -ForegroundColor Green
        
        Set-Location D:\LLM\agent_factory_project
        
        Write-Step "Starting backend (port 5000)..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", 
            "cd '$PWD'; `$host.UI.RawUI.WindowTitle = 'Agent Factory Backend'; Write-Host '✓ Backend Ready' -ForegroundColor Green; python COMPLETE_API_SERVER_ALL_ROUTES.py"
        
        Start-Sleep -Seconds 5
        
        Write-Step "Starting frontend (port 3000)..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", 
            "cd '$PWD\frontend'; `$host.UI.RawUI.WindowTitle = 'Agent Factory Frontend'; Write-Host '✓ Frontend Ready' -ForegroundColor Green; npm start"
        
        Write-Success "Agent Factory started!`n"
        Write-Host "Access at:" -ForegroundColor Cyan
        Write-Host "  Backend: http://localhost:5000" -ForegroundColor White
        Write-Host "  UI:      http://localhost:3000/agent-factory`n" -ForegroundColor White
        
        Start-Sleep -Seconds 12
        Start-Process "http://localhost:3000/agent-factory"
    }
    
    "3" {
        Write-Host "Starting BOTH systems...`n" -ForegroundColor Green
        
        # AI Training Platform
        Write-Step "[1/4] Starting AI Training Backend..."
        Set-Location D:\LLM\ai_training_platform
        Start-Process powershell -ArgumentList "-NoExit", "-Command", 
            "cd '$PWD'; `$host.UI.RawUI.WindowTitle = 'AI Training Backend (8000)'; .\venv\Scripts\Activate.ps1; Write-Host '✓ AI Training Backend Ready' -ForegroundColor Green; python server.py"
        Start-Sleep -Seconds 3
        
        Write-Step "[2/4] Starting AI Training Frontend..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", 
            "cd '$PWD\frontend'; `$host.UI.RawUI.WindowTitle = 'AI Training Frontend (3001)'; Write-Host '✓ AI Training Frontend Ready' -ForegroundColor Green; npm run dev"
        Start-Sleep -Seconds 3
        
        # Agent Factory
        Write-Step "[3/4] Starting Agent Factory Backend..."
        Set-Location D:\LLM\agent_factory_project
        Start-Process powershell -ArgumentList "-NoExit", "-Command", 
            "cd '$PWD'; `$host.UI.RawUI.WindowTitle = 'Agent Factory Backend (5000)'; Write-Host '✓ Agent Factory Backend Ready' -ForegroundColor Green; python COMPLETE_API_SERVER_ALL_ROUTES.py"
        Start-Sleep -Seconds 3
        
        Write-Step "[4/4] Starting Agent Factory Frontend..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", 
            "cd '$PWD\frontend'; `$host.UI.RawUI.WindowTitle = 'Agent Factory Frontend (3000)'; Write-Host '✓ Agent Factory Frontend Ready' -ForegroundColor Green; npm start"
        
        Write-Success "All services started!`n"
        
        Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
        Write-Host "║                  ALL SYSTEMS RUNNING                         ║" -ForegroundColor Cyan
        Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
        
        Write-Host "AI Training Platform:" -ForegroundColor Yellow
        Write-Host "  Backend:   http://localhost:8000" -ForegroundColor White
        Write-Host "  Dashboard: http://localhost:3001/dashboard" -ForegroundColor White
        Write-Host "  API Docs:  http://localhost:8000/docs`n" -ForegroundColor White
        
        Write-Host "Agent Factory:" -ForegroundColor Yellow
        Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White
        Write-Host "  UI:        http://localhost:3000/agent-factory`n" -ForegroundColor White
        
        Write-Host "Opening dashboards in 15 seconds..." -ForegroundColor Cyan
        Start-Sleep -Seconds 15
        
        Start-Process "http://localhost:3001/dashboard"
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:3000/agent-factory"
    }
    
    default {
        Write-Error "Invalid choice!"
        pause
        exit 1
    }
}

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ALL DONE!                                 ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`nServices are running in separate windows." -ForegroundColor White
Write-Host "Close those windows to stop the services.`n" -ForegroundColor White

Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
