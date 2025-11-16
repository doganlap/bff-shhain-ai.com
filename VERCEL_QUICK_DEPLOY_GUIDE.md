# Vercel Quick Deploy Guide
## Shahin-AI Production Deployment - Fast Track

**⏱️ Estimated Time:** 2-4 hours  
**💰 Cost:** $0 for testing, ~$45/mo for production

---

## 🚀 Step 1: Database Setup (30 mins)

### Option A: Supabase (Recommended)

1. **Sign up:** https://supabase.com
2. **Create new project:**
   - Name: `shahin-grc-production`
   - Region: `us-east-1` (closest to Vercel)
   - Database Password: Generate strong password (save it!)
3. **Get connection string:**
   - Go to Settings → Database
   - Copy `Connection string` → `URI`
   - Should look like: `postgresql://postgres:PASSWORD@HOST:5432/postgres`
4. **Enable SSL:**
   - Add `?sslmode=require` to the end
   - Final: `postgresql://postgres:PASSWORD@HOST:5432/postgres?sslmode=require`

### Option B: Neon (Alternative)

1. **Sign up:** https://neon.tech
2. **Create project:** shahin-grc-production
3. **Copy connection string** from dashboard
4. Already includes SSL by default

---

## 🔑 Step 2: Generate Security Keys (5 mins)

### Using PowerShell (Windows)

```powershell
# Generate JWT Secret
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Generate Service Token
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Using Git Bash / WSL (Windows)

```bash
# Generate JWT Secret
openssl rand -base64 64

# Generate Service Token
openssl rand -base64 64
```

**Save these values!** You'll need them in the next step.

---

## ⚙️ Step 3: Vercel Setup (30-60 mins)

### A. Create Vercel Account & Install CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login
```

### B. Link Project

```bash
# Navigate to project root
cd d:\Projects\Shahin-ai-App

# Link to Vercel (creates new project)
vercel link
```

