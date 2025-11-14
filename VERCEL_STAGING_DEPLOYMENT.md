# Vercel Staging Deployment Guide

**Target**: Deploy 10 production-ready pages to Vercel for staging
**Timeline**: 15-30 minutes
**Status**: ✅ Frontend ready, backend needs setup

---

## Quick Deployment (3 Steps)

### Step 1: Prepare Frontend (5 minutes)

```bash
# 1. Create vercel.json in project root
cd d:\Projects\GRC-Master\Assessmant-GRC

cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "grc-platform-staging",
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend.vercel.app/api"
  },
  "buildCommand": "cd apps/web && npm install && npm run build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "cd apps/web && npm install"
}
EOF

# 2. Update package.json for Vercel
cd apps/web
npm pkg set scripts.vercel-build="vite build"
```

### Step 2: Deploy to Vercel (5 minutes)

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to staging
cd d:\Projects\GRC-Master\Assessmant-GRC
vercel --prod=false

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? [Your account]
# - Link to existing project? N
# - Project name? grc-platform-staging
# - Directory? ./
# - Override settings? N
```

**Option B: Using Vercel Web Dashboard**

1. Go to https://vercel.com/new
2. Import Git Repository (GitHub/GitLab/Bitbucket)
3. Or drag & drop the `apps/web` folder
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

### Step 3: Configure Environment Variables (5 minutes)

In Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Frontend Environment Variables
VITE_API_URL=https://your-backend-url.com/api
NODE_ENV=staging
```

Then redeploy:
```bash
vercel --prod
```

---

## Backend Deployment Options

### Option 1: Vercel Serverless Functions (Recommended for Staging)

**Pros**:
- Fast deployment
- No infrastructure management
- Auto-scaling
- Free tier available

**Cons**:
- 10-second timeout limit
- Stateless (need external Redis/DB)

**Setup**:

```bash
# 1. Create API directory
mkdir -p api

# 2. Create serverless function for auth
cat > api/auth/login.js << 'EOF'
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // DEMO MODE: Accept demo credentials
  if (email === 'demo@shahin-ai.com' && password === 'Shahin@2025') {
    const user = {
      id: 'demo-user-123',
      email: 'demo@shahin-ai.com',
      firstName: 'Demo',
      lastName: 'User',
      tenantId: 'demo-tenant',
      roles: ['admin']
    };

    const token = jwt.sign(
      user,
      process.env.JWT_SECRET || 'staging-secret-change-in-production',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      data: {
        user,
        token,
        expiresIn: 86400
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid credentials'
  });
};
EOF

# 3. Create /me endpoint
cat > api/auth/me.js << 'EOF'
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token required'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'staging-secret-change-in-production'
    );

    return res.status(200).json({
      success: true,
      data: {
        user: decoded
      }
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
};
EOF

# 4. Update vercel.json to include API
cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "grc-platform-staging",
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/auth/login", "dest": "/api/auth/login.js" },
    { "src": "/api/auth/me", "dest": "/api/auth/me.js" },
    { "src": "/assets/(.*)", "dest": "/assets/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "env": {
    "JWT_SECRET": "@jwt-secret-staging",
    "FRONTEND_URL": "https://your-staging-url.vercel.app"
  }
}
EOF
```

---

### Option 2: Separate Backend on Railway/Render

**Railway** (Recommended for full BFF):

```bash
# 1. Create railway.toml
cat > railway.toml << 'EOF'
[build]
builder = "NIXPACKS"
buildCommand = "cd apps/bff && npm install"

[deploy]
startCommand = "cd apps/bff && npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[environmentVariables]]
name = "PORT"
value = "3001"
EOF

# 2. Deploy to Railway
npx @railway/cli login
npx @railway/cli init
npx @railway/cli up

# Get backend URL
npx @railway/cli status
```

**Render**:

1. Go to https://render.com
2. New → Web Service
3. Connect Git repo
4. Configure:
   - **Name**: grc-bff-staging
   - **Root Directory**: `apps/bff`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables
6. Deploy

