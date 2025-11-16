# Docker Setup Guide for Shahin GRC Landing Page

This guide explains how to build and run the landing page application in Docker for production.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)
- Windows PowerShell or Git Bash

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```powershell
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at: **http://localhost:4000**

### Option 2: Using Docker Directly

```powershell
# Navigate to landing-page directory
cd landing-page

# Build the image
docker build -t shahin-landing-page:latest -f Dockerfile .

# Run the container
docker run -d -p 4000:80 --name shahin-landing shahin-landing-page:latest

# View logs
docker logs -f shahin-landing

# Stop the container
docker stop shahin-landing
docker rm shahin-landing
```

### Option 3: Using Build Scripts

**Windows (PowerShell):**
```powershell
cd landing-page
.\build-production.ps1
```

**Linux/Mac (Bash):**
```bash
cd landing-page
chmod +x build-production.sh
./build-production.sh
```

## Production Build Process

The Dockerfile uses a multi-stage build:

1. **Builder Stage**: 
   - Uses Node.js 18 Alpine
   - Installs dependencies
   - Builds the React app using Vite

2. **Production Stage**:
   - Uses Nginx Alpine (lightweight web server)
   - Copies built files from builder stage
   - Configures Nginx with optimized settings

## Environment Variables

Create a `.env` file in the `landing-page` directory if you need to customize:

```env
VITE_API_URL=https://your-api-url.com/api
VITE_FRONTEND_URL=https://your-frontend-url.com
```

**Note**: For production builds, environment variables must start with `VITE_` to be included in the build.

## Build Optimization

The production build includes:

- ✅ Minified JavaScript and CSS
- ✅ Code splitting and chunk optimization
- ✅ Removed console.log statements
- ✅ Gzip compression enabled
- ✅ Static asset caching (1 year)
- ✅ SPA routing support
- ✅ Health check endpoint at `/health`

## Verifying the Build

After starting the container, verify it's working:

1. **Health Check**: http://localhost:4000/health
   - Should return "healthy"

2. **Application**: http://localhost:4000
   - Should display the landing page

3. **Check Container Status**:
   ```powershell
   docker ps
   ```
   - Container should show "Up" status

## Troubleshooting

### Container won't start

```powershell
# Check container logs
docker logs shahin-landing

# Check if port 4000 is already in use
netstat -ano | findstr :4000
```

### Build fails

```powershell
# Clean Docker build cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t shahin-landing-page:latest -f Dockerfile .
```

### Changes not reflecting

1. Rebuild the image: `docker-compose build`
2. Restart the container: `docker-compose up -d`
3. Clear browser cache

## File Structure

```
landing-page/
├── Dockerfile              # Multi-stage production Dockerfile
├── .dockerignore           # Files excluded from Docker build
├── nginx.conf             # Nginx configuration
├── package.json           # Dependencies and scripts
├── vite.config.js        # Vite build configuration (optimized)
├── build-production.ps1   # Windows build script
├── build-production.sh    # Linux/Mac build script
└── ...                    # Source files
```

## Production Deployment

### For Azure Container Apps

```powershell
# Build and tag for Azure Container Registry
docker build -t <acr-name>.azurecr.io/shahin-landing:latest -f landing-page/Dockerfile ./landing-page
docker push <acr-name>.azurecr.io/shahin-landing:latest

# Update Container App
az containerapp update \
    --name shahin-landing-prod \
    --resource-group <resource-group> \
    --image <acr-name>.azurecr.io/shahin-landing:latest
```

### For Other Platforms

The Docker image can be deployed to:
- AWS ECS/Fargate
- Google Cloud Run
- DigitalOcean App Platform
- Any Docker-compatible platform

## Performance Notes

- **Image Size**: ~50-60MB (Alpine-based)
- **Build Time**: ~2-5 minutes (depending on system)
- **Memory Usage**: ~20-30MB at runtime
- **Startup Time**: <1 second

## Security

The production build includes:
- Security headers (XSS protection, frame options, etc.)
- Content Security Policy
- HTTPS redirect headers (for production use)
- No debug information in production builds

## Support

For issues or questions:
- Check container logs: `docker logs shahin-landing`
- Review build output for errors
- Verify Docker is running: `docker info`

---

**Last Updated**: November 2025  
**Maintained by**: DoganConsult

