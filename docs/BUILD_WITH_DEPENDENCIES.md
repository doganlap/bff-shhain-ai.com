# 🏗️ **BUILD WITH ALL DEPENDENCIES - Complete Guide**

**Date:** 2025-01-10  
**Status:** ✅ **Ready to Build**

---

## 📋 **PREREQUISITES**

### **Required Software:**
- ✅ Node.js 18+ (for local development)
- ✅ Docker & Docker Compose (for containerized build)
- ✅ PostgreSQL 15+ (or use Docker)
- ✅ Git

### **Optional:**
- Consul (for service discovery)
- RabbitMQ (for event bus)

---

## 🚀 **QUICK START - Build Everything**

### **Option 1: Docker Compose (Recommended)**

```bash
# 1. Navigate to project root
cd D:\Projects\GRC-Master\Assessmant-GRC

# 2. Copy environment file
cp .env.example .env

# 3. Update .env with your values
# Edit .env file

# 4. Build and start all services
docker-compose -f infra/docker/docker-compose.ecosystem.yml up --build
```

### **Option 2: Build Scripts**

**PowerShell (Windows):**
```powershell
.\scripts\build-all.ps1
```

**Bash (Linux/Mac):**
```bash
chmod +x scripts/build-all.sh
./scripts/build-all.sh
```

### **Option 3: Manual Build**

```bash
# Build each service
cd apps/bff && npm install && cd ../..
cd apps/services/auth-service && npm install && cd ../../..
cd apps/services/document-service && npm install && cd ../../..
cd apps/services/partner-service && npm install && cd ../../..
cd apps/services/notification-service && npm install && cd ../../..
cd apps/services/grc-api && npm install && cd ../../..
cd apps/web && npm install && cd ../..
```

---

## 📦 **SERVICES TO BUILD**

### **1. BFF (Backend for Frontend)**
**Location:** `apps/bff/`  
**Port:** 3000  
**Dependencies:**
- express
- http-proxy-middleware
- cors, helmet, morgan
- express-rate-limit
- axios

**Build:**
```bash
cd apps/bff
npm install
```

---

### **2. Auth Service**
**Location:** `apps/services/auth-service/`  
**Port:** 3001  
**Dependencies:**
- express
- bcryptjs
- jsonwebtoken
- pg (PostgreSQL)
- @azure/msal-node
- uuid

**Build:**
```bash
cd apps/services/auth-service
npm install
```

---

### **3. Document Service**
**Location:** `apps/services/document-service/`  
**Port:** 3002  
**Dependencies:**
- express
- multer
- pdf-parse
- mammoth
- sharp
- pg

**Build:**
```bash
cd apps/services/document-service
npm install
```

**Note:** Requires system dependencies for image processing (handled in Dockerfile)

---

### **4. Partner Service**
**Location:** `apps/services/partner-service/`  
**Port:** 3003  
**Dependencies:**
- express
- pg
- uuid

**Build:**
```bash
cd apps/services/partner-service
npm install
```

---

### **5. Notification Service**
**Location:** `apps/services/notification-service/`  
**Port:** 3004  
**Dependencies:**
- express
- nodemailer
- handlebars
- pg

**Build:**
```bash
cd apps/services/notification-service
npm install
```

---

### **6. GRC API**
**Location:** `apps/services/grc-api/`  
**Port:** 3000 (internal)  
**Dependencies:** (Many - see package.json)

**Build:**
```bash
cd apps/services/grc-api
npm install
```

---

### **7. Frontend Web**
**Location:** `apps/web/`  
**Port:** 5173  
**Dependencies:**
- react, react-dom
- vite
- @tanstack/react-query
- react-router-dom
- @azure/msal-react
- tailwindcss
- And many more...

**Build:**
```bash
cd apps/web
npm install
```

---

## 🐳 **DOCKER BUILD**

### **All Services with Docker Compose:**

```bash
# Build all services
docker-compose -f infra/docker/docker-compose.ecosystem.yml build

# Start all services
docker-compose -f infra/docker/docker-compose.ecosystem.yml up

# Build and start in one command
docker-compose -f infra/docker/docker-compose.ecosystem.yml up --build
```

### **Individual Service Build:**