---

### Option 3: Backend on Vercel (Full BFF)

**Note**: Not recommended due to serverless limitations, but possible:

```bash
# Create vercel.json for BFF
cat > apps/bff/vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ]
}
EOF

# Deploy separately
cd apps/bff
vercel --prod=false
```

---

## Recommended Staging Architecture

```
┌─────────────────────────────────────┐
│   Vercel Frontend (Static)          │
│   - 10 Pages                         │
│   - React + Vite                     │
│   - Auto-scaling                     │
│   URL: grc-staging.vercel.app        │
└──────────────┬──────────────────────┘
               │
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│   Backend Options:                   │
│                                      │
│   A) Vercel Serverless (Demo/Quick) │
│      - api/auth/*.js                 │
│      - 10s timeout                   │
│                                      │
│   B) Railway (Full Backend)          │
│      - Full BFF with all features    │
│      - PostgreSQL included           │
│      - Persistent connections        │
│                                      │
│   C) Render (Alternative)            │
│      - Full BFF                      │
│      - Free tier available           │
└─────────────────────────────────────┘
```

---

## Environment Variables Setup

### Frontend (Vercel Project Settings)

```bash
# Staging
VITE_API_URL=https://your-backend.railway.app/api
NODE_ENV=staging

# Production (when ready)
VITE_API_URL=https://api.yourdomain.com/api
NODE_ENV=production
```

### Backend (Railway/Render)

```bash
# Required
PORT=3001
JWT_SECRET=your-super-secret-staging-key-32-chars-minimum
JWT_REFRESH_SECRET=different-secret-for-refresh-32-chars-min
DATABASE_URL=postgresql://user:pass@host:5432/grc_staging

# Optional
NODE_ENV=staging
BYPASS_AUTH=false  # Disable in staging
FRONTEND_URL=https://grc-staging.vercel.app
REDIS_URL=redis://host:6379

# Services (if using)
GRC_API_URL=http://localhost:3000
```

---

## Quick Staging Deployment Steps

### Fastest Path (15 minutes)

**1. Deploy Frontend to Vercel (5 min)**

```bash
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\web

# Create vercel.json
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
EOF

# Deploy
npx vercel --prod=false

# Copy the URL (e.g., grc-web-abc123.vercel.app)
```

**2. Deploy Backend to Railway (10 min)**

```bash
cd ../bff

# Create .env
cat > .env << 'EOF'
PORT=3001
JWT_SECRET=staging-jwt-secret-change-before-production-32chars
JWT_REFRESH_SECRET=staging-refresh-secret-32-characters-minimum
NODE_ENV=staging
BYPASS_AUTH=false
EOF

# Deploy to Railway
npx @railway/cli login
npx @railway/cli init
npx @railway/cli up

# Copy backend URL (e.g., grc-bff.railway.app)
```

**3. Update Frontend Environment (2 min)**

```bash
# In Vercel Dashboard
# Project → Settings → Environment Variables
# Add:
VITE_API_URL=https://grc-bff.railway.app/api

# Redeploy
npx vercel --prod
```

**Done!** ✅ Your staging environment is live.

---

## Testing Staging Deployment

### 1. Test Frontend

```bash
# Visit your Vercel URL
https://your-project.vercel.app

# Should show login page
# Try demo credentials:
Email: demo@shahin-ai.com
Password: Shahin@2025
```

### 2. Test Backend API

```bash
# Test health endpoint
curl https://your-backend.railway.app/healthz

# Test login
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@shahin-ai.com","password":"Shahin@2025"}'

# Should return token
```

### 3. Test Protected Pages

1. Login at `/login`
2. Navigate to `/app` → Should load dashboard
3. Test all 10 pages:
   - `/app/users`
   - `/app/compliance`
   - `/app/regulators`
   - `/app/reports`
   - `/app/evidence`
   - `/app/documents`
   - `/app/auto-assessment`
   - `/app/risks`
   - `/app/dashboard/v2`

---

## Security Checklist for Staging

