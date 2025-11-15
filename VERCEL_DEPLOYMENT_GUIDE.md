# Vercel Deployment Connection Guide

## 🚀 Connect Frontend, Backend & Database

### Step 1: Deploy Backend (BFF) to Vercel

#### 1.1 Create `apps/bff/vercel.json`
```json
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
      "dest": "index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 1.2 Deploy BFF to Vercel
```bash
cd apps/bff
npx vercel --prod
```

**Note the BFF URL:** `https://grc-bff-xxxxx.vercel.app`

---

### Step 2: Set Up PostgreSQL Database

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Copy the connection string (starts with `postgres://`)

#### Option B: External PostgreSQL (Supabase, Neon, Railway)
1. Create a PostgreSQL database on your preferred provider
2. Get the connection string: `postgresql://user:password@host:5432/database?sslmode=require`

#### 2.1 Add Database URL to BFF Environment Variables
In Vercel BFF project settings:
- Go to **Settings** → **Environment Variables**
- Add: `DATABASE_URL` = `your-postgres-connection-string`

---

### Step 3: Configure Environment Variables

#### 3.1 Backend (BFF) Environment Variables on Vercel
Go to your BFF project → **Settings** → **Environment Variables**

Add these:
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Security
JWT_SECRET=your-64-char-random-string-here
SERVICE_TOKEN=your-64-char-random-string-here

# Frontend URL (your Vercel frontend)
FRONTEND_URL=https://grc-platform-xxxxx.vercel.app

# Node Environment
NODE_ENV=production
PORT=3005

# Microsoft OAuth (from Azure Portal)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_REDIRECT_URI=https://your-bff-url.vercel.app/api/auth/microsoft/callback

# Stripe (from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Zakat.ie (request from Zakat.ie)
ZAKAT_IE_API_KEY=your-zakat-api-key
ZAKAT_IE_WEBHOOK_SECRET=your-webhook-secret
ZAKAT_IE_ORGANIZATION_ID=your-org-id
```

**Generate JWT Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 3.2 Frontend Environment Variables on Vercel
Go to your frontend project → **Settings** → **Environment Variables**

Add these:
```bash
# Backend BFF URL (from Step 1.2)
VITE_BFF_URL=https://grc-bff-xxxxx.vercel.app

# App Configuration
VITE_APP_NAME=Shahin GRC Platform
VITE_APP_VERSION=2.1.0

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=
```

---

### Step 4: Run Database Migrations

#### 4.1 Install Prisma CLI locally
```bash
npm install -g prisma
```

#### 4.2 Set DATABASE_URL locally
Create `apps/bff/.env`:
```bash
DATABASE_URL="your-production-database-url"
```

#### 4.3 Run migrations
```bash
cd apps/bff
npx prisma migrate deploy
npx prisma generate
```

---

### Step 5: Update Frontend to Use BFF

Your frontend is already configured to use `VITE_BFF_URL` in `api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_BFF_URL || '/api';
```

After adding `VITE_BFF_URL` to Vercel environment variables, **redeploy**:
```bash
cd apps/web
npx vercel --prod
```

---

### Step 6: Configure CORS on Backend

The BFF already has CORS configured in `index.js`. Update if needed:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

### Step 7: Test the Connection

#### 7.1 Test Backend Health
```bash
curl https://your-bff-url.vercel.app/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-15T..."
}
```

#### 7.2 Test Frontend → Backend Connection
1. Open: `https://your-frontend-url.vercel.app`
2. Open browser DevTools → Network tab
3. Try to login or access any API endpoint
4. Check if requests go to your BFF URL

---

## 📋 Quick Checklist

- [ ] Backend deployed to Vercel
- [ ] Database created (Vercel Postgres or external)
- [ ] DATABASE_URL added to BFF environment variables
- [ ] JWT_SECRET and SERVICE_TOKEN generated and added
- [ ] FRONTEND_URL set to frontend Vercel URL
- [ ] Database migrations run
- [ ] VITE_BFF_URL added to frontend environment variables
- [ ] Frontend redeployed
- [ ] Microsoft Azure AD configured (optional)
- [ ] Stripe configured (optional)
- [ ] Zakat.ie configured (optional)
- [ ] CORS configured correctly
- [ ] Health endpoint tested
- [ ] Frontend successfully calling backend

---

## 🔧 Troubleshooting

### Frontend can't connect to backend
1. Check VITE_BFF_URL is set correctly
2. Check CORS settings in BFF
3. Check browser console for errors

### Database connection fails
1. Verify DATABASE_URL format
2. Check SSL mode: `?sslmode=require`
3. Verify IP allowlist on database provider
4. Check Prisma schema matches database

### Authentication not working
1. Verify JWT_SECRET is set
2. Check cookies are being sent (credentials: true)
3. Verify Microsoft OAuth redirect URI matches

---

## 🌐 Landing Page Connection

If you have a separate landing page, deploy it separately:

```bash
cd apps/web/www.shahin.com/landing-page
npx vercel --prod
```

Set custom domain in Vercel:
1. Go to project → **Settings** → **Domains**
2. Add your domain (e.g., `shahin-ai.com`)
3. Update DNS records as instructed

---

## 📝 Next Steps

1. **Set up custom domains** in Vercel
2. **Configure SSL certificates** (automatic with Vercel)
3. **Set up monitoring** (Vercel Analytics, Sentry)
4. **Configure webhooks** (Stripe, Zakat.ie)
5. **Set up CI/CD** (GitHub integration)
6. **Enable Vercel Functions** for serverless endpoints
7. **Set up Redis** (Upstash Redis for caching)

---

## 🚀 Production URLs

After deployment, your URLs will be:

- **Frontend**: `https://grc-platform.vercel.app` or `https://yourdomain.com`
- **Backend**: `https://grc-bff.vercel.app` or `https://api.yourdomain.com`
- **Landing**: `https://shahin-landing.vercel.app` or `https://www.yourdomain.com`

Configure these in your environment variables accordingly.
