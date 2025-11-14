#!/bin/bash

# GRC Application Backup System
# Comprehensive backup solution for database, files, and configurations

set -e

# Configuration
BACKUP_ROOT="/backups"
DB_CONTAINER="grc-postgres"
APP_CONTAINER="grc-app"
RETENTION_DAYS=30
BACKUP_PREFIX="grc-backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup directories
DB_BACKUP_DIR="$BACKUP_ROOT/database"
FILES_BACKUP_DIR="$BACKUP_ROOT/files"
CONFIG_BACKUP_DIR="$BACKUP_ROOT/configs"
LOGS_BACKUP_DIR="$BACKUP_ROOT/logs"

# Create backup directories
mkdir -p "$DB_BACKUP_DIR" "$FILES_BACKUP_DIR" "$CONFIG_BACKUP_DIR" "$LOGS_BACKUP_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOGS_BACKUP_DIR/backup.log"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Database backup function
backup_database() {
    log "Starting database backup..."
    
    local backup_file="$DB_BACKUP_DIR/${BACKUP_PREFIX}_db_${TIMESTAMP}.sql"
    local compressed_file="${backup_file}.gz"
    
    # Create database dump
    docker exec "$DB_CONTAINER" pg_dump -U grc_user -d grc_template > "$backup_file" || error_exit "Database backup failed"
    
    # Compress backup
    gzip "$backup_file" || error_exit "Database compression failed"
    
    # Verify backup integrity
    if ! gunzip -t "$compressed_file"; then
        error_exit "Database backup verification failed"
    fi
    
    log "Database backup completed: $compressed_file"
    echo "$compressed_file"
}

# Files backup function
backup_files() {
    log "Starting files backup..."
    
    local backup_file="$FILES_BACKUP_DIR/${BACKUP_PREFIX}_files_${TIMESTAMP}.tar.gz"
    
    # Backup uploads, logs, and SSL certificates
    tar -czf "$backup_file" \
        -C / \
        app/uploads \
        app/logs \
        app/ssl \
        2>/dev/null || log "Warning: Some files may not exist"
    
    log "Files backup completed: $backup_file"
    echo "$backup_file"
}

# Configuration backup function
backup_configs() {
    log "Starting configuration backup..."
    
    local backup_file="$CONFIG_BACKUP_DIR/${BACKUP_PREFIX}_configs_${TIMESTAMP}.tar.gz"
    
    # Backup configuration files
    tar -czf "$backup_file" \
        docker-compose.yml \
        docker-compose.prod.yml \
        nginx.conf \
        nginx-ssl.conf \
        .env.production \
        Dockerfile \
        package.json \
        2>/dev/null || log "Warning: Some config files may not exist"
    
    log "Configuration backup completed: $backup_file"
    echo "$backup_file"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_ROOT" -name "${BACKUP_PREFIX}_*" -type f -mtime +$RETENTION_DAYS -delete
    
    log "Cleanup completed"
}

# Backup verification
verify_backup() {
    local backup_file="$1"
    local backup_type="$2"
    
    if [ ! -f "$backup_file" ]; then
        error_exit "$backup_type backup file not found: $backup_file"
    fi
    
    local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo "0")
    
    if [ "$file_size" -lt 1024 ]; then
        error_exit "$backup_type backup file too small: $file_size bytes"
    fi
    
    log "$backup_type backup verified: $backup_file ($file_size bytes)"
}

# Send backup notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Email notification (requires mail command)
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "GRC Backup $status" admin@yourdomain.com
    fi
    
    # Webhook notification (optional)
    if [ -n "$BACKUP_WEBHOOK_URL" ]; then
        curl -X POST "$BACKUP_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"status\":\"$status\",\"message\":\"$message\",\"timestamp\":\"$(date -Iseconds)\"}" \
            >/dev/null 2>&1 || log "Warning: Webhook notification failed"
    fi
}

# Main backup function
perform_backup() {
    log "=== Starting GRC Application Backup ==="
    
    local start_time=$(date +%s)
    local backup_files=()
    
    # Perform backups
    backup_files+=("$(backup_database)")
    backup_files+=("$(backup_files)")
    backup_files+=("$(backup_configs)")
    
    # Verify all backups
    verify_backup "${backup_files[0]}" "Database"
    verify_backup "${backup_files[1]}" "Files"
    verify_backup "${backup_files[2]}" "Configuration"
    
    # Cleanup old backups
    cleanup_old_backups
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    local success_message="Backup completed successfully in ${duration}s
Database: ${backup_files[0]}
Files: ${backup_files[1]}
Configs: ${backup_files[2]}"
    
    log "$success_message"
    send_notification "SUCCESS" "$success_message"
    
    log "=== Backup Process Completed ==="
}

# Restore function
restore_backup() {
    local backup_date="$1"
    
    if [ -z "$backup_date" ]; then
        error_exit "Usage: $0 restore YYYYMMDD_HHMMSS"
    fi
    
    log "=== Starting Restore Process ==="
    
    # Find backup files
    local db_backup="$DB_BACKUP_DIR/${BACKUP_PREFIX}_db_${backup_date}.sql.gz"
    local files_backup="$FILES_BACKUP_DIR/${BACKUP_PREFIX}_files_${backup_date}.tar.gz"
    local config_backup="$CONFIG_BACKUP_DIR/${BACKUP_PREFIX}_configs_${backup_date}.tar.gz"
    
    # Verify backup files exist
    [ -f "$db_backup" ] || error_exit "Database backup not found: $db_backup"
    [ -f "$files_backup" ] || error_exit "Files backup not found: $files_backup"
    [ -f "$config_backup" ] || error_exit "Config backup not found: $config_backup"
    
    # Confirm restore
    read -p "This will overwrite current data. Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log "Restore cancelled by user"
        exit 0
    fi
    
    # Stop application
    log "Stopping application..."
    docker-compose down
    
    # Restore database
    log "Restoring database..."
    gunzip -c "$db_backup" | docker exec -i "$DB_CONTAINER" psql -U grc_user -d grc_template
    
    # Restore files
    log "Restoring files..."
    tar -xzf "$files_backup" -C /
    
    # Restore configs
    log "Restoring configurations..."
    tar -xzf "$config_backup"
    
    # Start application
    log "Starting application..."
    docker-compose up -d
    
    log "=== Restore Process Completed ==="
}

# List available backups
list_backups() {
    log "Available backups:"
    find "$BACKUP_ROOT" -name "${BACKUP_PREFIX}_*" -type f | sort
}

# Main script logic
case "${1:-backup}" in
    "backup")
        perform_backup
        ;;
    "restore")
        restore_backup "$2"
        ;;
    "list")
        list_backups
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 {backup|restore|list|cleanup}"
        echo "  backup          - Perform full backup"
        echo "  restore DATE    - Restore from backup (format: YYYYMMDD_HHMMSS)"
        echo "  list            - List available backups"
        echo "  cleanup         - Remove old backups"
        exit 1
        ;;
esac
