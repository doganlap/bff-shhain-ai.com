# GRC Assessment App - Docker Setup Guide

This guide will help you build and run the GRC Assessment application in Docker Desktop.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (comes with Docker Desktop)
- At least 4GB of available RAM
- Ports 80, 443, and 5001 available on your system

## Quick Start

### Option 1: Automated Script (Recommended)

1. **Make the script executable:**
   ```bash
   chmod +x docker-build.sh
   ```

2. **Run the build script:**
   ```bash
   ./docker-build.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:5001
   - Health Check: http://localhost:5001/api/health

### Option 2: Manual Build

1. **Create necessary directories:**
   ```bash
   mkdir -p uploads logs ssl
   ```

2. **Build the Docker images:**
   ```bash
   docker-compose build --no-cache
   ```

3. **Start the services:**
   ```bash
   docker-compose up -d
   ```

4. **Check service status:**
   ```bash
   docker-compose ps
   ```

5. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## Architecture

The application consists of three main services:

### 1. PostgreSQL Database (`grc-postgres`)
- **Image**: postgres:15-alpine
- **Port**: 5432 (internal only)
- **Database**: grc_template
- **Credentials**: grc_user / grc_secure_password_2024
- **Volume**: postgres_data (persistent storage)

### 2. GRC Application (`grc-app`)
- **Built from**: Dockerfile (multi-stage build)
- **Port**: 5001
- **Environment**: Production-ready Node.js app
- **Features**: Health checks, rate limiting, security headers

### 3. Nginx Reverse Proxy (`grc-nginx`)
- **Image**: nginx:alpine
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**: Load balancing, rate limiting, security headers, caching

## Configuration

### Environment Variables

The application uses the following environment variables (configured in `docker-compose.yml`):

```yaml
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=grc_template
DB_USER=grc_user
DB_PASSWORD=grc_secure_password_2024

# Server Configuration
PORT=5001
NODE_ENV=production
API_BASE_URL=http://localhost:5001

# Security
JWT_SECRET=grc_jwt_secret_key_shahin_ai_2024_secure
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
```

### Volumes

- **postgres_data**: Persistent PostgreSQL data
- **uploads**: File uploads directory (mounted)
- **logs**: Application logs (mounted)
- **ssl**: SSL certificates (mounted, optional)

## Management Commands

### Service Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View service status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Rebuild specific service
docker-compose build [service-name]

# Scale services
docker-compose up -d --scale grc-app=3
```

### Database Management
```bash
# Connect to database
docker-compose exec postgres psql -U grc_user -d grc_template

# Backup database
docker-compose exec postgres pg_dump -U grc_user -d grc_template > backup.sql

# Restore database
docker-compose exec -T postgres psql -U grc_user -d grc_template < backup.sql
```

### Application Management
```bash
# Access application shell
docker-compose exec grc-app sh

# View application logs
docker-compose logs -f grc-app

# Restart application
docker-compose restart grc-app
```

## Security Features

### Built-in Security
- **Helmet.js**: Security headers
- **Rate Limiting**: API and authentication endpoints
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Joi validation middleware
- **CORS**: Configured for security
- **SQL Injection Protection**: Parameterized queries

### Nginx Security
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Rate Limiting**: Per-IP request limits
- **Gzip Compression**: Optimized responses
- **Access Logging**: Request monitoring

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using the ports
   netstat -an | grep :80
   netstat -an | grep :443
   netstat -an | grep :5001
   
   # Or use different ports in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test database connection
   docker-compose exec postgres pg_isready -U grc_user -d grc_template
   ```

3. **Application Won't Start**
   ```bash
   # Check application logs
   docker-compose logs grc-app
   
   # Test health endpoint
   curl http://localhost:5001/api/health
   ```

4. **Frontend Issues**
   ```bash
   # Check nginx logs
   docker-compose logs nginx
   
   # Test frontend access
   curl http://localhost
   ```

### Performance Tuning

1. **Increase memory limits** in docker-compose.yml:
   ```yaml
   services:
     grc-app:
       deploy:
         resources:
           limits:
             memory: 1G
           reservations:
             memory: 512M
   ```

2. **Scale the application**:
   ```bash
   docker-compose up -d --scale grc-app=3
   ```

## Monitoring

### Health Checks
- Application: http://localhost:5001/api/health
- Database: `docker-compose exec postgres pg_isready -U grc_user -d grc_template`
- Services: `docker-compose ps`

### Logs
- Application logs: `docker-compose logs -f grc-app`
- Database logs: `docker-compose logs -f postgres`
- Nginx logs: `docker-compose logs -f nginx`

### Metrics
- Container stats: `docker stats`
- Resource usage: `docker system df`

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U grc_user -d grc_template > grc_backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with compression
docker-compose exec postgres pg_dump -U grc_user -d grc_template | gzip > grc_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Application Data Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploads/
```

### Recovery
```bash
# Restore database
docker-compose exec -T postgres psql -U grc_user -d grc_template < backup.sql

# Restore uploads
tar -xzf uploads_backup.tar.gz
```

## Production Deployment

For production deployment, consider:

1. **SSL/TLS**: Add SSL certificates to the ssl/ directory
2. **Environment Variables**: Use Docker secrets for sensitive data
3. **Monitoring**: Add monitoring tools like Prometheus/Grafana
4. **Backup Strategy**: Implement automated backups
5. **Security**: Regular security updates and vulnerability scanning

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify service status: `docker-compose ps`
3. Test health endpoints
4. Review this documentation
5. Check Docker Desktop for container status

For additional support, check the application logs and Docker Desktop interface.