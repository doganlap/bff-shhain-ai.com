# 🚀 Quick Docker Start Guide for GRC Assessment App

## Option 1: Using Docker Desktop GUI (Recommended)

### Step 1: Open Docker Desktop
1. Launch Docker Desktop on your Windows machine
2. Make sure Docker is running (you'll see the Docker icon in your system tray)

### Step 2: Build and Run Using Docker Desktop
1. **Open PowerShell or Command Prompt** in your project directory
2. **Run the Windows batch file:**
   ```cmd
   docker-build.bat
   ```

### Step 3: Monitor in Docker Desktop
1. Open Docker Desktop interface
2. Go to **Containers** tab
3. You'll see your GRC Assessment containers running
4. Click on containers to view logs, stats, and manage them

## Option 2: Manual Docker Commands

### Step 1: Prepare Environment
```cmd
# Create necessary directories
mkdir uploads logs ssl

# Build the application
docker compose build

# Start all services
docker compose up -d

# Check if services are running
docker compose ps
```

### Step 2: Access Your Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

### Step 3: Monitor Logs
```cmd
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f grc-app
docker compose logs -f postgres
docker compose logs -f nginx
```

## Option 3: Using Docker Desktop Compose

### Step 1: Open Docker Desktop
1. Launch Docker Desktop
2. Click on **Containers** in the left sidebar

### Step 2: Import Compose File
1. Click **"Create container from Docker Compose"**
2. Select your `docker-compose.yml` file
3. Click **"Create"**

### Step 3: Manage Your Stack
1. Docker Desktop will create all containers automatically
2. Monitor status, logs, and resource usage
3. Start/stop containers as needed

## 🎯 Access Points

Once running, access your application at:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost | Main application interface |
| Backend API | http://localhost:5001 | API endpoints |
| Health Check | http://localhost:5001/api/health | System health status |
| Database | localhost:5432 | PostgreSQL (internal only) |

## 🔧 Docker Desktop Management

### Viewing Containers
1. Open Docker Desktop
2. Click **Containers** in left sidebar
3. You'll see all your GRC Assessment containers:
   - `grc-postgres` - Database
   - `grc-app` - Application
   - `grc-nginx` - Reverse proxy

### Monitoring Performance
1. Click on any container
2. View **Stats** tab for CPU, memory, network usage
3. View **Logs** tab for application logs
4. View **Inspect** tab for detailed configuration

### Managing Services
- **Start/Stop**: Use the play/pause buttons
- **Restart**: Click restart button
- **Delete**: Click delete button (removes container)
- **View Logs**: Click on container name

## 🚨 Troubleshooting in Docker Desktop

### Container Won't Start
1. Check Docker Desktop **Containers** tab
2. Click on the failed container
3. View **Logs** for error messages
4. Common issues:
   - Port conflicts: Check if ports 80, 443, 5001 are available
   - Memory issues: Increase Docker Desktop memory allocation

### Database Connection Issues
1. Check `grc-postgres` container logs
2. Verify database is healthy in Docker Desktop
3. Test connection: `docker compose exec postgres pg_isready -U grc_user -d grc_template`

### Application Issues
1. Check `grc-app` container logs
2. Verify health endpoint: http://localhost:5001/api/health
3. Check environment variables in Docker Desktop

## 📊 Docker Desktop Features

### Resource Monitoring
- **CPU Usage**: View real-time CPU consumption
- **Memory Usage**: Monitor memory allocation
- **Disk Usage**: Track storage consumption
- **Network**: Monitor network I/O

### Container Management
- **Start/Stop**: Control container lifecycle
- **Restart**: Restart containers individually
- **Logs**: Real-time log viewing with search
- **Exec**: Run commands inside containers
- **Files**: Browse container filesystem

### Stack Management
- **Compose**: Manage multi-container applications
- **Volumes**: Manage persistent storage
- **Networks**: Manage container networking
- **Images**: Manage Docker images

## 🎉 Success Indicators

Your GRC Assessment app is successfully running when:

1. ✅ All containers show "Running" status in Docker Desktop
2. ✅ Health check returns healthy: http://localhost:5001/api/health
3. ✅ Frontend loads: http://localhost
4. ✅ No error logs in container logs
5. ✅ Database is accessible (internal connection)

## 🔄 Next Steps

1. **Customize**: Modify configuration in `docker-compose.yml`
2. **Scale**: Scale services using Docker Desktop or `docker compose up --scale`
3. **Update**: Rebuild with `docker compose build` when code changes
4. **Backup**: Set up automated backups (see DOCKER_SETUP.md)
5. **Monitor**: Set up monitoring and alerting

## 📞 Support

If you encounter issues:
1. Check Docker Desktop container logs
2. Verify all services are running
3. Check the troubleshooting section in `DOCKER_SETUP.md`
4. Ensure Docker Desktop has sufficient resources allocated

**Happy containerizing! 🐳**