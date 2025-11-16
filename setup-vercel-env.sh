
# Vercel Environment Setup Commands
# Run these commands to set environment variables in Vercel

echo "Setting up BFF environment variables..."
vercel env add FRONTEND_ORIGINS --value="https://app-shahin-ai-com.vercel.app,https://app-shahin-ai-1uwk5615e-donganksa.vercel.app,https://grc-dashboard-ivory.vercel.app,https://shahin-ai.com,https://www.shahin-ai.com,https://dogan-ai.com,http://localhost:5173,http://localhost:3000" --target production --target preview
vercel env add PUBLIC_BFF_URL --value="https://bff-shahin-ai-com.vercel.app" --target production --target preview

echo "Setting up Web environment variables..."
vercel env add VITE_BFF_URL --value="https://bff-shahin-ai-com.vercel.app" --target production --target preview
vercel env add VITE_API_BASE_URL --value="https://bff-shahin-ai-com.vercel.app/api" --target production --target preview

echo "Environment variables set! Redeploy your applications:"
echo "vercel --prod"
