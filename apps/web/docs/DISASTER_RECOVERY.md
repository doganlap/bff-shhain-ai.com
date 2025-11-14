# 🚨 Disaster Recovery Plan - GRC Assessment Platform

## Executive Summary
This document outlines the disaster recovery procedures for the GRC Assessment Platform, a multi-tenant SaaS application serving governance, risk, and compliance assessments.

**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 1 hour  
**Last Updated:** 2024  
**Version:** 1.0

---

## 🎯 Scope

### Systems Covered
- ✅ PostgreSQL Database (primary data store)
- ✅ BFF (Backend for Frontend)
- ✅ 8 Microservices (grc-api, auth-service, document-service, etc.)
- ✅ Web Frontend (React/Vite application)
- ✅ Redis Cache (session/rate limiting)
- ✅ File Storage (documents/evidence)

### Data Classification
- **Critical:** Tenant data, assessments, compliance reports, user accounts
- **Important:** Audit logs, system configurations, session data
- **Low:** Temporary cache, analytics data

---

## 📋 Pre-Disaster Preparation

### 1. Backup Strategy

#### Database Backups
```bash
# Automated daily backups (via cron)
0 2 * * * /path/to/scripts/backup-database.sh

# Manual backup
./scripts/backup-database.sh

# Backup location
/var/backups/grc/grc_backup_YYYYMMDD_HHMMSS.sql.gz

# S3 backup (if configured)
s3://your-bucket/backups/grc_backup_YYYYMMDD_HHMMSS.sql.gz
```

#### File Storage Backups
```bash
# Document storage
rsync -avz /var/grc/documents/ backup-server:/backups/grc-documents/

# Evidence files
rsync -avz /var/grc/evidence/ backup-server:/backups/grc-evidence/
```

#### Configuration Backups
```bash
# Environment configurations
tar -czf config-backup.tar.gz \
  apps/bff/.env \
  apps/services/*/env \
  infra/docker/docker-compose.yml

# Upload to S3
aws s3 cp config-backup.tar.gz s3://your-bucket/config-backups/
```

### 2. Documentation

Keep updated copies of:
- [ ] System architecture diagrams
- [ ] Database schema documentation
- [ ] API documentation
- [ ] Service dependency map
- [ ] Access credentials (encrypted)
- [ ] DNS records
- [ ] SSL certificates
- [ ] Third-party service credentials

### 3. Monitoring & Alerting

```yaml
# Critical alerts to set up
- Database down
- Service unavailability (>5 min)
- Disk space <20%
- High error rate (>5%)
- SSL certificate expiring (<30 days)
- Backup failures
- Cross-tenant access attempts
```

---

## 🚨 Disaster Scenarios

### Scenario 1: Database Failure

#### Symptoms
- Database connection errors
- 500 errors on all API endpoints
- Health checks failing

#### Recovery Steps

**1. Assess the Situation**
```bash
# Check database status
docker-compose ps postgres
systemctl status postgresql

# Check logs
docker-compose logs postgres --tail=100
tail -f /var/log/postgresql/postgresql.log
```

**2. Attempt Quick Recovery**
```bash
# Restart database
docker-compose restart postgres

# Or system service
sudo systemctl restart postgresql
```

**3. Full Database Restore (if restart fails)**

```bash
# Stop all services
docker-compose down

# Restore from backup
cd /var/backups/grc
gunzip -c grc_backup_20240115_020000.sql.gz | \
  psql -h localhost -U postgres -d grc_db

# Or from S3
aws s3 cp s3://your-bucket/backups/latest.sql.gz - | \
  gunzip | psql -h localhost -U postgres -d grc_db

# Verify restoration
psql -h localhost -U postgres -d grc_db -c "SELECT COUNT(*) FROM tenants;"

# Restart services
docker-compose up -d

# Verify health
curl http://localhost:3005/health/detailed
```

**Estimated Recovery Time:** 30-60 minutes  
**Data Loss:** Up to RPO (1 hour)

---

### Scenario 2: Complete Server Failure

#### Symptoms
- Server unreachable
- All services down
- Hardware failure

#### Recovery Steps

**1. Provision New Server**
```bash
# Using infrastructure as code
terraform apply -var="environment=production"

# Or manual setup
# - Ubuntu 22.04 LTS
# - 8 CPU cores minimum
# - 16GB RAM minimum
# - 500GB SSD storage
```

