#!/bin/bash

# ==========================================
# GRC Database Backup Script
# Automated PostgreSQL backup with rotation
# ==========================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-/var/backups/grc}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
BACKUP_NAME="grc_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-grc_db}"
DB_USER="${DB_USER:-postgres}"
PGPASSWORD="${DB_PASSWORD}"

# S3 configuration (optional)
S3_BUCKET="${S3_BUCKET:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}GRC Database Backup Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Create backup directory
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Perform backup
echo "Starting database backup..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_PATH"
echo ""

# Backup database
if PGPASSWORD="$PGPASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --clean --if-exists --verbose --file="$BACKUP_PATH" 2>&1 | tee /tmp/pg_dump.log; then
    
    echo -e "${GREEN}✅ Database backup completed successfully${NC}"
    
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
    
    # Compress backup
    echo "Compressing backup..."
    gzip "$BACKUP_PATH"
    COMPRESSED_PATH="${BACKUP_PATH}.gz"
    COMPRESSED_SIZE=$(du -h "$COMPRESSED_PATH" | cut -f1)
    echo -e "${GREEN}✅ Backup compressed: $COMPRESSED_SIZE${NC}"
    
    # Upload to S3 (if configured)
    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        echo "Uploading backup to S3..."
        if aws s3 cp "$COMPRESSED_PATH" "s3://${S3_BUCKET}/backups/${BACKUP_NAME}.gz" --region "$AWS_REGION"; then
            echo -e "${GREEN}✅ Backup uploaded to S3${NC}"
        else
            echo -e "${YELLOW}⚠️  Failed to upload to S3${NC}"
        fi
    fi
    
    # Clean old backups
    echo ""
    echo "Cleaning old backups (keeping last $RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "grc_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    REMAINING=$(find "$BACKUP_DIR" -name "grc_backup_*.sql.gz" -type f | wc -l)
    echo -e "${GREEN}✅ Cleanup completed. Remaining backups: $REMAINING${NC}"
    
    # Backup metadata
    echo ""
    echo "Backup metadata:"
    echo "  Timestamp: $TIMESTAMP"
    echo "  Size: $COMPRESSED_SIZE"
    echo "  Location: $COMPRESSED_PATH"
    if [ -n "$S3_BUCKET" ]; then
        echo "  S3: s3://${S3_BUCKET}/backups/${BACKUP_NAME}.gz"
    fi
    
    # Send notification (if configured)
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"✅ GRC Database backup completed: ${BACKUP_NAME}.gz (${COMPRESSED_SIZE})\"}" \
            > /dev/null 2>&1 || true
    fi
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Backup completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    exit 0
    
else
    echo -e "${RED}❌ Database backup failed!${NC}"
    
    # Send error notification
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"❌ GRC Database backup failed!\"}" \
            > /dev/null 2>&1 || true
    fi
    
    exit 1
fi
