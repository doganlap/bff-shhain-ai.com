# ==========================================
# GRC Database Backup Script (PowerShell)
# Automated PostgreSQL backup with rotation
# ==========================================

param(
    [string]$BackupDir = "C:\Backups\GRC",
    [int]$RetentionDays = 7,
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbName = "grc_db",
    [string]$DbUser = "postgres",
    [string]$DbPassword = $env:DB_PASSWORD,
    [string]$S3Bucket = "",
    [string]$WebhookUrl = ""
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host "GRC Database Backup Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Generate timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupName = "grc_backup_$Timestamp.sql"
$BackupPath = Join-Path $BackupDir $BackupName

# Create backup directory if not exists
if (-not (Test-Path $BackupDir)) {
    Write-Host "Creating backup directory: $BackupDir"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Check if pg_dump is available
try {
    $pgDump = Get-Command pg_dump -ErrorAction Stop
} catch {
    Write-Host "Error: pg_dump not found. Please install PostgreSQL client tools." -ForegroundColor Red
    exit 1
}

# Perform backup
Write-Host "Starting database backup..."
Write-Host "Database: $DbName"
Write-Host "Host: ${DbHost}:${DbPort}"
Write-Host "Backup file: $BackupPath"
Write-Host ""

try {
    # Set password environment variable
    $env:PGPASSWORD = $DbPassword
    
    # Run pg_dump
    & pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName `
        --clean --if-exists --verbose --file=$BackupPath 2>&1 | Tee-Object -FilePath "$env:TEMP\pg_dump.log"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database backup completed successfully" -ForegroundColor Green
        
        # Get backup size
        $BackupSize = (Get-Item $BackupPath).Length / 1MB
        Write-Host ("Backup size: {0:N2} MB" -f $BackupSize)
        
        # Compress backup
        Write-Host "Compressing backup..."
        $CompressedPath = "$BackupPath.gz"
        
        # Use 7-Zip or built-in compression
        if (Get-Command 7z -ErrorAction SilentlyContinue) {
            & 7z a -tgzip $CompressedPath $BackupPath | Out-Null
        } else {
            # PowerShell compression (slower but available)
            Compress-Archive -Path $BackupPath -DestinationPath "$BackupPath.zip" -CompressionLevel Optimal
            Remove-Item $BackupPath
            $CompressedPath = "$BackupPath.zip"
        }
        
        $CompressedSize = (Get-Item $CompressedPath).Length / 1MB
        Write-Host ("✅ Backup compressed: {0:N2} MB" -f $CompressedSize) -ForegroundColor Green
        
        # Upload to S3 (if configured)
        if ($S3Bucket -and (Get-Command aws -ErrorAction SilentlyContinue)) {
            Write-Host "Uploading backup to S3..."
            try {
                & aws s3 cp $CompressedPath "s3://$S3Bucket/backups/$BackupName.gz"
                Write-Host "✅ Backup uploaded to S3" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Failed to upload to S3" -ForegroundColor Yellow
            }
        }
        
        # Clean old backups
        Write-Host ""
        Write-Host "Cleaning old backups (keeping last $RetentionDays days)..."
        $CutoffDate = (Get-Date).AddDays(-$RetentionDays)
        Get-ChildItem -Path $BackupDir -Filter "grc_backup_*.sql.*" | 
            Where-Object { $_.LastWriteTime -lt $CutoffDate } | 
            Remove-Item -Force
        
        $Remaining = (Get-ChildItem -Path $BackupDir -Filter "grc_backup_*.sql.*").Count
        Write-Host "✅ Cleanup completed. Remaining backups: $Remaining" -ForegroundColor Green
        
        # Backup metadata
        Write-Host ""
        Write-Host "Backup metadata:"
        Write-Host "  Timestamp: $Timestamp"
        Write-Host ("  Size: {0:N2} MB" -f $CompressedSize)
        Write-Host "  Location: $CompressedPath"
        if ($S3Bucket) {
            Write-Host "  S3: s3://$S3Bucket/backups/$BackupName.gz"
        }
        
        # Send notification
        if ($WebhookUrl) {
            $Body = @{
                text = "✅ GRC Database backup completed: $BackupName ({0:N2} MB)" -f $CompressedSize
            } | ConvertTo-Json
            
            try {
                Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $Body -ContentType "application/json" | Out-Null
            } catch {
                Write-Host "⚠️  Failed to send notification" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Backup completed successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        
        exit 0
    } else {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }
    
} catch {
    Write-Host "❌ Database backup failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Send error notification
    if ($WebhookUrl) {
        $Body = @{
            text = "❌ GRC Database backup failed: $($_.Exception.Message)"
        } | ConvertTo-Json
        
        try {
            Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $Body -ContentType "application/json" | Out-Null
        } catch {
            # Ignore notification errors
        }
    }
    
    exit 1
} finally {
    # Clear password
    $env:PGPASSWORD = $null
}
