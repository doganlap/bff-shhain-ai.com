# 🚀 GRC Application - Production Deployment Guide

## 📋 **Overview**

This guide provides comprehensive instructions for deploying the GRC Application to production with enterprise-grade security, performance, and reliability.

---

## 🎯 **Prerequisites**

### **System Requirements**
- **OS**: Ubuntu 20.04 LTS or CentOS 8+
- **CPU**: 4+ cores (8+ recommended)
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 100GB+ SSD
- **Network**: Static IP with domain name

### **Software Dependencies**
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.25+
- OpenSSL 1.1.1+
- Nginx (if not using containerized version)

---

## 🔧 **Pre-Deployment Setup**

### **1. System Preparation**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git unzip fail2ban ufw

# Configure firewall
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable
```

### **2. Docker Installation**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### **3. Application Setup**

```bash
# Clone repository
git clone https://github.com/your-org/grc-application.git
cd grc-application

# Create production environment file
cp .env.example .env.production
```

---

## 🔒 **Security Configuration**

### **1. SSL Certificate Setup**

```bash
# Generate SSL certificates
chmod +x ssl/generate-ssl.sh

# For production with Let's Encrypt
sudo ./ssl/generate-ssl.sh yourdomain.com production

# For development/testing
sudo ./ssl/generate-ssl.sh yourdomain.com self-signed
```

### **2. Security Hardening**

```bash
# Run security hardening script
sudo chmod +x security/security-hardening.sh
sudo ./security/security-hardening.sh

# Configure secrets management
sudo systemctl enable vault
sudo systemctl start vault
```

### **3. Environment Variables**

Edit `.env.production` with secure values:

```bash
# Database
DB_PASSWORD=your_secure_database_password_here
DB_SSL=true

# JWT Security
JWT_SECRET=your_jwt_secret_key_minimum_64_characters_long_and_random
JWT_ALGORITHM=RS256

# Redis
REDIS_PASSWORD=your_secure_redis_password_here

# API Configuration
API_BASE_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Security Settings
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=secure_grafana_password
```

---

## 🚀 **Deployment Process**

### **1. Database Setup**

```bash
# Start database first
docker-compose -f docker-compose.production.yml up -d postgres redis

# Wait for database to be ready
docker-compose -f docker-compose.production.yml exec postgres pg_isready -U grc_user

# Run database migrations
docker-compose -f docker-compose.production.yml run --rm grc-app npm run db:migrate
```

### **2. Application Deployment**

```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d

# Verify deployment
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs grc-app
```

### **3. Monitoring Setup**

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access monitoring dashboards
# Grafana: https://yourdomain.com:3001 (admin/secure_grafana_password)
# Prometheus: https://yourdomain.com:9090
```

### **4. Backup Configuration**

```bash
# Setup automated backups
chmod +x scripts/setup-cron-backups.sh
sudo ./scripts/setup-cron-backups.sh

# Test backup system
sudo ./scripts/backup-system.sh backup
```

---

## 🔍 **Health Checks & Verification**

### **1. Application Health**

```bash
# Check application health
curl -f https://yourdomain.com/health
curl -f https://yourdomain.com/api/health

# Check database connectivity
docker-compose -f docker-compose.production.yml exec postgres psql -U grc_user -d grc_template -c "SELECT version();"

# Check Redis connectivity
docker-compose -f docker-compose.production.yml exec redis redis-cli ping
```

### **2. Security Verification**

```bash
# SSL certificate validation
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Security headers check
curl -I https://yourdomain.com

# Port scan verification
nmap -sS -O yourdomain.com
```

### **3. Performance Testing**

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/

# Database performance check
docker-compose -f docker-compose.production.yml exec postgres psql -U grc_user -d grc_template -c "SELECT * FROM pg_stat_activity;"
```

---

## 📊 **Monitoring & Alerting**

### **1. Grafana Dashboards**

Access Grafana at `https://yourdomain.com:3001`:

- **Application Dashboard**: Overview of app performance
- **Infrastructure Dashboard**: System metrics
- **Database Dashboard**: PostgreSQL performance
- **Security Dashboard**: Security events and alerts

