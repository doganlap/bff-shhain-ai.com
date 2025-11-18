# Correct Project Settings Reference

## Frontend Project: `app-shahin-ai` ✅

**Project Name**: `app-shahin-ai`  
**URL**: https://app-shahin-ai-donganksa.vercel.app  
**Dashboard**: https://vercel.com/donganksa/app-shahin-ai

### Settings:
- **Root Directory**: `.` (project root)
- **Build Command**: `cd apps/web && pnpm install && pnpm build`
- **Output Directory**: `apps/web/dist`
- **Install Command**: `pnpm install`
- **Framework**: Other
- **Node.js**: 22.x

### Environment Variables:
- `NODE_ENV` = `production`
- `VITE_BFF_URL` = `https://bff-shahin-ai.vercel.app`

---

## BFF Project: `bff-shahin-ai` ✅

**Project Name**: `bff-shahin-ai`  
**URL**: https://bff-shahin-ai.vercel.app  
**Dashboard**: https://vercel.com/donganksa/bff-shahin-ai

### Settings:
- **Root Directory**: `apps/bff` (should be updated)
- **Build Command**: `npm run vercel-build` or `npm run build`
- **Output Directory**: (empty or `.`)
- **Install Command**: `pnpm install`
- **Framework**: Other
- **Node.js**: 22.x

### Environment Variables:
- `NODE_ENV` = `production`
- `DATABASE_URL` = `[your database URL]`
- `JWT_SECRET` = `208d15bb78bd8a7a17402c09b3a40f44d35df6f352e05fd9f5c0328b513dfa7a`
- `SESSION_SECRET` = `201a910fda3dcb149ec9a29cf4545c162000a96fbc3dc7ac5d344213d0e4f65f`
- `FRONTEND_ORIGINS` = `https://app-shahin-ai.vercel.app,https://app.shahin-ai.com,https://www.shahin-ai.com,https://shahin-ai.com`

---

## ❌ Project to Ignore: `shahin-ai-app`

This project was accidentally created and has wrong settings. Don't use it.

---

## Quick Commands

### Deploy Frontend (Correct Project):
```bash
cd D:\Projects\Shahin-ai-App
vercel --prod --scope donganksa
# Should deploy to: app-shahin-ai
```

### Deploy BFF:
```bash
cd D:\Projects\Shahin-ai-App\apps\bff
vercel --prod --scope donganksa
# Should deploy to: bff-shahin-ai
```

### Check Current Link:
```bash
cat .vercel/project.json
# Should show: "projectName":"app-shahin-ai"
```

