# Projects Explanation - Frontend vs Backend

## 📱 Frontend Project: `app-shahin-ai`

**Type**: Frontend (Web Application)  
**Technology**: React + Vite  
**URL**: https://app-shahin-ai.vercel.app  
**Dashboard**: https://vercel.com/donganksa/app-shahin-ai

**What it does:**
- Serves the user interface (UI)
- React application
- Static files (HTML, CSS, JavaScript)
- Makes API calls to the BFF

**Location in code**: `apps/web/`

**Environment Variables:**
- `NODE_ENV` = `production`
- `VITE_BFF_URL` = `https://bff-shahin-ai.vercel.app`

---

## 🔧 Backend Project: `bff-shahin-ai`

**Type**: Backend (BFF - Backend for Frontend)  
**Technology**: Node.js + Express  
**URL**: https://bff-shahin-ai.vercel.app  
**Dashboard**: https://vercel.com/donganksa/bff-shahin-ai

**What it does:**
- Handles API requests
- Authentication & authorization
- Database connections
- Business logic
- Rate limiting
- Token management

**Location in code**: `apps/bff/`

**Environment Variables:**
- `NODE_ENV` = `production`
- `DATABASE_URL` = `[your database]`
- `JWT_SECRET` = `[secret]`
- `SESSION_SECRET` = `[secret]`
- `FRONTEND_ORIGINS` = `[allowed origins]`

---

## 🔄 How They Work Together

```
User Browser
    ↓
Frontend (app-shahin-ai)
    ↓ API calls
Backend (bff-shahin-ai)
    ↓
Database
```

**Example Flow:**
1. User visits: `https://app-shahin-ai.vercel.app/login`
2. User enters credentials
3. Frontend calls: `https://bff-shahin-ai.vercel.app/api/auth/login`
4. BFF validates and responds
5. Frontend shows result

---

## 📋 Quick Reference

| Project | Type | URL | Code Location |
|---------|------|-----|---------------|
| `app-shahin-ai` | **Frontend** | https://app-shahin-ai.vercel.app | `apps/web/` |
| `bff-shahin-ai` | **Backend** | https://bff-shahin-ai.vercel.app | `apps/bff/` |

---

## 🚀 Deployment

**Deploy Frontend:**
```bash
cd D:\Projects\Shahin-ai-App
vercel --prod
# Deploys to: app-shahin-ai
```

**Deploy Backend:**
```bash
cd D:\Projects\Shahin-ai-App\apps\bff
vercel --prod
# Deploys to: bff-shahin-ai
```

---

## ✅ Summary

- **`app-shahin-ai`** = **Frontend** (what users see)
- **`bff-shahin-ai`** = **Backend** (API server)

