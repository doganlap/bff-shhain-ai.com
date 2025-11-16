# 🎮 Sandbox/Playground System - Complete Package

## 📦 What's in This Folder

This folder contains **ALL files** related to the Shahin GRC Sandbox/Playground system - a complete lead generation solution that allows visitors to try your app instantly without registration.

---

## 📂 Folder Structure

```
sandbox-system/
├── frontend/                    # Sandbox-specific components
│   ├── services/
│   │   ├── sandboxService.js   # Main sandbox API service
│   │   └── bookingService.js   # Demo booking integration
│   └── components/
│       ├── TryDemoButton.jsx   # One-click demo button
│       └── DemoBooking.jsx     # Demo booking form
├── backend/                     # Backend API
│   ├── routes/
│   │   ├── sandbox.js          # Sandbox endpoints
│   │   └── landing.js          # Landing page endpoints
│   └── migrations/
│       ├── 001_landing_cms.sql # Landing page CMS tables
│       └── 002_sandbox_system.sql # Sandbox tables
├── landing-page/                # Complete Landing Page
│   ├── App.jsx                 # Main React app
│   ├── components/             # All React components (13)
│   ├── config/                 # Configuration files (8)
│   ├── DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1
│   └── README_LANDING_PAGE.md  # Landing page guide
├── docs/
│   └── SANDBOX_PLAYGROUND_IMPLEMENTATION.md # Full documentation
├── README.md                    # This file
├── QUICK_START.md              # 5-minute deploy guide
├── DEPLOYMENT_CHECKLIST.md     # Step-by-step checklist
└── FILE_LIST.txt               # Complete file listing
```

---

## 🚀 Deployment Instructions

### Step 1: Deploy Frontend Files

**Copy to landing page source:**
```powershell
# From sandbox-system folder
Copy-Item frontend/services/* ../landing-page/src/services/ -Force
Copy-Item frontend/components/* ../landing-page/src/components/ -Force
```

**Or if already in place, just rebuild:**
```powershell
cd ../landing-page
npm run build
```

### Step 2: Deploy Backend Files

**Copy to backend source:**
```powershell
# From sandbox-system folder
Copy-Item backend/routes/* ../backend/routes/ -Force
```

**Wire routes in backend:**
```javascript
// In backend/server.js or app.js
const sandboxRoutes = require('./routes/sandbox');
const landingRoutes = require('./routes/landing');

app.use('/api/sandbox', sandboxRoutes);
app.use('/api/landing', landingRoutes);
```

### Step 3: Run Database Migrations

```powershell
# Set your database URL
$env:DATABASE_URL = "postgresql://user:pass@host:port/database"

# Run migrations in order
psql $env:DATABASE_URL -f backend/migrations/001_landing_cms.sql
psql $env:DATABASE_URL -f backend/migrations/002_sandbox_system.sql
```

### Step 4: Deploy to Azure

**Backend:**
```powershell
cd ../backend
# Build and push to ACR
docker build -t grcacr202511012324.azurecr.io/grc-backend:latest .
docker push grcacr202511012324.azurecr.io/grc-backend:latest

# Update Container App
az containerapp update \
    --name grc-backend-prod \
    --resource-group rg-grc-assessment-prod \
    --image grcacr202511012324.azurecr.io/grc-backend:latest
```

**Landing Page:**
```powershell
cd ../landing-page
.\DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1
```

---

## 🎯 Features Included

### 1. Instant Sandbox Access
- ✅ One-click "Try Now" button
- ✅ No registration required
- ✅ Creates temporary demo account
- ✅ Pre-populated with sample data
- ✅ 24-hour auto-expiration

### 2. Guided Demo Booking
- ✅ 3-step booking form
- ✅ Creates 7-day sandbox
- ✅ Links to booking record
- ✅ Admin notifications
- ✅ Email confirmations

### 3. Feedback Collection
- ✅ Post-sandbox feedback form
- ✅ Ratings and suggestions
- ✅ Purchase interest tracking
- ✅ Follow-up requests

### 4. Contact Forms
- ✅ General inquiries
- ✅ Sales contacts
- ✅ Support tickets
- ✅ Partnership requests

---

## 🔌 API Endpoints

All endpoints are under `/api/sandbox` and `/api/landing`:

### Sandbox Endpoints
```
POST   /api/sandbox/create              - Create instant sandbox
POST   /api/sandbox/guided-demo         - Book demo + create sandbox
POST   /api/sandbox/:id/feedback        - Submit feedback
GET    /api/sandbox/sessions            - List sandbox sessions (admin)
```

### Landing Endpoints
```
POST   /api/landing/requests            - Submit demo booking
GET    /api/landing/content             - Get landing page content
POST   /api/contact                     - Submit contact form
```

---

## 🗄️ Database Tables Created

### New Tables:
- `sandbox_sessions` - Tracks all sandbox sessions
- `sandbox_feedback` - Collects user feedback
- `contact_messages` - Contact form submissions

