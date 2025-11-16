# ✅ Sandbox System Deployment Checklist

## Pre-Deployment

- [ ] Review all files in `sandbox-system/` folder
- [ ] Read `docs/SANDBOX_PLAYGROUND_IMPLEMENTATION.md`
- [ ] Backup current database
- [ ] Test in development environment first

---

## Step 1: Database Setup

- [ ] Connect to production PostgreSQL database
- [ ] Run migration: `001_landing_cms.sql`
  ```powershell
  psql $env:DATABASE_URL -f sandbox-system/backend/migrations/001_landing_cms.sql
  ```
- [ ] Run migration: `002_sandbox_system.sql`
  ```powershell
  psql $env:DATABASE_URL -f sandbox-system/backend/migrations/002_sandbox_system.sql
  ```
- [ ] Verify tables created:
  ```sql
  \dt sandbox_sessions
  \dt sandbox_feedback
  \dt contact_messages
  \dt landing_requests
  \dt landing_content
  ```
- [ ] Check table counts (should be 0 initially):
  ```sql
  SELECT COUNT(*) FROM sandbox_sessions;
  SELECT COUNT(*) FROM sandbox_feedback;
  ```

---

## Step 2: Backend Deployment

- [ ] Copy sandbox routes to backend
  ```powershell
  Copy-Item sandbox-system/backend/routes/* backend/routes/ -Force
  ```

- [ ] Update backend server file (`backend/server.js` or `app.js`)
  ```javascript
  const sandboxRoutes = require('./routes/sandbox');
  const landingRoutes = require('./routes/landing');
  
  app.use('/api/sandbox', sandboxRoutes);
  app.use('/api/landing', landingRoutes);
  ```

- [ ] Set environment variables
  ```env
  DATABASE_URL=postgresql://...
  JWT_SECRET=your-secret-key
  FRONTEND_URL=https://grc-frontend-prod...
  ```

- [ ] Install dependencies (if not already)
  ```powershell
  cd backend
  npm install bcrypt jsonwebtoken nodemailer
  ```

- [ ] Build backend Docker image
  ```powershell
  cd backend
  docker build -t grcacr202511012324.azurecr.io/grc-backend:latest .
  ```

- [ ] Push to Azure Container Registry
  ```powershell
  az acr login --name grcacr202511012324
  docker push grcacr202511012324.azurecr.io/grc-backend:latest
  ```

- [ ] Update Container App
  ```powershell
  az containerapp update \
      --name grc-backend-prod \
      --resource-group rg-grc-assessment-prod \
      --image grcacr202511012324.azurecr.io/grc-backend:latest
  ```

- [ ] Verify backend is running
  ```powershell
  az containerapp show --name grc-backend-prod --resource-group rg-grc-assessment-prod --query properties.runningStatus
  ```

- [ ] Test backend endpoints
  ```powershell
  curl https://grc-backend-prod.../api/sandbox/create -X POST -H "Content-Type: application/json"
  ```

---

## Step 3: Landing Page Deployment

- [ ] Verify frontend files are in place
  ```powershell
  ls landing-page/src/services/sandboxService.js
  ls landing-page/src/services/bookingService.js
  ls landing-page/src/components/TryDemoButton.jsx
  ```

- [ ] Set environment variables (`landing-page/.env`)
  ```env
  VITE_API_URL=https://grc-backend-prod.../api
  VITE_FRONTEND_URL=https://grc-frontend-prod...
  ```

- [ ] Build landing page
  ```powershell
  cd landing-page
  npm run build
  ```

- [ ] Deploy to Azure
  ```powershell
  .\DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1
  ```

- [ ] Verify deployment
  ```powershell
  az containerapp show --name grc-landing-page-prod --resource-group rg-grc-assessment-prod --query properties.runningStatus
  ```

- [ ] Test landing page loads
  ```powershell
  curl https://grc-landing-page-prod...
  ```

---

## Step 4: Integration Testing

- [ ] Open landing page in browser
- [ ] Click "Try Demo" button
- [ ] Verify:
  - [ ] Loading state shows
  - [ ] New tab opens
  - [ ] User is logged in automatically
  - [ ] Demo organization visible
  - [ ] Sample assessments visible (3 assessments)
  - [ ] Sample controls visible (10 per assessment)
  - [ ] Can navigate all pages
  - [ ] Arabic/English switching works

- [ ] Test demo booking form
  - [ ] Fill form with test data
  - [ ] Submit booking
  - [ ] Verify:
    - [ ] Success message shows
    - [ ] Record in database
    - [ ] Sandbox created
    - [ ] Linked correctly

- [ ] Check database records
  ```sql
  SELECT * FROM sandbox_sessions ORDER BY created_at DESC LIMIT 5;
  SELECT * FROM users WHERE is_sandbox = TRUE ORDER BY created_at DESC LIMIT 5;
  SELECT * FROM landing_requests ORDER BY created_at DESC LIMIT 5;
  ```

- [ ] Test feedback form
  - [ ] Submit feedback from sandbox
  - [ ] Verify record in `sandbox_feedback` table

- [ ] Test contact form
  - [ ] Submit contact message
  - [ ] Verify record in `contact_messages` table