- [ ] **Remove hardcoded credentials** from frontend code
- [ ] **Set strong JWT secrets** (not the examples)
- [ ] **Enable HTTPS only** (Vercel does this automatically)
- [ ] **Set CORS to specific origins** (not `*`)
- [ ] **Disable auth bypass** (`BYPASS_AUTH=false`)
- [ ] **Use environment variables** for all secrets
- [ ] **Enable rate limiting** on backend
- [ ] **Add monitoring** (Vercel Analytics, Sentry)

---

## Cost Estimate (Staging)

### Vercel (Frontend)
- **Free Tier**: 100 GB bandwidth/month
- **Pro**: $20/month (unlimited team members)
- **Recommendation**: Start with Free tier

### Railway (Backend)
- **Free Tier**: $5 credit/month
- **Developer**: $5/month after credit
- **Recommendation**: Developer plan ($5/month)

### Render (Alternative Backend)
- **Free Tier**: Available (sleeps after 15min inactive)
- **Starter**: $7/month (always on)
- **Recommendation**: Free tier for testing, Starter for real staging

**Total Staging Cost**: $0-12/month

---

## Monitoring & Debugging

### Vercel Dashboard
- **Deployments**: View build logs
- **Analytics**: Page views, performance
- **Functions**: Serverless function logs (if using)

### Railway Dashboard
- **Logs**: Real-time backend logs
- **Metrics**: CPU, memory, network
- **Database**: PostgreSQL metrics

### Quick Debug Commands

```bash
# View Vercel logs
npx vercel logs

# View Railway logs
npx @railway/cli logs

# Test API locally first
cd apps/bff
npm start
# Then test at http://localhost:3001
```

---

## Rollback Plan

### Frontend Rollback
```bash
# In Vercel Dashboard
# Deployments → Previous deployment → Promote to Production
```

### Backend Rollback
```bash
# Railway
npx @railway/cli rollback

# Or redeploy previous version
git checkout <previous-commit>
npx @railway/cli up
```

---

## Next Steps After Staging

1. **Share staging URL** with team for testing
2. **Collect feedback** on the 10 pages
3. **Fix any bugs** found in staging
4. **Add remaining pages** (Phase 2: 6 pages, Phase 3: 10 pages)
5. **Plan production deployment**
6. **Set up custom domain**
7. **Add production database**
8. **Enable monitoring** (Sentry, LogRocket)

---

## Troubleshooting

### Frontend doesn't load
- Check build logs in Vercel dashboard
- Verify `outputDirectory` is `dist`
- Check browser console for errors

### API calls fail
- Verify `VITE_API_URL` environment variable
- Check CORS settings on backend
- Test API directly with curl

### Login doesn't work
- Check backend logs
- Verify JWT secrets are set
- Test `/api/auth/login` endpoint directly

### Pages show errors
- Check browser console
- Verify all environment variables are set
- Test locally first with `npm run preview`

---

## Quick Commands Reference

```bash
# Deploy frontend to Vercel
cd apps/web
npx vercel --prod=false

# Deploy backend to Railway
cd apps/bff
npx @railway/cli up

# View logs
npx vercel logs                 # Frontend
npx @railway/cli logs           # Backend

# Redeploy
npx vercel --prod               # Frontend
npx @railway/cli up --detach    # Backend

# Environment variables
npx vercel env add              # Frontend
npx @railway/cli variables set  # Backend
```

---

## Success Criteria

✅ **Staging is successful when**:
- Frontend loads at Vercel URL
- Login works with demo credentials
- All 10 pages are accessible
- API calls work (or show proper errors)
- Dark mode toggle works
- Responsive on mobile
- No console errors (or only expected API errors)

---

**Ready to deploy?** Start with Step 1 above! 🚀

**Estimated Time**: 15-30 minutes total
**Cost**: Free - $12/month
**Difficulty**: Easy (mostly clicking and copy/paste)

---

*Last Updated: 2025-11-14*
*For Production Deployment, see: PRODUCTION_DEPLOYMENT_CHECKLIST.md*
