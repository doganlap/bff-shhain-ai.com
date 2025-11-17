# Deployment Instructions for BFF to shahin-ai-app

## Current Issue

The Vercel project "shahin-ai-app" is currently configured for a React app with:
- Root Directory: `apps/web/dist`

- Framework: Create React App
- Build Command: `npm run build`

## Solution


### Option 1: Update Project Settings (Recommended)

1. Go to: <https://vercel.com/donganksa/shahin-ai-app/settings>
2. Update the following settings:
   - **Root Directory**: `apps/bff`
   - **Framework Preset**: None (or Node.js)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.`
   - **Install Command**: `npm install`

3. Then run the deployment:

   ```bash
   cd apps/bff
   vercel --prod
   ```

### Option 2: Deploy as Function (Alternative)

Deploy the BFF as a serverless function within the existing React app structure.

## Environment Variables Already Set

✅ JWT_SECRET
✅ JWT_REFRESH_SECRET  
✅ SERVICE_TOKEN
✅ NODE_ENV
✅ LOG_LEVEL
✅ FRONTEND_ORIGINS
✅ DATABASE_URL
✅ POSTGRES_URL
✅ PRISMA_DATABASE_URL

## Next Steps After Deployment
1. Test the BFF endpoints
2. Update frontend to point to new BFF URL
3. Configure database connection
4. Run database seeding if needed