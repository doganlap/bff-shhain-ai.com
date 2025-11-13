# 🐳 Docker Development Environment - Running

**Status:** ✅ **All Services Running**

---

## 📊 Container Status

| Service | Container | Status | Ports | Health |
|---------|-----------|--------|-------|--------|
| **PostgreSQL** | `grc-postgres-dev` | ✅ Running | `5432:5432` | ✅ Healthy |
| **Backend API** | `grc-backend-dev` | ✅ Running | `5001:5001` | ✅ Healthy |
| **Frontend (Vite)** | `grc-frontend-dev` | ✅ Running | `5173:5173` | ✅ Running |

---

## 🌐 Access URLs

### Frontend Application
- **Local:** http://localhost:5173
- **Network:** http://172.19.0.4:5173 (Docker internal)

### Backend API
- **Health Check:** http://localhost:5001/api/health ✅
- **API Base:** http://localhost:5001/api
- **API Version:** http://localhost:5001/api/version

### Database
- **Host:** localhost
- **Port:** 5432
- **Database:** grc_template
- **User:** grc_user
- **Password:** grc_secure_password_2024

---

## 🔧 Configuration

### Environment Variables

**Backend:**
- `DB_HOST=postgres`
- `DB_PORT=5432`
- `DB_NAME=grc_template`
- `DB_USER=grc_user`
- `DB_PASSWORD=grc_secure_password_2024`
- `PORT=5001`
- `NODE_ENV=development`
- `CORS_ORIGIN=http://localhost:5173,http://localhost:3000`

**Frontend:**
- `VITE_API_URL=http://backend:5001`
- `NODE_ENV=development`

---

## 📝 Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# PostgreSQL only
docker-compose logs -f postgres
```

### Rebuild After Changes
```bash
# Rebuild all
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Access Container Shell
```bash
# Backend
docker exec -it grc-backend-dev sh

# Frontend
docker exec -it grc-frontend-dev sh

# PostgreSQL
docker exec -it grc-postgres-dev psql -U grc_user -d grc_template
```

---

## ✅ Verification

### Backend Health Check
```bash
curl http://localhost:5001/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T12:17:29.768Z",
  "version": "1.0.0",
  "environment": "development",
  "database": "connected"
}
```

### Frontend Access
Open browser: http://localhost:5173

### Database Connection
```bash
docker exec -it grc-postgres-dev psql -U grc_user -d grc_template -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

---

## 🔄 Hot Reload

Both services support hot reload in development:

- **Backend:** Uses `nodemon` - automatically restarts on file changes
- **Frontend:** Uses `vite` - HMR (Hot Module Replacement) enabled

Changes to code in `./backend/` or `./frontend/` will automatically trigger reloads.

---

## 📦 Volume Mounts

### Backend
- `./backend` → `/app` (code)
- `./backend/uploads` → `/app/uploads` (file uploads)
- `./backend/logs` → `/app/logs` (logs)

### Frontend
- `./frontend` → `/app` (code)
- `/app/node_modules` (isolated node_modules)

### PostgreSQL
- `postgres_data_dev` volume (persistent data)
- `./database-schema` → `/docker-entrypoint-initdb.d` (schema initialization)

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
docker-compose logs backend

# Check database connection
docker-compose exec backend node -e "require('./config/database').testConnection()"
```

### Frontend Not Loading
```bash
# Check logs
docker-compose logs frontend

# Verify Vite is running
curl http://localhost:5173
```

### Database Connection Issues
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test connection from backend
docker-compose exec backend node -e "require('./config/database').testConnection()"
```

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5001
netstat -ano | findstr :5173
netstat -ano | findstr :5432

# Stop conflicting services or change ports in docker-compose.yml
```

---

## 🎯 Next Steps

1. ✅ **Access Frontend:** http://localhost:5173
2. ✅ **Test API:** http://localhost:5001/api/health
3. ✅ **View Logs:** `docker-compose logs -f`
4. ✅ **Make Changes:** Code changes auto-reload

---

**Last Updated:** $(date)  
**Docker Compose Version:** 3.8  
**Node Version:** 20-alpine  
**PostgreSQL Version:** 15-alpine

