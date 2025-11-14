# Vercel Deployment Summary - Complete Guide

## 🎯 You Have 2 Apps to Deploy

### 1. **Landing Page** (Marketing Website)
**Location**: `apps/web/www.shahin.com/landing-page/`
**Purpose**: Public marketing site with demo booking
**Features**:
- Hero section with CTAs
- Dashboard preview
- Transformation story (4 chapters)
- Platform demo
- Pricing
- Try Demo button
- Demo booking form
- Arabic/English bilingual
- Responsive design

**Deploy Command**:
```bash
cd "apps/web/www.shahin.com/landing-page"
npx vercel --prod=false
```

**Result**: `https://shahin-grc-landing.vercel.app`

---

### 2. **GRC Platform** (Main Application)
**Location**: `apps/web/`
**Purpose**: Full GRC application (10 production-ready pages)
**Features**:
- Dashboard (KPIs, charts, activity)
- User Management
- Compliance Tracking
- Evidence Management
- Regulators
- Reports
- Documents
- Auto Assessment
- Risk Management
- Dark mode, authentication, RBAC

**Deploy Command**:
```bash
cd "apps/web"
npx vercel --prod=false
```

**Result**: `https://grc-platform.vercel.app`

---

## 🚀 Recommended Deployment Strategy

### Phase 1: Landing Page First (15 min)

**Why First?**
- Simpler (no backend required initially)
- Marketing website can go live immediately
- Collect leads while you prepare main app

**Steps**:
```bash
# 1. Deploy landing page
cd "D:\Projects\GRC-Master\Assessmant-GRC\apps\web\www.shahin.com\landing-page"
npx vercel

# 2. You'll get a URL like:
# https://shahin-grc-landing-abc123.vercel.app

# 3. Test it works
# Open in browser, test all sections
```

---

### Phase 2: Backend on Railway (20 min)

**Why Railway?**
- Free tier available
- PostgreSQL included
- Easy deployment
- Persistent connections

**Steps**:
```bash
# 1. Deploy BFF to Railway
cd "D:\Projects\GRC-Master\Assessmant-GRC\apps\bff"

# 2. Create .env
cat > .env << 'EOF'
PORT=3001
JWT_SECRET=staging-jwt-secret-change-in-production-32-chars-min
JWT_REFRESH_SECRET=staging-refresh-secret-32-characters-minimum
NODE_ENV=staging
DATABASE_URL=postgresql://postgres:password@host:5432/grc_staging
BYPASS_AUTH=false
FRONTEND_URL=https://shahin-grc-landing.vercel.app
EOF

# 3. Deploy
npx @railway/cli login
npx @railway/cli init
npx @railway/cli up

# 4. You'll get a URL like:
# https://grc-bff-production.up.railway.app
```

---

### Phase 3: Connect Landing Page to Backend (5 min)

```bash
# In Vercel Dashboard
# Project: shahin-grc-landing
# Settings → Environment Variables

# Add:
VITE_API_URL=https://grc-bff-production.up.railway.app/api

# Redeploy:
vercel --prod
```

---

### Phase 4: Deploy Main GRC App (15 min)

```bash
# 1. Deploy GRC platform
cd "D:\Projects\GRC-Master\Assessmant-GRC\apps\web"
npx vercel

# 2. Add environment variables in Vercel Dashboard
VITE_API_URL=https://grc-bff-production.up.railway.app/api

# 3. Redeploy
vercel --prod

# 4. You'll get a URL like:
# https://grc-platform-abc123.vercel.app
```

---

## 🎯 Final Architecture

```
┌─────────────────────────────────────────┐
│   Landing Page (Vercel)                 │
│   https://shahin-grc-landing.vercel.app │
│   - Marketing content                   │
│   - Try Demo button                     │
│   - Demo booking form                   │
└──────────────┬──────────────────────────┘
               │
               │ Links to
               ▼
┌─────────────────────────────────────────┐
│   GRC Platform (Vercel)                 │
│   https://grc-platform.vercel.app       │
│   - 10 production pages                 │
│   - Dashboard, Users, Compliance, etc.  │
│   - Authentication required             │
└──────────────┬──────────────────────────┘
               │
               │ API Calls
               ▼
┌─────────────────────────────────────────┐
│   Backend BFF (Railway)                 │
│   https://grc-bff.railway.app           │
│   - Authentication                      │
│   - All API endpoints                   │
│   - PostgreSQL database                 │
└─────────────────────────────────────────┘
```

---

## ✅ Quick Deployment (All 3 Apps)

### Total Time: ~55 minutes

**Step 1: Landing Page (15 min)**
```bash
cd "apps/web/www.shahin.com/landing-page"
npx vercel login
npx vercel
# Copy URL: https://shahin-grc-landing-xyz.vercel.app
```

