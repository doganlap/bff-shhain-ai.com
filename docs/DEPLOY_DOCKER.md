# 🐳 **DOCKER DEPLOYMENT GUIDE**

**Date:** 2025-01-10  
**Status:** ✅ **Ready to Deploy**

---

## 🚀 **QUICK START**

### **Development Deployment**

**PowerShell (Windows):**
```powershell
# Deploy with build
.\scripts\deploy-docker.ps1 -Environment dev -Build

# Or just start (if already built)
.\scripts\deploy-docker.ps1 -Environment dev
```

**Bash (Linux/Mac):**
```bash
# Make script executable
chmod +x scripts/deploy-docker.sh

# Deploy with build
./scripts/deploy-docker.sh dev true

# Or just start
./scripts/deploy-docker.sh dev
```

**Manual:**
```bash
# Navigate to project root
cd D:\Projects\GRC-Master\Assessmant-GRC

# Start all services
docker-compose -f infra/docker/docker-compose.ecosystem.yml up -d

# Build and start
docker-compose -f infra/docker/docker-compose.ecosystem.yml up -d --build
```

---

### **Production Deployment**

**PowerShell:**
```powershell
.\scripts\deploy-docker.ps1 -Environment production -Build
```

**Bash:**
```bash
./scripts/deploy-docker.sh production true
```

**Manual:**
```bash
docker-compose -f infra/docker/docker-compose.production.yml up -d --build
```

---

## 📋 **PREREQUISITES**

1. **Docker & Docker Compose** installed
2. **Environment Variables** configured (`.env` file)
3. **Ports Available:**
   - 80 (Frontend - Production)
   - 5173 (Frontend - Development)
   - 3000 (BFF API)
   - 3001 (Auth Service)
   - 3002 (Document Service)
   - 3003 (Partner Service)
   - 3004 (Notification Service)
   - 5432 (PostgreSQL)
   - 8500 (Consul - Optional)
   - 5672, 15672 (RabbitMQ - Optional)

---

## ⚙️ **ENVIRONMENT SETUP**

### **1. Create .env File**

```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

### **2. Required Variables**

**Database:**
```env
DB_USER=grc_user
DB_PASSWORD=your-secure-password
```

**JWT:**
```env
JWT_SECRET=your-super-secret-jwt-key
```

**Service Token:**
```env
SERVICE_TOKEN=your-service-token
```

**SMTP (Notification Service):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@grc-system.com
```

---

## 🐳 **DOCKER COMMANDS**

### **Start Services**

```bash
# Development
docker-compose -f infra/docker/docker-compose.ecosystem.yml up -d

# Production
docker-compose -f infra/docker/docker-compose.production.yml up -d
```

### **Build Images**

```bash
# Build all services
docker-compose -f infra/docker/docker-compose.ecosystem.yml build

# Build specific service
docker-compose -f infra/docker/docker-compose.ecosystem.yml build bff

# Build without cache
docker-compose -f infra/docker/docker-compose.ecosystem.yml build --no-cache
```

### **View Logs**

```bash
# All services
docker-compose -f infra/docker/docker-compose.ecosystem.yml logs -f

# Specific service
docker-compose -f infra/docker/docker-compose.ecosystem.yml logs -f bff

# Last 100 lines
docker-compose -f infra/docker/docker-compose.ecosystem.yml logs --tail=100
```

### **Stop Services**

```bash
# Stop (keeps containers)
docker-compose -f infra/docker/docker-compose.ecosystem.yml stop

# Stop and remove containers
docker-compose -f infra/docker/docker-compose.ecosystem.yml down

# Stop and remove containers + volumes
docker-compose -f infra/docker/docker-compose.ecosystem.yml down -v
```

### **Restart Services**

```bash
# Restart all
docker-compose -f infra/docker/docker-compose.ecosystem.yml restart

# Restart specific service
docker-compose -f infra/docker/docker-compose.ecosystem.yml restart bff
```

### **Check Status**

```bash
# Service status
docker-compose -f infra/docker/docker-compose.ecosystem.yml ps

# Health checks
docker-compose -f infra/docker/docker-compose.ecosystem.yml ps --format json | jq '.[] | {name: .Name, status: .State}'
```

---

## 🔍 **VERIFICATION**

### **Check Service Health**

```bash
# BFF
curl http://localhost:3000/healthz

# Auth Service
curl http://localhost:3001/healthz

# Document Service
curl http://localhost:3002/healthz

# Partner Service
curl http://localhost:3003/healthz

# Notification Service
curl http://localhost:3004/healthz

# Frontend
curl http://localhost:5173  # Dev
curl http://localhost       # Production
```

### **Check Service Readiness**

```bash
# BFF
curl http://localhost:3000/readyz

# Individual services
curl http://localhost:3001/readyz
curl http://localhost:3002/readyz
# ... etc
```

### **Check Database Connection**

```bash
# Connect to PostgreSQL
docker exec -it grc-postgres-prod psql -U grc_user -d grc_ecosystem

# Or from host
psql -h localhost -U grc_user -d grc_ecosystem
```

