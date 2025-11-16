# Quick Docker Guide

## 🚀 Build and Run in 3 Steps

### Step 1: Build the Docker Image
```powershell
docker-compose build
```
or
```powershell
cd landing-page
docker build -t shahin-landing-page:latest -f Dockerfile .
```

### Step 2: Start the Container
```powershell
docker-compose up -d
```
or
```powershell
docker run -d -p 4000:80 --name shahin-landing shahin-landing-page:latest
```

### Step 3: Access the App
Open your browser: **http://localhost:4000**

## 📋 Common Commands

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start container in background |
| `docker-compose down` | Stop and remove container |
| `docker-compose logs -f` | View logs |
| `docker-compose ps` | Check container status |
| `docker-compose restart` | Restart container |
| `docker-compose build --no-cache` | Rebuild without cache |

## 🐛 Troubleshooting

**Port already in use?**
```powershell
# Find what's using port 4000
netstat -ano | findstr :4000

# Or use a different port in docker-compose.yml
ports:
  - "4001:80"  # Change 4000 to 4001
```

**Container not starting?**
```powershell
docker logs shahin-landing-page
```

**Need to rebuild?**
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📦 Production Build

The production build includes:
- ✅ Optimized JavaScript bundles
- ✅ Minified CSS
- ✅ Nginx web server
- ✅ Health check endpoint
- ✅ Security headers
- ✅ Gzip compression

## 📁 Files Created

- `docker-compose.yml` - Easy container orchestration
- `landing-page/.dockerignore` - Excludes unnecessary files
- `landing-page/Dockerfile` - Production build configuration (optimized)
- `landing-page/vite.config.js` - Optimized for production builds
- `landing-page/build-production.ps1` - Windows build script
- `landing-page/build-production.sh` - Linux/Mac build script

For detailed documentation, see `DOCKER_SETUP.md`

