# Production Deployment URLs

## Active Deployments (November 15, 2025)

### 1. GRC Dashboard (Frontend)
- **URL**: https://grc-dashboard-ae299wpnh-donganksa.vercel.app
- **Project**: grc-dashboard
- **Folder**: `apps/web`
- **Status**: ✅ Building/Deployed
- **Environment**:
  - VITE_BFF_URL=https://bff-seven-beige.vercel.app

### 2. BFF (Backend for Frontend)
- **URL**: https://bff-g2efjw3eh-donganksa.vercel.app
- **Custom Domain**: https://bff-seven-beige.vercel.app
- **Project**: bff
- **Folder**: `apps/bff`
- **Status**: ✅ Deployed
- **Environment**: Needs DATABASE_URL and other env vars

### 3. Shahin Landing Page
- **URL**: https://shahin-landing-e2fmgb7rk-donganksa.vercel.app
- **Project**: shahin-landing
- **Folder**: `apps/web/www.shahin.com/landing-page`
- **Status**: ✅ Deployed

---

## Next Steps

1. **Configure Environment Variables** in Vercel Dashboard:
   - GRC Dashboard: Add `VITE_BFF_URL=https://bff-seven-beige.vercel.app`
   - BFF: Add DATABASE_URL, JWT_SECRET, etc.

2. **Custom Domains** (if needed):
   - Map custom domain to grc-dashboard
   - Keep bff-seven-beige.vercel.app as API domain

3. **Clean Up Old Deployments**:
   - Delete `grc-platform` project (duplicate)
   - Delete `shahin-ai` project (if not needed)
   - Delete `saudistore` projects (if not needed)

4. **Test Connections**:
   - Frontend → BFF API calls
   - Database → BFF connections
   - Landing Page → GRC Dashboard links

---

## Deployment Commands

### Redeploy All:
```powershell
# Set token
$env:VERCEL_TOKEN='tNAtfmszyowXCTOlcpG4wSwT'

# Deploy GRC Dashboard
cd "D:\Projects\GRC-Master\Assessmant-GRC\apps\web"
vercel --prod --yes

# Deploy BFF
cd "D:\Projects\GRC-Master\Assessmant-GRC\apps\bff"
vercel --prod --yes

# Deploy Landing
cd "D:\Projects\GRC-Master\Assessmant-GRC\apps\web\www.shahin.com\landing-page"
vercel --prod --yes
```
