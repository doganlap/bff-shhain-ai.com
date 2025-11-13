#!/bin/bash

# Setup automated backups via cron
# This script configures regular backup schedules

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-system.sh"

echo "🕐 Setting up automated backup schedules..."

# Make backup script executable
chmod +x "$BACKUP_SCRIPT"

# Create backup directories
sudo mkdir -p /backups/{database,files,configs,logs}
sudo chown -R $(whoami):$(whoami) /backups

# Setup cron jobs
(crontab -l 2>/dev/null; cat << EOF

# GRC Application Automated Backups
# Daily backup at 2:00 AM
0 2 * * * $BACKUP_SCRIPT backup >> /backups/logs/cron-backup.log 2>&1

# Weekly cleanup on Sundays at 3:00 AM
0 3 * * 0 $BACKUP_SCRIPT cleanup >> /backups/logs/cron-cleanup.log 2>&1

# Monthly full system backup on 1st day at 1:00 AM
0 1 1 * * $BACKUP_SCRIPT backup && echo "Monthly backup completed" >> /backups/logs/monthly-backup.log

EOF
) | crontab -

echo "✅ Cron jobs configured:"
echo "  - Daily backups: 2:00 AM"
echo "  - Weekly cleanup: Sunday 3:00 AM"
echo "  - Monthly full backup: 1st day 1:00 AM"

# Create backup monitoring script
cat > /usr/local/bin/backup-monitor.sh << 'EOF'
#!/bin/bash

# Backup monitoring and alerting script
BACKUP_LOG="/backups/logs/backup.log"
ALERT_EMAIL="admin@yourdomain.com"

# Check if backup ran in last 25 hours
if [ -f "$BACKUP_LOG" ]; then
    LAST_BACKUP=$(grep "Backup completed successfully" "$BACKUP_LOG" | tail -1 | cut -d']' -f1 | tr -d '[')
    if [ -n "$LAST_BACKUP" ]; then
        LAST_BACKUP_EPOCH=$(date -d "$LAST_BACKUP" +%s 2>/dev/null || echo 0)
        CURRENT_EPOCH=$(date +%s)
        HOURS_SINCE=$(( (CURRENT_EPOCH - LAST_BACKUP_EPOCH) / 3600 ))
        
        if [ $HOURS_SINCE -gt 25 ]; then
            echo "WARNING: Last backup was $HOURS_SINCE hours ago" | mail -s "GRC Backup Alert" "$ALERT_EMAIL"
        fi
    else
        echo "ERROR: No successful backup found in logs" | mail -s "GRC Backup Alert" "$ALERT_EMAIL"
    fi
else
    echo "ERROR: Backup log file not found" | mail -s "GRC Backup Alert" "$ALERT_EMAIL"
fi
EOF

chmod +x /usr/local/bin/backup-monitor.sh

# Add monitoring to cron (runs every 6 hours)
(crontab -l 2>/dev/null; echo "0 */6 * * * /usr/local/bin/backup-monitor.sh") | crontab -

echo "✅ Backup monitoring configured"
echo "📧 Alerts will be sent to: admin@yourdomain.com"
echo ""
echo "🔧 To test backup system:"
echo "  $BACKUP_SCRIPT backup"
echo ""
echo "📋 To view backup logs:"
echo "  tail -f /backups/logs/backup.log"
