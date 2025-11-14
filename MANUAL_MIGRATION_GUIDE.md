# Manual Production Migration Guide
# When automated scripts fail, use this manual process

## Step 1: Create Vercel Account & Project
1. Go to https://vercel.com
2. Sign up/Login with your account
3. Create new project or import existing
4. Link your GitHub repository (optional)

## Step 2: Create Databases Manually
1. Go to Vercel Dashboard → Your Project → Storage tab
2. Click "Create Database" → Select "Postgres"
3. Create 4 databases:
   - Name: `shahin-vector-db`
   - Name: `shahin-compliance-db`
   - Name: `shahin-main-db`
   - Name: `shahin-controls-db`

4. For each database, copy the connection string

## Step 3: Set Environment Variables
1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:

```
# Database Connections
DATABASE_URL=postgresql://username:password@host:5432/shahin_main_db
VECTOR_DATABASE_URL=postgresql://username:password@host:5432/shahin_vector_db
SHAHIN_COMPLIANCE_URL=postgresql://username:password@host:5432/shahin_compliance
CONTROLS_DATABASE_URL=postgresql://username:password@host:5432/shahin_controls

# Security
JWT_SECRET=your-super-secure-jwt-secret-change-in-production
BCRYPT_ROUNDS=12
SERVICE_TOKEN=your-service-token

# AI Services
OPENAI_API_KEY=sk-your-openai-key
AZURE_OPENAI_KEY=your-azure-key
AZURE_COMPUTER_VISION_KEY=your-vision-key

# App Config
NODE_ENV=production
VITE_API_URL=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

## Step 4: Local Migration First
Before deploying to Vercel, test locally:

```bash
# 1. Install dependencies
cd apps/bff
npm install
cd ../web
npm install

# 2. Run Prisma migrations locally first
cd ../bff
npx prisma generate --schema=prisma/schema_vector.prisma
npx prisma db push --schema=prisma/schema_vector.prisma

npx prisma generate --schema=prisma/schema_shahin_compliance.prisma
npx prisma db push --schema=prisma/schema_shahin_compliance.prisma

# 3. Test local servers
cd ../web && npm run dev    # http://localhost:5175
cd ../bff && npm run dev    # http://localhost:3000
```

## Step 5: Deploy to Vercel
```bash
# Deploy to production
vercel --prod

# Or deploy with specific project
vercel --prod --name your-project-name
```

## Step 6: Post-Deployment Setup
After successful deployment:

1. **Check Vercel Functions Logs:**
   - Go to Vercel Dashboard → Functions tab
   - Check for any errors in serverless functions

2. **Test API Endpoints:**
   ```
   GET https://your-app.vercel.app/api/health
   GET https://your-app.vercel.app/api/auth/me
   ```

3. **Verify Database Connections:**
   - Check if Prisma migrations ran successfully
   - Test database queries in Vercel functions

4. **Set Up Custom Domain (Optional):**
   - Go to Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Update DNS records

## Step 7: Data Population
After deployment, populate data:

```bash
# Connect to production databases and run:
# psql $DATABASE_URL < seed_grc_data.sql
# psql $DATABASE_URL < apps/web/src/enterprise/populate-complete-controls.sql
```

## Troubleshooting

### Common Issues:

1. **Database Connection Timeout:**
   - Check connection strings in environment variables
   - Ensure databases are created and accessible

2. **Prisma Migration Errors:**
   - Run migrations locally first to debug
   - Check database permissions

3. **API Function Timeouts:**
   - Vercel serverless functions have 10-second timeout
   - Optimize database queries

4. **Environment Variables Not Loading:**
   - Ensure variables are set at project level, not function level
   - Redeploy after changing environment variables

### Monitoring:
- Use Vercel Analytics for performance monitoring
- Set up error tracking (Sentry recommended)
- Monitor database usage in Vercel dashboard

## Cost Estimation:
- **Vercel Postgres:** ~$0.0005/GB/hour
- **Vercel Hosting:** Free tier for small projects
- **Expected monthly cost:** $10-50 depending on usage
