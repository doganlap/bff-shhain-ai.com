#!/bin/bash

# Shahin BFF Deployment Script
# This script handles the complete deployment process for the BFF service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check environment file
    if [ ! -f ".env.$ENVIRONMENT" ]; then
        warn "Environment file .env.$ENVIRONMENT not found, using .env.production.example as template"
        cp .env.production.example .env.production
        warn "Please edit .env.production with your actual values before continuing"
        exit 1
    fi
    
    log "Prerequisites check completed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    mkdir -p logs backups uploads ssl
    log "Directories created"
}

# Generate SSL certificates (self-signed for development)
generate_ssl_certs() {
    if [ "$ENVIRONMENT" = "development" ]; then
        log "Generating self-signed SSL certificates for development..."
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem \
            -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        log "SSL certificates generated"
    else
        log "Production SSL certificates should be obtained from a CA like Let's Encrypt"
        if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
            warn "SSL certificates not found in ssl/ directory"
        fi
    fi
}

# Backup existing data
backup_data() {
    log "Creating backup of existing data..."
    
    # Create backup directory
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    
    # Backup database (if running)
    if docker-compose ps postgres | grep -q "Up"; then
        log "Backing up database..."
        docker-compose exec -T postgres pg_dump -U shahin_local shahin_grc_prod > "$BACKUP_DIR/$BACKUP_NAME/database.sql"
    fi
    
    # Backup uploads
    if [ -d "uploads" ]; then
        log "Backing up uploads..."
        cp -r uploads "$BACKUP_DIR/$BACKUP_NAME/"
    fi
    
    log "Backup completed: $BACKUP_DIR/$BACKUP_NAME"
}

# Build and deploy
deploy() {
    log "Starting deployment process..."
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose pull
    
    # Build the BFF image
    log "Building BFF image..."
    docker-compose build bff
    
    # Start services
    log "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log "Waiting for services to become healthy..."
    sleep 30
    
    # Check service health
    check_health
    
    log "Deployment completed successfully!"
}

# Health check
check_health() {
    log "Performing health checks..."
    
    # Check BFF health
    if curl -f http://localhost:3005/health > /dev/null 2>&1; then
        log "✓ BFF health check passed"
    else
        error "✗ BFF health check failed"
    fi
    
    # Check database connection
    if curl -f http://localhost:3005/health/database > /dev/null 2>&1; then
        log "✓ Database health check passed"
    else
        warn "⚠ Database health check failed"
    fi
    
    # Check Redis connection
    if curl -f http://localhost:3005/health/ready > /dev/null 2>&1; then
        log "✓ Redis health check passed"
    else
        warn "⚠ Redis health check failed"
    fi
}

# Rollback function
rollback() {
    error "Deployment failed, initiating rollback..."
    
    # Get the latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        log "Restoring from backup: $LATEST_BACKUP"
        
        # Restore database
        if [ -f "$BACKUP_DIR/$LATEST_BACKUP/database.sql" ]; then
            docker-compose exec -T postgres psql -U shahin_local -d shahin_grc_prod < "$BACKUP_DIR/$LATEST_BACKUP/database.sql"
        fi
        
        # Restore uploads
        if [ -d "$BACKUP_DIR/$LATEST_BACKUP/uploads" ]; then
            cp -r "$BACKUP_DIR/$LATEST_BACKUP/uploads"/* uploads/
        fi
        
        log "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Cleanup old backups and logs
cleanup() {
    log "Cleaning up old backups and logs..."
    
    # Keep only last 10 backups
    ls -t "$BACKUP_DIR" | tail -n +11 | xargs -r rm -rf
    
    # Keep only last 30 days of logs
    find logs -name "*.log" -type f -mtime +30 -delete
    
    log "Cleanup completed"
}

# Main deployment flow
main() {
    log "Starting Shahin BFF deployment for environment: $ENVIRONMENT"
    
    # Set trap for rollback on error
    trap rollback ERR
    
    check_prerequisites
    create_directories
    generate_ssl_certs
    backup_data
    deploy
    cleanup
    
    log "🎉 Deployment completed successfully!"
    log "Services are running at:"
    log "  - BFF API: http://localhost:3005"
    log "  - Health Check: http://localhost:3005/health"
    log "  - Database: localhost:5432"
    log "  - Redis: localhost:6379"
    
    # Show service status
    docker-compose ps
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "health")
        check_health
        ;;
    "backup")
        backup_data
        ;;
    "cleanup")
        cleanup
        ;;
    "rollback")
        rollback
        ;;
    "stop")
        log "Stopping services..."
        docker-compose down
        ;;
    "restart")
        log "Restarting services..."
        docker-compose restart
        ;;
    "logs")
        docker-compose logs -f "${2:-bff}"
        ;;
    *)
        echo "Usage: $0 {deploy|health|backup|cleanup|rollback|stop|restart|logs [service]}"
        echo "  deploy   - Full deployment process"
        echo "  health   - Check service health"
        echo "  backup   - Create backup of current data"
        echo "  cleanup  - Clean up old backups and logs"
        echo "  rollback - Rollback to previous backup"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show logs (optionally specify service)"
        exit 1
        ;;
esac