---

## 📊 **SERVICES OVERVIEW**

| Service | Port | Health Check | Status |
|---------|------|--------------|--------|
| **Frontend** | 80/5173 | `/healthz` | ✅ |
| **BFF** | 3000 | `/healthz` | ✅ |
| **Auth Service** | 3001 | `/healthz` | ✅ |
| **Document Service** | 3002 | `/healthz` | ✅ |
| **Partner Service** | 3003 | `/healthz` | ✅ |
| **Notification Service** | 3004 | `/healthz` | ✅ |
| **GRC API** | 3000 (internal) | `/healthz` | ✅ |
| **PostgreSQL** | 5432 | `pg_isready` | ✅ |
| **Consul** | 8500 | `consul members` | ✅ |
| **RabbitMQ** | 5672, 15672 | `rabbitmq-diagnostics ping` | ✅ |

---

## 🔧 **TROUBLESHOOTING**

### **Issue: Services won't start**

**Check logs:**
```bash
docker-compose -f infra/docker/docker-compose.ecosystem.yml logs
```

**Common causes:**
- Port conflicts (check if ports are already in use)
- Missing environment variables
- Database not ready (wait for health check)

### **Issue: Database connection fails**

**Check:**
```bash
# Is PostgreSQL running?
docker-compose -f infra/docker/docker-compose.ecosystem.yml ps postgres

# Check logs
docker-compose -f infra/docker/docker-compose.ecosystem.yml logs postgres

# Verify credentials in .env
```

### **Issue: Build fails**

**Solutions:**
- Clear Docker cache: `docker system prune -a`
- Check disk space: `docker system df`
- Rebuild without cache: `docker-compose build --no-cache`

### **Issue: Services can't communicate**

**Check:**
- All services on same network: `docker network ls`
- Service names match in docker-compose
- Environment variables for service URLs

---

## 📦 **VOLUMES**

### **Persistent Data**

- `postgres_data` - Database data
- `document_storage` - Document storage
- `document_uploads` - Uploaded files
- `notification_templates` - Email templates

### **Backup Volumes**

```bash
# Backup PostgreSQL
docker run --rm -v grc-ecosystem-network_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore PostgreSQL
docker run --rm -v grc-ecosystem-network_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **Pre-Deployment Checklist**

- [ ] `.env` file configured with production values
- [ ] Strong passwords set
- [ ] JWT_SECRET changed from default
- [ ] SERVICE_TOKEN changed from default
- [ ] SMTP credentials configured
- [ ] Database migrations ready
- [ ] SSL certificates (if using HTTPS)
- [ ] Firewall rules configured
- [ ] Backup strategy in place

### **Production Considerations**

1. **Use Production Compose File:**
   ```bash
   docker-compose -f infra/docker/docker-compose.production.yml up -d
   ```

2. **Resource Limits:**
   - Services have memory/CPU limits configured
   - Adjust based on your infrastructure

3. **Restart Policies:**
   - All services set to `restart: unless-stopped`

4. **Health Checks:**
   - All services have health checks configured

5. **Monitoring:**
   - Set up monitoring (Prometheus, Grafana)
   - Configure log aggregation

---

## 📝 **DEPLOYMENT SCRIPTS**

### **PowerShell Script Options**

```powershell
# Deploy development
.\scripts\deploy-docker.ps1 -Environment dev -Build

# Deploy production
.\scripts\deploy-docker.ps1 -Environment production -Build

# Stop services
.\scripts\deploy-docker.ps1 -Stop

# Remove services and volumes
.\scripts\deploy-docker.ps1 -Remove
```

### **Bash Script Usage**

```bash
# Deploy development
./scripts/deploy-docker.sh dev true

# Deploy production
./scripts/deploy-docker.sh production true

# Just start (no build)
./scripts/deploy-docker.sh dev
```

---

## ✅ **DEPLOYMENT CHECKLIST**

- [ ] Docker and Docker Compose installed
- [ ] `.env` file created and configured
- [ ] Ports available and not in use
- [ ] Docker has sufficient resources
- [ ] All services built successfully
- [ ] All services started and healthy
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] Services accessible via browser/API

---

## 🎯 **NEXT STEPS AFTER DEPLOYMENT**

1. **Verify Services:**
   - Check all health endpoints
   - Test API endpoints
   - Access frontend

2. **Run Migrations:**
   ```bash
   # Migrations run automatically on postgres startup
   # Or manually:
   docker exec -it grc-postgres-prod psql -U grc_user -d grc_ecosystem -f /docker-entrypoint-initdb.d/013_create_partner_tables.sql
   ```

3. **Configure Monitoring:**
   - Set up Prometheus/Grafana
   - Configure log aggregation
   - Set up alerts

4. **Set Up Backups:**
   - Database backups
   - Volume backups
   - Document storage backups

---

**Status:** ✅ **Ready to Deploy**  
**All Dockerfiles and deployment scripts created!**