**Answer prompts:**
- Set up and deploy? **N** (No, we'll configure first)
- Which scope? Select your account
- Link to existing project? **N** (No, create new)
- Project name? **shahin-ai-grc** or your choice
- In which directory? **./** (current directory)

### C. Configure Environment Variables

```bash
# Database
vercel env add DATABASE_URL production
# Paste your Supabase/Neon connection string

# Security Keys
vercel env add JWT_SECRET production
# Paste your generated JWT secret

vercel env add SERVICE_TOKEN production
# Paste your generated service token

# Frontend URLs
vercel env add VITE_BFF_URL production
# Enter: https://shahin-ai-grc.vercel.app (or your project name)

vercel env add VITE_API_URL production
# Enter: https://shahin-ai-grc.vercel.app

vercel env add VITE_API_BASE_URL production
# Enter: https://shahin-ai-grc.vercel.app/api

vercel env add VITE_WS_URL production
# Enter: wss://shahin-ai-grc.vercel.app

# Node environment
vercel env add NODE_ENV production
# Enter: production

vercel env add VITE_NODE_ENV production
# Enter: production

# CORS configuration
vercel env add FRONTEND_ORIGINS production
# Enter: https://shahin-ai-grc.vercel.app,https://shahin-ai.com
```

### D. Optional External Services

**Only add if you have API keys:**

```bash
# OpenAI (if using AI features)
vercel env add OPENAI_API_KEY production
# Enter your OpenAI API key

# Stripe (if using payments)
vercel env add STRIPE_SECRET_KEY production
# Enter your Stripe secret key

# SendGrid (if using emails)
vercel env add SENDGRID_API_KEY production
# Enter your SendGrid API key

# Sentry (if using error tracking)
vercel env add SENTRY_DSN production
# Enter your Sentry DSN
```

---

## 🗄️ Step 4: Database Migration (15 mins)

```bash
# Navigate to BFF directory
cd apps/bff

# Set DATABASE_URL temporarily for migration
$env:DATABASE_URL = "your-database-connection-string"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed initial data
npm run seed-database
```

**Verify migration success:**
- Check your Supabase dashboard
- Go to Table Editor
- You should see 300+ tables created

---

## 🚀 Step 5: Deploy to Vercel (10 mins)

```bash
# Navigate back to root
cd d:\Projects\Shahin-ai-App

# Deploy to production
vercel --prod
```

**Deployment process:**
1. Vercel uploads your code
2. Installs dependencies (`pnpm install`)
3. Builds frontend (`cd apps/web && pnpm run build`)
4. Generates Prisma client (`prisma generate`)
5. Creates serverless functions
6. Deploys to global CDN

**Watch for:**
- ✅ Build successful
- ✅ Deployment ready
- 🔗 Production URL provided

---

## ✅ Step 6: Test Deployment (15 mins)

### A. Access Application

```bash
# Get your deployment URL
vercel ls
```

Visit: `https://your-project.vercel.app`

### B. Test Endpoints

```bash
# Test frontend
curl https://your-project.vercel.app

# Test API health
curl https://your-project.vercel.app/api/health

# Expected response: {"status":"healthy","timestamp":"..."}
```

### C. Test in Browser

1. **Open:** `https://your-project.vercel.app`
2. **Check console** for errors (F12 → Console)
3. **Test login/registration**
4. **Verify API calls succeed**

---

## 🔧 Troubleshooting

### Issue: "Build Failed - Module not found"

```bash
# Clear Vercel cache and rebuild
vercel --force --prod
```

### Issue: "Database connection failed"

1. Check DATABASE_URL is set:
   ```bash
   vercel env ls
   ```
2. Verify connection string format:
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```
3. Test connection locally:
   ```bash
   cd apps/bff
   $env:DATABASE_URL = "your-connection-string"
   npx prisma db push
   ```

### Issue: "Serverless Function Timeout"

- BFF functions limited to 30 seconds
- Check for slow database queries
- Consider upgrading to Vercel Pro (60s timeout)

### Issue: "CORS errors in browser"

1. Check FRONTEND_ORIGINS env var includes your Vercel URL
2. Verify in `apps/bff/vercel.json`:
   ```json
   "headers": [
     {
       "key": "Access-Control-Allow-Origin",
       "value": "https://your-project.vercel.app"
     }
   ]
   ```

### Issue: "Environment variables not working"

```bash
# List all environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local

# Redeploy to pick up new env vars
vercel --prod
```

---

## 📊 Post-Deployment Checklist

- [ ] Frontend loads successfully
- [ ] API health endpoint responds
- [ ] Database connection works
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes require authentication
- [ ] CORS headers configured correctly
- [ ] No console errors in browser
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (Vercel auto-handles)
- [ ] Monitoring enabled (Vercel Analytics)
- [ ] Error tracking configured (Sentry)

---

## 🎯 Next Steps

### Immediate

1. **Custom Domain:**
   ```bash
   vercel domains add www.shahin-ai.com
   ```
   - Follow DNS configuration instructions
   - Vercel auto-provisions SSL

2. **Enable Analytics:**
   - Vercel Dashboard → Analytics → Enable
   - Free on all plans

3. **Monitor Deployments:**
   ```bash
   vercel logs --follow
   ```

### Within 1 Week

1. Set up CI/CD with GitHub
2. Configure staging environment
3. Implement database backup strategy
4. Set up uptime monitoring (UptimeRobot)
5. Create runbook for common issues

### Within 1 Month

1. Performance optimization
2. Implement caching strategy
3. Add Redis for session management
4. Set up load testing
5. Document deployment process for team

---

## 🆘 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** support@vercel.com
- **Prisma Vercel Guide:** https://pris.ly/d/vercel
- **Community:** https://github.com/vercel/vercel/discussions

---

## 💡 Pro Tips

1. **Use Preview Deployments:**
   ```bash
   vercel
   # Creates preview deployment for testing
   ```

2. **Check Build Logs:**
   ```bash
   vercel logs --follow
   ```

3. **Rollback if needed:**
   ```bash
   vercel rollback
   ```

4. **Environment-specific builds:**
   - Preview: Automatic for all branches
   - Production: Only from main/master or manual `--prod`

5. **Cost Optimization:**
   - Start with Hobby plan ($0)
   - Upgrade to Pro ($20) only when needed
   - Monitor usage in dashboard

---

**✅ You're Ready to Deploy!**

Total time: ~2-4 hours  
Difficulty: ⭐⭐⭐ (Intermediate)

**Questions?** Check the comprehensive report: `VERCEL_PRODUCTION_DEPLOYMENT_REPORT.md`
