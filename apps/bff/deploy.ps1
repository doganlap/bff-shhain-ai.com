# Shahin BFF Deployment Script for Windows
# This script handles the complete deployment process for the BFF service

param(
    [string]$Environment = "production",
    [string]$Action = "deploy"
)

# Configuration
$ComposeFile = "docker-compose.yml"
$BackupDir = "./backups"
$LogFile = "./logs/deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Create necessary directories
function Create-Directories {
    Write-Host "Creating necessary directories..." -ForegroundColor Green
    New-Item -ItemType Directory -Force -Path "logs" | Out-Null
    New-Item -ItemType Directory -Force -Path "backups" | Out-Null
    New-Item -ItemType Directory -Force -Path "uploads" | Out-Null
    New-Item -ItemType Directory -Force -Path "ssl" | Out-Null
    Write-Host "Directories created" -ForegroundColor Green
}

# Check prerequisites
function Check-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Green
    
    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ Docker is not installed or not in PATH" -ForegroundColor Red
        exit 1
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version
        Write-Host "✓ Docker Compose found: $composeVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ Docker Compose is not installed or not in PATH" -ForegroundColor Red
        exit 1
    }
    
    # Check environment file
    $envFile = ".env.$Environment"
    if (-not (Test-Path $envFile)) {
        Write-Host "⚠ Environment file $envFile not found, using .env.production.example as template" -ForegroundColor Yellow
        Copy-Item ".env.production.example" ".env.production"
        Write-Host "⚠ Please edit .env.production with your actual values before continuing" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Prerequisites check completed" -ForegroundColor Green
}

