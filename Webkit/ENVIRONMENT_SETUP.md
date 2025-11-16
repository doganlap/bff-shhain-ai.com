# Environment Variables Setup

## Docker Build with Environment Variables

The Docker setup now supports environment variables that are baked into the build.

### Environment Variables Required

```env
VITE_API_URL=https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api
VITE_FRONTEND_URL=https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io
```

### Using with Docker Compose

Environment variables can be passed during build:

```powershell
# Set environment variables
$env:VITE_API_URL = "https://your-backend-url.com/api"
$env:VITE_FRONTEND_URL = "https://your-frontend-url.com"

# Build and run
docker-compose up -d --build
```

Or create a `.env` file in the project root:
```
VITE_API_URL=https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api
VITE_FRONTEND_URL=https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io
```

### Using with Docker Directly

```powershell
cd landing-page
docker build \
  --build-arg VITE_API_URL="https://your-backend-url.com/api" \
  --build-arg VITE_FRONTEND_URL="https://your-frontend-url.com" \
  -t shahin-landing-page:latest \
  -f Dockerfile .
```

### Default Values

If environment variables are not provided, the Dockerfile uses these defaults:
- `VITE_API_URL`: `https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api`
- `VITE_FRONTEND_URL`: `https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io`

## HTTPS Configuration

The nginx configuration includes:
- ✅ HTTPS redirect support (when behind reverse proxy)
- ✅ Security headers
- ✅ Health check endpoint
- ✅ SPA routing support

## Section Navigation

All sections are properly wired with IDs matching navigation:
- ✅ `hero` - Hero section
- ✅ `trust` - Trust Bar
- ✅ `vision` - Vision section
- ✅ `interactive-3d-cards` - Interactive 3D Cards
- ✅ `ai-team` - AI Team Showcase
- ✅ `competitive-advantage` - Competitive Advantage
- ✅ `target-sectors` - Target Sectors
- ✅ `dashboard` - Dashboard Preview
- ✅ `transformation` - Transformation Story
- ✅ `platform-demo` - Platform Demo
- ✅ `parallax` - Parallax Section
- ✅ `pricing` - Pricing
- ✅ `faq` - FAQ
- ✅ `final-cta` - Final CTA

