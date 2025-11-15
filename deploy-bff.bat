@echo off
echo ==========================================
echo 🚀 Deploy Backend (BFF) to Vercel
echo ==========================================
echo.

cd apps\bff

echo Step 1: Deploying BFF to Vercel...
echo.
npx vercel --prod

echo.
echo ==========================================
echo ✅ BFF Deployment Complete!
echo ==========================================
echo.
echo IMPORTANT: Copy the BFF URL from above
echo Example: https://grc-bff-xxxxx.vercel.app
echo.
echo Next Steps:
echo 1. Add DATABASE_URL to Vercel environment variables
echo 2. Add JWT_SECRET and SERVICE_TOKEN
echo 3. Add FRONTEND_URL (your frontend Vercel URL)
echo 4. Add Microsoft, Stripe, Zakat.ie credentials
echo 5. Run database migrations
echo 6. Update frontend VITE_BFF_URL
echo 7. Redeploy frontend
echo.
echo See VERCEL_DEPLOYMENT_GUIDE.md for details
echo.
pause
