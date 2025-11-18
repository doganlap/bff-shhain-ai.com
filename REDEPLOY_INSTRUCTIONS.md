# Redeploy Instructions

## Quick Redeploy via Dashboard (Recommended)

### Frontend (`app-shahin-ai`):
1. Go to: https://vercel.com/donganksa/app-shahin-ai
2. Click "Deployments" tab
3. Find the latest deployment
4. Click the "..." menu (three dots)
5. Click "Redeploy"
6. Wait for deployment to complete

### BFF (`bff-shahin-ai`):
1. Go to: https://vercel.com/donganksa/bff-shahin-ai
2. Click "Deployments" tab
3. Find the latest deployment
4. Click the "..." menu (three dots)
5. Click "Redeploy"
6. Wait for deployment to complete

## Alternative: Deploy via CLI

If CLI works, try:

```bash
# From project root
cd D:\Projects\Shahin-ai-App
vercel deploy --prod

# For BFF
cd apps\bff
vercel deploy --prod
```

## After Redeploy

Check:
- Frontend: https://app-shahin-ai.vercel.app
- BFF: https://bff-shahin-ai.vercel.app/api/health
- Test login flow

