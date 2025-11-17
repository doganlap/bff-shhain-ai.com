# Shahin BFF Deployment Guide

This guide provides comprehensive instructions for deploying the Shahin GRC BFF (Backend for Frontend) using containerization.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Environment variables configured
- SSL certificates (for production)

### 1. Environment Setup

```bash
# Copy environment template
cp .env.production.example .env.production

# Edit the file with your actual values
nano .env.production
```

### 2. Generate Security Keys

Generate strong secrets for production:

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate service token
openssl rand -base64 64
```

### 3. Deploy with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f bff
```

## 🔧 Configuration Options

### Database Configuration
- **Primary DB**: PostgreSQL on port 5432
- **Shadow DB**: PostgreSQL on port 5433 (for Prisma migrations)
- **Redis**: Cache and session storage on port 6379

### Health Checks
- BFF Health: `http://localhost:3005/health`
- Database Health: `http://localhost:3005/health/database`
- AI Health: `http://localhost:3005/api/ai/health`

### Scaling Options

#### Single Server Deployment
```bash
docker-compose up -d
```

#### Multi-Server Deployment
Use Docker Swarm or Kubernetes for production scaling:

```bash
# Initialize Docker Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml shahin-bff
```

## 🏗️ Production Deployment Strategies

### Strategy 1: Docker Compose (Recommended for Single Server)

**Pros:**
- Simple setup and management
- All services in one place
- Easy backup and monitoring

**Cons:**
- Single point of failure
- Limited scaling options

**Use Case:** Small to medium deployments, development/staging

### Strategy 2: Container Orchestration (Kubernetes/Docker Swarm)

**Pros:**
- High availability
- Auto-scaling
- Rolling updates
- Service discovery

**Cons:**
- Complex setup
- Higher resource requirements

**Use Case:** Large-scale production deployments

### Strategy 3: Cloud Container Services

**AWS ECS/Fargate:**
```yaml
# Example ECS task definition
family: shahin-bff
networkMode: awsvpc
requiresCompatibilities: [FARGATE]
cpu: 512
memory: 1024
```

**Google Cloud Run:**
```bash
# Deploy to Cloud Run
gcloud run deploy shahin-bff \
  --image gcr.io/your-project/shahin-bff:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Azure Container Instances:**
```bash
# Deploy to ACI
az container create \
  --resource-group shahin-rg \
  --name shahin-bff \
  --image your-registry/shahin-bff:latest \
  --ports 3005
```

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Obtain SSL Certificates**
   ```bash
   # Using Let's Encrypt
   certbot certonly --standalone -d your-domain.com
   ```

2. **Configure Nginx**
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /etc/nginx/ssl/cert.pem;
       ssl_certificate_key /etc/nginx/ssl/key.pem;
       
       location / {
           proxy_pass http://bff:3005;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Environment Security

- **Never commit secrets** to version control
- **Use secret management** (Docker secrets, Kubernetes secrets, AWS Secrets Manager)
- **Rotate keys regularly**
- **Use strong passwords** and API keys

## 📊 Monitoring and Logging

### Health Monitoring

```bash
# Check service health
curl http://localhost:3005/health

# Detailed health check
curl http://localhost:3005/health/detailed
```

### Log Management

```bash
# View real-time logs
docker-compose logs -f bff

# Export logs
docker-compose logs bff > bff-logs.txt
```

### Metrics Collection

Configure Prometheus/Grafana for metrics:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'shahin-bff'
    static_configs:
      - targets: ['bff:3005']
```

## 🔄 Deployment Workflows

### Blue-Green Deployment

```bash
# Deploy green version
docker-compose -f docker-compose.green.yml up -d

# Test green deployment
curl http://localhost:3006/health

# Switch traffic
docker-compose exec nginx nginx -s reload

# Remove blue version
docker-compose -f docker-compose.blue.yml down
```

### Rolling Updates

```bash
# Update service
docker-compose up -d --no-deps --build bff

# Verify update
docker-compose ps
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker-compose exec postgres pg_isready -U shahin_local
   
   # Check network connectivity
   docker-compose exec bff ping postgres
   ```

2. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3005
   
   # Use different ports
   PORT=3006 docker-compose up -d
   ```

3. **Memory Issues**
   ```bash
   # Check container stats
   docker stats
   
   # Increase memory limits
   docker-compose -f docker-compose.high-memory.yml up -d
   ```

### Performance Tuning

- **Database**: Configure connection pooling
- **Redis**: Set appropriate memory limits
- **Node.js**: Use PM2 for process management
- **Nginx**: Enable gzip compression and caching

## 📋 Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Security keys generated
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Rollback plan documented

## 🔗 Related Documentation

- [Docker Compose Reference](docker-compose.yml)
- [Production Environment Template](.env.production.example)
- [Original BFF Dockerfile](Dockerfile)
- [Nginx Configuration Guide](nginx.conf)