**2. Install Prerequisites**
```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# PostgreSQL client
sudo apt-get install postgresql-client-15

# AWS CLI (if using S3)
pip3 install awscli
```

**3. Clone Repository**
```bash
git clone https://github.com/your-org/grc-assessment.git
cd grc-assessment
```

**4. Restore Configuration**
```bash
# Download from S3
aws s3 cp s3://your-bucket/config-backups/latest.tar.gz .
tar -xzf latest.tar.gz

# Or use backup copies
cp /backup-server/config/* apps/bff/.env
```

**5. Restore Database**
```bash
# Start PostgreSQL only
docker-compose up -d postgres

# Wait for startup
sleep 10

# Restore database
aws s3 cp s3://your-bucket/backups/latest.sql.gz - | \
  gunzip | docker-compose exec -T postgres \
  psql -U postgres -d grc_db
```

**6. Restore Files**
```bash
# Create directories
sudo mkdir -p /var/grc/documents /var/grc/evidence

# Restore from backup
rsync -avz backup-server:/backups/grc-documents/ /var/grc/documents/
rsync -avz backup-server:/backups/grc-evidence/ /var/grc/evidence/
```

**7. Start All Services**
```bash
# Build and start
docker-compose up -d --build

# Check health
curl http://localhost:3005/health/detailed
```

**8. Update DNS**
```bash
# Update DNS A record to new IP
# Example using Cloudflare API
curl -X PUT "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records/RECORD_ID" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"A","name":"grc.yourcompany.com","content":"NEW_IP"}'
```

**9. Verify Services**
```bash
# Test all endpoints
./scripts/test-endpoints.sh

# Check tenant data
curl -H "X-Tenant-ID: test-tenant-id" \
  http://localhost:3005/api/assessments
```

**Estimated Recovery Time:** 2-4 hours  
**Data Loss:** Up to RPO (1 hour)

---

### Scenario 3: Data Corruption

#### Symptoms
- Inconsistent data
- Constraint violations
- Tenant data mixing

#### Recovery Steps

**1. Identify Scope**
```bash
# Check data integrity
psql -h localhost -U postgres -d grc_db

# Find affected tenants
SELECT DISTINCT tenant_id FROM assessments 
WHERE updated_at > '2024-01-15 10:00:00';

# Check for cross-tenant contamination
SELECT a.id, a.tenant_id, u.tenant_id 
FROM assessments a 
JOIN users u ON a.created_by = u.id 
WHERE a.tenant_id != u.tenant_id;
```

**2. Isolate Affected Tenants**
```sql
-- Create backup of affected data
CREATE TABLE assessments_backup AS 
SELECT * FROM assessments 
WHERE tenant_id IN ('tenant-1', 'tenant-2');

-- Set read-only mode for affected tenants
UPDATE tenants 
SET is_active = false 
WHERE id IN ('tenant-1', 'tenant-2');
```

**3. Point-in-Time Recovery**
```bash
# Restore from backup before corruption
RESTORE_TIME="2024-01-15 09:00:00"

# Restore specific tables
pg_restore -h localhost -U postgres -d grc_db \
  --table=assessments \
  --table=assessment_responses \
  /var/backups/grc/grc_backup_20240115_020000.sql.gz
```

**4. Verify and Re-enable**
```sql
-- Verify data integrity
SELECT COUNT(*) FROM assessments WHERE tenant_id = 'tenant-1';

-- Re-enable tenant
UPDATE tenants SET is_active = true WHERE id = 'tenant-1';
```

**Estimated Recovery Time:** 1-2 hours  
**Data Loss:** Minimal (point-in-time recovery)

---

### Scenario 4: Security Breach

#### Symptoms
- Suspicious access patterns
- Unauthorized data access
- Credential compromise

#### Immediate Actions

**1. Contain the Breach**
```bash
# Block suspicious IPs
iptables -A INPUT -s SUSPICIOUS_IP -j DROP

# Revoke all JWT tokens
redis-cli FLUSHALL

# Disable compromised accounts
psql -h localhost -U postgres -d grc_db \
  -c "UPDATE users SET is_active = false WHERE id IN (...);"
```