### **2. Alert Configuration**

```bash
# Configure Slack notifications
# Edit monitoring/alertmanager.yml with your Slack webhook URL

# Test alerting
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{"labels":{"alertname":"TestAlert","severity":"warning"}}]'
```

### **3. Log Management**

```bash
# View application logs
docker-compose -f docker-compose.production.yml logs -f grc-app

# View system logs
sudo journalctl -u docker -f

# View security logs
sudo tail -f /var/log/auth.log
```

---

## 🔄 **Maintenance Procedures**

### **1. Regular Updates**

```bash
# Update application
git pull origin main
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# Update system packages
sudo apt update && sudo apt upgrade -y
sudo reboot  # If kernel updates
```

### **2. Database Maintenance**

```bash
# Database vacuum and analyze
docker-compose -f docker-compose.production.yml exec postgres psql -U grc_user -d grc_template -c "VACUUM ANALYZE;"

# Check database size
docker-compose -f docker-compose.production.yml exec postgres psql -U grc_user -d grc_template -c "SELECT pg_size_pretty(pg_database_size('grc_template'));"

# Backup database manually
./scripts/backup-system.sh backup
```

### **3. Certificate Renewal**

```bash
# Renew Let's Encrypt certificates (automated via cron)
sudo certbot renew --quiet

# Manual certificate renewal
sudo ./ssl/generate-ssl.sh yourdomain.com production
docker-compose -f docker-compose.production.yml restart nginx
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs grc-app

# Check environment variables
docker-compose -f docker-compose.production.yml exec grc-app env | grep -E "(DB_|JWT_|API_)"

# Restart services
docker-compose -f docker-compose.production.yml restart
```

#### **Database Connection Issues**
```bash
# Check database status
docker-compose -f docker-compose.production.yml exec postgres pg_isready

# Check database logs
docker-compose -f docker-compose.production.yml logs postgres

# Reset database connection
docker-compose -f docker-compose.production.yml restart postgres grc-app
```

#### **SSL Certificate Issues**
```bash
# Check certificate validity
openssl x509 -in ssl/certificate.crt -text -noout

# Regenerate certificates
sudo ./ssl/generate-ssl.sh yourdomain.com production
docker-compose -f docker-compose.production.yml restart nginx
```

#### **Performance Issues**
```bash
# Check resource usage
docker stats

# Check database performance
docker-compose -f docker-compose.production.yml exec postgres psql -U grc_user -d grc_template -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Check Redis performance
docker-compose -f docker-compose.production.yml exec redis redis-cli --latency-history
```

---

## 📞 **Support & Escalation**

### **Emergency Contacts**
- **System Administrator**: admin@yourdomain.com
- **Security Team**: security@yourdomain.com
- **Development Team**: dev@yourdomain.com

### **Escalation Procedures**

1. **Level 1**: Application restart
2. **Level 2**: Service restart
3. **Level 3**: System administrator notification
4. **Level 4**: Emergency response team activation

### **Incident Response**
```bash
# Report security incident
sudo /usr/local/bin/incident-response.sh security critical "Description of incident"

# Check incident logs
sudo tail -f /var/log/grc/incidents/*.log
```

---

## 📚 **Additional Resources**

- [API Documentation](./documentation/API_REFERENCE.md)
- [Database Schema](./documentation/DATABASE_GUIDE.md)
- [Security Policies](./security/README.md)
- [Performance Tuning](./performance/README.md)
- [Backup & Recovery](./scripts/README.md)

---

## ✅ **Deployment Checklist**

- [ ] System requirements verified
- [ ] Docker and Docker Compose installed
- [ ] SSL certificates configured
- [ ] Environment variables set
- [ ] Security hardening applied
- [ ] Database initialized
- [ ] Application deployed
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Health checks passing
- [ ] Performance testing completed
- [ ] Documentation updated
- [ ] Team trained on procedures

---

**🎉 Congratulations! Your GRC Application is now production-ready with enterprise-grade security, monitoring, and performance optimization.**