---

## Step 5: UI Integration

- [ ] Add Try Demo button to Hero section
  ```jsx
  import TryDemoButton from './components/TryDemoButton'
  <TryDemoButton variant="primary" size="large" />
  ```

- [ ] Add to Header (optional)
  ```jsx
  <TryDemoButton variant="secondary" size="medium" />
  ```

- [ ] Redeploy landing page
  ```powershell
  cd landing-page
  npm run build
  .\DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1
  ```

- [ ] Verify button appears on landing page
- [ ] Test button functionality

---

## Step 6: Security & Performance

- [ ] Add rate limiting to sandbox endpoints
  ```javascript
  const rateLimit = require('express-rate-limit');
  const sandboxLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3
  });
  router.post('/create', sandboxLimiter, ...);
  ```

- [ ] Configure CORS properly
  ```javascript
  app.use(cors({
    origin: ['https://grc-landing-page-prod...', 'https://grc-frontend-prod...'],
    credentials: true
  }));
  ```

- [ ] Set up cleanup job
  ```sql
  SELECT cron.schedule(
    'cleanup-sandboxes',
    '0 * * * *',
    $$SELECT cleanup_expired_sandboxes()$$
  );
  ```

- [ ] Configure logging
  - [ ] Azure Application Insights
  - [ ] Database query logging
  - [ ] Error tracking

---

## Step 7: Monitoring & Analytics

- [ ] Set up Google Analytics (if not already)
  ```html
  <!-- In landing-page/index.html -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
  ```

- [ ] Configure Azure Application Insights
  ```javascript
  const appInsights = require('applicationinsights');
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING);
  ```

- [ ] Create admin dashboard queries
  ```sql
  -- Daily sandbox creations
  SELECT DATE(created_at) as date, COUNT(*) 
  FROM sandbox_sessions 
  GROUP BY DATE(created_at) 
  ORDER BY date DESC;
  
  -- Conversion rate
  SELECT 
    COUNT(DISTINCT s.id) as total_sandboxes,
    COUNT(DISTINCT f.session_id) as with_feedback,
    COUNT(DISTINCT CASE WHEN f.interested_in_purchase THEN f.session_id END) as interested
  FROM sandbox_sessions s
  LEFT JOIN sandbox_feedback f ON s.id = f.session_id;
  ```

- [ ] Set up alerts
  - [ ] Sandbox creation failures
  - [ ] High-interest leads
  - [ ] Database connection issues

---

## Step 8: Documentation & Handoff

- [ ] Document backend endpoints in API docs
- [ ] Add sandbox system to team documentation
- [ ] Train team on:
  - [ ] Monitoring sandbox sessions
  - [ ] Responding to demo requests
  - [ ] Following up with interested leads
  - [ ] Troubleshooting common issues

- [ ] Create runbook for common tasks:
  - [ ] Extending sandbox sessions
  - [ ] Manually creating sandboxes
  - [ ] Cleaning up old data
  - [ ] Viewing feedback

---

## Step 9: Go Live

- [ ] Final smoke test on production
- [ ] Monitor for first 24 hours
- [ ] Check:
  - [ ] Sandbox creations working
  - [ ] No errors in logs
  - [ ] Database performance OK
  - [ ] Memory/CPU usage normal

- [ ] Announce to team
- [ ] Update marketing materials
- [ ] Share landing page URL

---

## Post-Deployment (First Week)

- [ ] Day 1: Monitor closely, fix any issues immediately
- [ ] Day 2: Review first sandboxes created
- [ ] Day 3: Check feedback submissions
- [ ] Day 4: Analyze conversion metrics
- [ ] Day 5: Optimize based on data
- [ ] Day 7: Weekly review meeting

---

## Rollback Plan (If Needed)

- [ ] Keep backup of previous landing page
- [ ] Document rollback steps:
  ```powershell
  # Revert backend
  az containerapp update --name grc-backend-prod --image grcacr202511012324.azurecr.io/grc-backend:previous
  
  # Revert landing page
  az containerapp update --name grc-landing-page-prod --image grcacr202511012324.azurecr.io/landing-page:previous
  
  # Rollback database (if needed)
  psql $env:DATABASE_URL < backup.sql
  ```

---

## Success Criteria

✅ **System is successful when:**
- [ ] Visitors can create sandbox sessions
- [ ] Sandboxes open automatically in new tab
- [ ] Users can explore full app
- [ ] Demo data is visible and functional
- [ ] Sessions expire automatically
- [ ] Feedback is collected
- [ ] Admin can see sandbox sessions
- [ ] No errors in production logs
- [ ] Performance is acceptable
- [ ] Team can manage system

---

## Emergency Contacts

**Technical Issues:** Ahmet@doganconsult.com  
**Azure Support:** Azure Portal → Support  
**Database Issues:** DBA team  

---

## Notes & Observations

_Use this space to note any issues, improvements, or observations during deployment:_

```
Date: _________
Issue: _________
Resolution: _________

Date: _________
Improvement: _________
Action: _________
```

---

**Deployment Date:** __________________  
**Deployed By:** __________________  
**Sign-off:** __________________  

✅ **Deployment Complete!**