**2. Assess Impact**
```sql
-- Check audit logs
SELECT * FROM audit_logs 
WHERE created_at > '2024-01-15 10:00:00' 
ORDER BY created_at DESC;

-- Identify affected tenants
SELECT DISTINCT tenant_id FROM audit_logs 
WHERE ip_address = 'SUSPICIOUS_IP';
```

**3. Notify Stakeholders**
```bash
# Send notifications
node scripts/send-security-alert.js

# Required notifications:
# - Affected tenants
# - Platform administrators
# - Legal/compliance team
# - Regulatory authorities (if required)
```

**4. Forensic Analysis**
```bash
# Preserve logs
cp /var/log/grc/* /forensics/logs/
tar -czf logs-$(date +%Y%m%d).tar.gz /forensics/logs/

# Collect system state
docker-compose ps > system-state.txt
docker-compose logs > docker-logs.txt
```

**5. Recovery Actions**
```bash
# Rotate all secrets
./scripts/rotate-secrets.sh

# Force password resets
psql -h localhost -U postgres -d grc_db \
  -c "UPDATE users SET force_password_change = true;"

# Update security policies
```

**Estimated Recovery Time:** 4-24 hours  
**Regulatory Requirements:** GDPR breach notification within 72 hours

---

## 📞 Contact Information

### Emergency Contacts

| Role | Name | Phone | Email | Backup |
|------|------|-------|-------|--------|
| Platform Lead | [Name] | +XXX | [email] | [backup] |
| Database Admin | [Name] | +XXX | [email] | [backup] |
| Security Lead | [Name] | +XXX | [email] | [backup] |
| DevOps Lead | [Name] | +XXX | [email] | [backup] |

### Escalation Matrix

**Level 1 (0-30 min):** On-call engineer  
**Level 2 (30-60 min):** Team lead  
**Level 3 (60+ min):** CTO/Executive  

### External Contacts

- **Hosting Provider:** [Provider] - Support: +XXX
- **Cloud Provider (AWS):** Enterprise Support - +XXX
- **Database Vendor:** PostgreSQL Community
- **Security Vendor (Sentry):** support@sentry.io

---

## 🧪 Testing & Drills

### Monthly Tests
- [ ] Backup restoration test
- [ ] Health check verification
- [ ] Monitoring alert tests

### Quarterly Drills
- [ ] Full disaster recovery simulation
- [ ] Team coordination exercise
- [ ] Documentation review
- [ ] Contact list updates

### Annual Reviews
- [ ] Update RTO/RPO targets
- [ ] Review and update procedures
- [ ] Technology stack assessment
- [ ] Third-party service reviews

---

## 📊 Post-Incident

### After Every Incident

**1. Incident Report** (within 24 hours)
```markdown
## Incident Summary
- Date/Time: 
- Duration: 
- Impact: 
- Root Cause: 
- Resolution: 

## Timeline
- [Time] Detection
- [Time] Escalation
- [Time] Resolution
- [Time] Verification

## Affected Systems
- System 1
- System 2

## Data Loss
- Scope: 
- Recovery: 

## Action Items
1. [ ] Fix immediate issue
2. [ ] Prevent recurrence
3. [ ] Update documentation
```

**2. Post-Mortem** (within 1 week)
- What happened?
- Why did it happen?
- How was it fixed?
- How can we prevent it?

**3. Update Documentation**
- Update this DR plan
- Update runbooks
- Update architecture diagrams

---

## 📚 Additional Resources

- **Runbooks:** `/docs/runbooks/`
- **Architecture:** `/docs/architecture/`
- **API Docs:** `/docs/api/`
- **Monitoring:** https://monitoring.yourcompany.com
- **Status Page:** https://status.yourcompany.com

---

**Document Owner:** DevOps Team  
**Review Frequency:** Quarterly  
**Last Tested:** [Date]  
**Next Test:** [Date]

---

## ✅ Pre-Incident Checklist

Before any disaster:
- [ ] Backups are running daily
- [ ] Backup restoration tested monthly
- [ ] All credentials documented and encrypted
- [ ] Emergency contacts up to date
- [ ] Monitoring and alerting operational
- [ ] Team trained on procedures
- [ ] DR plan reviewed quarterly
- [ ] Communication templates prepared
- [ ] Regulatory requirements documented