# Generate SSL certificates (self-signed for development)
function Generate-SSLCerts {
    if ($Environment -eq "development") {
        Write-Host "Generating self-signed SSL certificates for development..." -ForegroundColor Green
        try {
            & openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem `
                -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
            Write-Host "SSL certificates generated" -ForegroundColor Green
        } catch {
            Write-Host "⚠ OpenSSL not found, skipping SSL certificate generation" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Production SSL certificates should be obtained from a CA like Let's Encrypt" -ForegroundColor Yellow
        if (-not (Test-Path "ssl/cert.pem") -or -not (Test-Path "ssl/key.pem")) {
            Write-Host "⚠ SSL certificates not found in ssl/ directory" -ForegroundColor Yellow
        }
    }
}

# Backup existing data
function Backup-Data {
    Write-Host "Creating backup of existing data..." -ForegroundColor Green
    
    # Create backup directory
    $backupName = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Force -Path "$BackupDir/$backupName" | Out-Null
    
    # Check if PostgreSQL is running and backup database
    try {
        $postgresStatus = docker-compose ps postgres
        if ($postgresStatus -match "Up") {
            Write-Host "Backing up database..." -ForegroundColor Green
            docker-compose exec -T postgres pg_dump -U shahin_local shahin_grc_prod > "$BackupDir/$backupName/database.sql"
        }
    } catch {
        Write-Host "⚠ Could not backup database (PostgreSQL might not be running)" -ForegroundColor Yellow
    }
    
    # Backup uploads
    if (Test-Path "uploads") {
        Write-Host "Backing up uploads..." -ForegroundColor Green
        Copy-Item -Recurse -Path "uploads" -Destination "$BackupDir/$backupName/" -Force
    }
    
    Write-Host "Backup completed: $BackupDir/$backupName" -ForegroundColor Green
}

# Build and deploy
function Deploy {
    Write-Host "Starting deployment process..." -ForegroundColor Green
    
    # Pull latest images
    Write-Host "Pulling latest images..." -ForegroundColor Green
    docker-compose pull
    
    # Build the BFF image
    Write-Host "Building BFF image..." -ForegroundColor Green
    docker-compose build bff
    
    # Start services
    Write-Host "Starting services..." -ForegroundColor Green
    docker-compose up -d
    
    # Wait for services to be healthy
    Write-Host "Waiting for services to become healthy..." -ForegroundColor Green
    Start-Sleep -Seconds 30
    
    # Check service health
    Check-Health
    
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
}

# Health check
function Check-Health {
    Write-Host "Performing health checks..." -ForegroundColor Green
    
    # Check BFF health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3005/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ BFF health check passed" -ForegroundColor Green
        } else {
            Write-Host "✗ BFF health check failed (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ BFF health check failed (Service might not be ready)" -ForegroundColor Red
    }
    
    # Check database connection
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3005/health/database" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Database health check passed" -ForegroundColor Green
        } else {
            Write-Host "⚠ Database health check failed (Status: $($response.StatusCode))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Database health check failed (Database might not be ready)" -ForegroundColor Yellow
    }
    
    # Check Redis connection
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3005/health/ready" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Redis health check passed" -ForegroundColor Green
        } else {
            Write-Host "⚠ Redis health check failed (Status: $($response.StatusCode))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Redis health check failed (Redis might not be ready)" -ForegroundColor Yellow
    }
}

# Rollback function
function Rollback {
    Write-Host "⚠ Deployment failed, initiating rollback..." -ForegroundColor Red
    
    # Get the latest backup
    $backups = Get-ChildItem -Path $BackupDir -Directory | Sort-Object LastWriteTime -Descending
    if ($backups.Count -gt 0) {
        $latestBackup = $backups[0].FullName
        Write-Host "Restoring from backup: $latestBackup" -ForegroundColor Yellow
        
        # Restore database
        $dbBackup = "$latestBackup/database.sql"
        if (Test-Path $dbBackup) {
            try {
                docker-compose exec -T postgres psql -U shahin_local -d shahin_grc_prod < $dbBackup
                Write-Host "Database restored" -ForegroundColor Green
            } catch {
                Write-Host "⚠ Could not restore database" -ForegroundColor Yellow
            }
        }
        
        # Restore uploads
        $uploadsBackup = "$latestBackup/uploads"
        if (Test-Path $uploadsBackup) {
            Copy-Item -Recurse -Path "$uploadsBackup/*" -Destination "uploads/" -Force
            Write-Host "Uploads restored" -ForegroundColor Green
        }
        
        Write-Host "Rollback completed" -ForegroundColor Green
    } else {
        Write-Host "⚠ No backup found for rollback" -ForegroundColor Red
    }
}

# Cleanup old backups and logs
function Cleanup {
    Write-Host "Cleaning up old backups and logs..." -ForegroundColor Green
    
    # Keep only last 10 backups
    $backups = Get-ChildItem -Path $BackupDir -Directory | Sort-Object LastWriteTime -Descending
    if ($backups.Count -gt 10) {
        $backupsToRemove = $backups[10..($backups.Count-1)]
        foreach ($backup in $backupsToRemove) {
            Remove-Item -Recurse -Path $backup.FullName -Force
        }
    }
    
    # Keep only last 30 days of logs
    $cutoffDate = (Get-Date).AddDays(-30)
    Get-ChildItem -Path "logs" -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force
    
    Write-Host "Cleanup completed" -ForegroundColor Green
}

# Show service status
function Show-Status {
    Write-Host "Service Status:" -ForegroundColor Green
    docker-compose ps
}

# Show logs
function Show-Logs {
    param([string]$Service = "bff")
    docker-compose logs -f $Service
}

# Main deployment flow
function Main {
    Write-Host "Starting Shahin BFF deployment for environment: $Environment" -ForegroundColor Green
    
    Create-Directories
    Check-Prerequisites
    Generate-SSLCerts
    Backup-Data
    Deploy
    Cleanup
    Show-Status
    
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host "Services are running at:" -ForegroundColor Green
    Write-Host "  - BFF API: http://localhost:3005" -ForegroundColor Green
    Write-Host "  - Health Check: http://localhost:3005/health" -ForegroundColor Green
    Write-Host "  - Database: localhost:5432" -ForegroundColor Green
    Write-Host "  - Redis: localhost:6379" -ForegroundColor Green
}

# Handle script arguments
switch ($Action) {
    "deploy" { Main }
    "health" { Check-Health }
    "backup" { Backup-Data }
    "cleanup" { Cleanup }
    "rollback" { Rollback }
    "stop" {
        Write-Host "Stopping services..." -ForegroundColor Green
        docker-compose down
    }
    "restart" {
        Write-Host "Restarting services..." -ForegroundColor Green
        docker-compose restart
    }
    "status" { Show-Status }
    "logs" { Show-Logs -Service $args[0] }
    default {
        Write-Host "Usage: .\deploy.ps1 [-Environment <environment>] [-Action <action>]"
        Write-Host "  Actions:"
        Write-Host "    deploy   - Full deployment process"
        Write-Host "    health   - Check service health"
        Write-Host "    backup   - Create backup of current data"
        Write-Host "    cleanup  - Clean up old backups and logs"
        Write-Host "    rollback - Rollback to previous backup"
        Write-Host "    stop     - Stop all services"
        Write-Host "    restart  - Restart all services"
        Write-Host "    status   - Show service status"
        Write-Host "    logs     - Show logs (optionally specify service)"
        exit 1
    }
}