```bash
# Build specific service
docker build -f apps/bff/Dockerfile.dev -t grc-bff apps/bff/
docker build -f apps/services/auth-service/Dockerfile.dev -t grc-auth-service apps/services/auth-service/
# ... etc
```

---

## ⚙️ **ENVIRONMENT SETUP**

### **1. Root .env File**
```bash
cp .env.example .env
# Edit .env with your values
```

### **2. Service-Specific .env Files (Optional)**
```bash
# Each service can have its own .env
cp apps/bff/.env.example apps/bff/.env
cp apps/services/auth-service/.env.example apps/services/auth-service/.env
# ... etc
```

### **3. Required Environment Variables:**

**Database:**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

**JWT:**
- `JWT_SECRET` (change in production!)

**Service Token:**
- `SERVICE_TOKEN` (for service-to-service auth)

**SMTP (Notification Service):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`

---

## 📊 **BUILD ORDER**

### **Recommended Build Order:**

1. **Database** (PostgreSQL)
   ```bash
   docker-compose -f infra/docker/docker-compose.ecosystem.yml up postgres -d
   ```

2. **Core Services** (in parallel)
   - Auth Service
   - GRC API
   - Document Service

3. **New Services**
   - Partner Service
   - Notification Service

4. **BFF** (depends on all services)
   ```bash
   docker-compose -f infra/docker/docker-compose.ecosystem.yml up bff -d
   ```

5. **Frontend** (depends on BFF)
   ```bash
   docker-compose -f infra/docker/docker-compose.ecosystem.yml up web -d
   ```

---

## ✅ **VERIFICATION**

### **Check Service Health:**

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
curl http://localhost:5173
```

### **Check Service Readiness:**

```bash
# BFF readiness (checks all services)
curl http://localhost:3000/readyz

# Individual service readiness
curl http://localhost:3001/readyz
curl http://localhost:3002/readyz
# ... etc
```

---

## 🔧 **TROUBLESHOOTING**

### **Issue: npm install fails**
**Solution:**
- Check Node.js version (need 18+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then retry

### **Issue: Docker build fails**
**Solution:**
- Check Docker is running
- Check disk space
- Try: `docker system prune` to free space

### **Issue: Database connection fails**
**Solution:**
- Check PostgreSQL is running
- Verify environment variables
- Check network connectivity

### **Issue: Service can't connect to other services**
**Solution:**
- Verify service URLs in environment
- Check Docker network: `docker network ls`
- Ensure services are on same network

---

## 📦 **DEPENDENCY SUMMARY**

| Service | Node Dependencies | System Dependencies |
|---------|-------------------|---------------------|
| **BFF** | 7 packages | None |
| **Auth Service** | 11 packages | None |
| **Document Service** | 12 packages | Python3, Image libs |
| **Partner Service** | 9 packages | None |
| **Notification Service** | 10 packages | None |
| **GRC API** | 25+ packages | None |
| **Frontend** | 30+ packages | None |

**Total:** ~100+ npm packages across all services

---

## 🎯 **NEXT STEPS AFTER BUILD**

1. **Run Database Migrations:**
   ```bash
   # Migrations run automatically on postgres startup
   # Or manually:
   psql -h localhost -U grc_user -d grc_ecosystem -f infra/db/migrations/013_create_partner_tables.sql
   ```

2. **Start All Services:**
   ```bash
   docker-compose -f infra/docker/docker-compose.ecosystem.yml up
   ```

3. **Access Services:**
   - Frontend: http://localhost:5173
   - BFF: http://localhost:3000
   - Consul UI: http://localhost:8500
   - RabbitMQ UI: http://localhost:15672

4. **Run Tests:**
   ```bash
   cd apps/services/grc-api
   npm test
   ```

---

## ✅ **BUILD CHECKLIST**

- [ ] Node.js 18+ installed
- [ ] Docker & Docker Compose installed
- [ ] .env files created and configured
- [ ] All services built (`npm install` in each)
- [ ] Docker images built
- [ ] Database running
- [ ] All services healthy
- [ ] Frontend accessible

---

**Status:** ✅ **Ready to Build**  
**All Dockerfiles and build scripts created!**