### Modified Tables:
- `users` - Added `is_sandbox`, `sandbox_expires_at`
- `landing_requests` - Added `sandbox_user_id`, `preferred_time`, `message`, `lead_score`
- `organizations` - Added `is_demo`
- `assessments` - Added `is_demo`
- `assessment_controls` - Added `is_demo`

---

## 💡 Usage Examples

### Add Try Demo Button to Landing Page

```jsx
import TryDemoButton from './components/TryDemoButton'

// Primary button (large)
<TryDemoButton variant="primary" size="large" />

// Secondary button (medium)
<TryDemoButton variant="secondary" size="medium" />

// Outline button (small)
<TryDemoButton variant="outline" size="small" />
```

### Use Sandbox Service Directly

```javascript
import { 
  createSandboxSession, 
  quickAccessSandbox,
  sendSandboxFeedback 
} from './services/sandboxService'

// Create sandbox with details
const session = await createSandboxSession({
  email: 'user@example.com',
  name: 'John Doe'
})

// Quick access (no details)
await quickAccessSandbox()

// Submit feedback
await sendSandboxFeedback(sessionId, {
  rating: 5,
  experience: 'excellent',
  wouldRecommend: true,
  interestedInPurchase: true
})
```

---

## 🔐 Security Configuration

### Environment Variables Required

**Backend (.env):**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-key
FRONTEND_URL=https://grc-frontend-prod...
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email
SMTP_PASS=your-password
```

**Landing Page (.env):**
```env
VITE_API_URL=https://grc-backend-prod.../api
VITE_FRONTEND_URL=https://grc-frontend-prod...
```

### Recommended: Add Rate Limiting

```javascript
// In backend/routes/sandbox.js
const rateLimit = require('express-rate-limit');

const sandboxLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3 // Max 3 requests per IP
});

router.post('/create', sandboxLimiter, async (req, res) => {
  // ... existing code
});
```

---

## 🧹 Maintenance

### Auto-Cleanup Expired Sandboxes

```sql
-- Run periodically (hourly recommended)
SELECT cleanup_expired_sandboxes();

-- Or schedule with pg_cron
SELECT cron.schedule(
  'cleanup-sandboxes',
  '0 * * * *',
  $$SELECT cleanup_expired_sandboxes()$$
);
```

### Monitor Sandbox Usage

```sql
-- Active sandbox sessions
SELECT COUNT(*) FROM sandbox_sessions 
WHERE is_active = TRUE 
AND expires_at > NOW();

-- High-quality leads (interested in purchase)
SELECT s.*, f.rating, f.suggestions
FROM sandbox_sessions s
JOIN sandbox_feedback f ON s.id = f.session_id
WHERE f.interested_in_purchase = TRUE
ORDER BY f.rating DESC;
```

---

## 📊 Analytics Integration

Events are automatically tracked:
- `sandbox_created`
- `sandbox_reopened`
- `feedback_submitted`
- `contact_submitted`
- `guided_demo_requested`

Integrated with:
- ✅ Google Analytics 4
- ✅ Azure Application Insights
- ✅ Facebook Pixel (optional)
- ✅ LinkedIn Insight Tag (optional)

---

## 🐛 Troubleshooting

### Sandbox not creating?
1. Check backend logs: `az containerapp logs show --name grc-backend-prod ...`
2. Verify database connection
3. Check JWT_SECRET is set
4. Confirm CORS configuration

### Demo data not showing?
1. Verify frameworks exist in database
2. Check `populateSandboxData()` function
3. Ensure `is_demo` flags are set

### Session expires immediately?
1. Check server timezone
2. Verify `sandbox_expires_at` calculation
3. Sync frontend/backend times

---

## 📞 Support

**Developed by:** DoganConsult  
**Email:** Ahmet@doganconsult.com  
**Website:** https://doganconsult.com  

**Full Documentation:** See `docs/SANDBOX_PLAYGROUND_IMPLEMENTATION.md`

---

## ✅ Checklist Before Going Live

- [ ] Database migrations run successfully
- [ ] Sandbox routes wired to backend
- [ ] Environment variables set
- [ ] Backend deployed to Azure
- [ ] Landing page deployed to Azure
- [ ] Try Demo button added to landing page
- [ ] Test sandbox creation end-to-end
- [ ] Verify demo data populates correctly
- [ ] Test session expiration
- [ ] Set up cleanup job (pg_cron)
- [ ] Configure rate limiting
- [ ] Set up admin notifications
- [ ] Test feedback collection
- [ ] Test contact form
- [ ] Monitor first 10 sandbox sessions

---

## 🎉 Ready to Deploy!

All files are organized and ready. Follow the deployment instructions above to go live.

**Estimated deployment time:** 30-45 minutes

---

*Last updated: November 2, 2025*  
*System version: 1.0*  
*Status: Production Ready*

