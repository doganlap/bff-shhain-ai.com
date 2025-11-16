# 🚀 Quick Start - 5 Minutes to Deploy

## What You Have

A **complete sandbox/playground system** organized in the `sandbox-system/` folder:

```
sandbox-system/
├── frontend/           # Landing page components (4 files)
├── backend/            # API routes & database (4 files)
├── docs/               # Full documentation
├── README.md           # Complete guide
└── DEPLOYMENT_CHECKLIST.md  # Step-by-step deployment
```

---

## ⚡ Deploy in 5 Steps

### Step 1: Database (2 minutes)
```powershell
cd sandbox-system/backend/migrations
psql $env:DATABASE_URL -f 001_landing_cms.sql
psql $env:DATABASE_URL -f 002_sandbox_system.sql
```

### Step 2: Backend (1 minute)
```javascript
// Add to backend/server.js:
const sandboxRoutes = require('./routes/sandbox');
app.use('/api/sandbox', sandboxRoutes);
```

### Step 3: Deploy Backend (1 minute)
```powershell
cd backend
# Your backend deployment command here
# Or manually copy sandbox-system/backend/routes/* to backend/routes/
```

### Step 4: Deploy Landing Page (1 minute)
```powershell
cd landing-page
.\DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1
```

### Step 5: Test (30 seconds)
Open landing page → Click "Try Demo" button → New tab opens with app!

---

## ✅ That's It!

Your sandbox system is now live. Visitors can try your app instantly without registration.

**For detailed instructions:** See `README.md` or `DEPLOYMENT_CHECKLIST.md`

---

## 🎯 What Visitors Can Do

1. **Click "Try Demo"** → Instant access (no forms)
2. **Book a Demo** → Get 7-day access + schedule with you
3. **Give Feedback** → Share their experience
4. **Contact You** → Sales/support inquiries

---

## 📞 Need Help?

- **Full Guide:** `docs/SANDBOX_PLAYGROUND_IMPLEMENTATION.md`
- **Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Support:** Ahmet@doganconsult.com

---

**Ready to convert visitors into customers!** 🎉