**Step 2: Backend (20 min)**
```bash
cd "apps/bff"
# Create .env with secrets
npx @railway/cli login
npx @railway/cli up
# Copy URL: https://grc-bff-production.up.railway.app
```

**Step 3: GRC Platform (15 min)**
```bash
cd "apps/web"
npx vercel
# In Vercel Dashboard, add VITE_API_URL
vercel --prod
# Copy URL: https://grc-platform-xyz.vercel.app
```

**Step 4: Connect Landing to Platform (5 min)**
```bash
# Update landing page hero CTAs to point to GRC platform
# Redeploy landing page
cd "apps/web/www.shahin.com/landing-page"
vercel --prod
```

---

## 🔗 URL Structure

After deployment you'll have:

1. **Landing Page**: `https://shahin-grc-landing.vercel.app`
   - Public access
   - No login required
   - Marketing content

2. **GRC Platform**: `https://grc-platform.vercel.app`
   - Login required
   - 10 production pages
   - Full application

3. **Backend API**: `https://grc-bff-production.railway.app`
   - API endpoints
   - Authentication
   - Database

---

## 📝 Environment Variables Needed

### Landing Page (Vercel)
```bash
VITE_API_URL=https://grc-bff-production.railway.app/api
VITE_FRONTEND_URL=https://grc-platform.vercel.app
```

### GRC Platform (Vercel)
```bash
VITE_API_URL=https://grc-bff-production.railway.app/api
NODE_ENV=staging
```

### Backend BFF (Railway)
```bash
PORT=3001
JWT_SECRET=your-secret-32-chars-minimum
JWT_REFRESH_SECRET=different-secret-32-chars
DATABASE_URL=postgresql://user:pass@host:5432/grc
NODE_ENV=staging
FRONTEND_URL=https://shahin-grc-landing.vercel.app
CORS_ORIGINS=https://shahin-grc-landing.vercel.app,https://grc-platform.vercel.app
```

---

## 💰 Total Cost Estimate

| Service | Tier | Cost/Month |
|---------|------|------------|
| **Vercel** (Landing Page) | Hobby (Free) | $0 |
| **Vercel** (GRC Platform) | Hobby (Free) | $0 |
| **Railway** (Backend + DB) | Developer | $5 |
| **Total** | | **$5/month** |

**Upgrade Options**:
- Vercel Pro: $20/month (per project)
- Railway Pro: $20/month (more resources)

---

## 🎯 Testing Checklist

### Landing Page
- [ ] Page loads
- [ ] All sections visible
- [ ] Navigation works
- [ ] Animations smooth
- [ ] Try Demo button works
- [ ] Booking form opens
- [ ] Mobile responsive
- [ ] Arabic/English works

### GRC Platform
- [ ] Login page loads
- [ ] Demo credentials work
- [ ] Dashboard displays
- [ ] All 10 pages accessible
- [ ] Dark mode toggle works
- [ ] API calls work (or show errors)
- [ ] Mobile responsive

### Backend
- [ ] Health endpoint: `/healthz`
- [ ] Login endpoint: `/api/auth/login`
- [ ] Protected endpoints return 401 without token
- [ ] Protected endpoints work with token

---

## 🐛 Common Issues & Fixes

### "Build Failed"
```bash
# Clear cache and rebuild
cd apps/web
rm -rf node_modules dist
npm install
vercel --prod --force
```

### "API calls fail"
```bash
# Check CORS settings in backend
# Ensure FRONTEND_URL is set correctly
# Add your Vercel domain to CORS_ORIGINS
```

### "Environment variables not working"
```bash
# Redeploy after adding env vars
vercel --prod

# Or pull them locally to test
vercel env pull
```

### "Page shows blank"
```bash
# Check browser console for errors
# Verify all routes in vercel.json
# Test locally first: npm run preview
```

---

## 📞 Next Steps

1. **Deploy landing page** → Get marketing site live
2. **Deploy backend** → Enable API functionality
3. **Deploy GRC platform** → Launch main application
4. **Add custom domain** (optional) → www.shahin-ai.com
5. **Enable analytics** → Track usage
6. **Add monitoring** → Sentry for errors
7. **Plan production** → Production secrets, scaling

---

## 🚀 Ready to Deploy?

**Fastest path (Landing Page only)**:
```bash
cd "D:\Projects\GRC-Master\Assessmant-GRC\apps\web\www.shahin.com\landing-page"
npx vercel
```

**Full stack (All 3)**:
1. Landing page (15 min)
2. Backend (20 min)
3. GRC platform (15 min)
4. Connect & test (10 min)

**Total**: ~60 minutes to full staging environment

---

**Which one do you want to deploy first?**

1. Landing Page only (quickest, marketing site)
2. GRC Platform only (main app, needs backend)
3. Full stack (all 3 apps together)

Let me know and I'll guide you through! 🚀
