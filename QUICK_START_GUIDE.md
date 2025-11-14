# 🚀 QUICK START GUIDE - Shahin GRC Integration

**Target Users:** Developers, System Administrators
**Time to Complete:** 15-30 minutes
**Prerequisites:** PostgreSQL, Node.js 18+, npm/yarn

---

## 📋 TABLE OF CONTENTS

1. [Database Setup](#1-database-setup)
2. [Backend Integration](#2-backend-integration)
3. [Frontend Integration](#3-frontend-integration)
4. [Testing](#4-testing)
5. [Usage Examples](#5-usage-examples)

---

## 1. DATABASE SETUP

### Step 1.1: Apply Schema Changes

```bash
cd d:/Projects/GRC-Master/Assessmant-GRC/apps/bff

# Generate migration
npx prisma migrate dev --name add_onboarding_scoring_workflow

# Generate Prisma Client
npx prisma generate

# Verify tables created
npx prisma studio
```

**Expected Output:**
```
✔ Prisma Migrate applied migrations:
  └─ 20240115_add_onboarding_scoring_workflow
✔ Generated Prisma Client
```

**Tables Added:**
- `organization_profiles` (50+ fields)
- `control_scores` (scoring engine)
- `tasks` (workflow)
- `notifications` (communication)

### Step 1.2: Verify Schema

Open Prisma Studio and check:
```bash
npx prisma studio
```

Navigate to:
- `organization_profiles` → Should see 50+ columns
- `control_scores` → Should see evidence_delivered, maturity_level, percentage_score
- `tasks` → Should see task_type, status, assigned_to
- `notifications` → Should see notification_type, channels, action_url

---

## 2. BACKEND INTEGRATION

### Step 2.1: Mount API Routes

**File:** `apps/bff/src/index.ts`

Add imports at top:
```typescript
import onboardingRoutes from './services/onboarding/onboarding.routes';
```

Add route mounting after existing routes:
```typescript
// GRC Onboarding Routes
app.use('/api/onboarding', onboardingRoutes);
```

**Full Example:**
```typescript
// apps/bff/src/index.ts
import express from 'express';
import cors from 'cors';
import onboardingRoutes from './services/onboarding/onboarding.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/onboarding', onboardingRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ BFF Server running on port ${PORT}`);
  console.log(`📡 Onboarding API: http://localhost:${PORT}/api/onboarding`);
});
```

### Step 2.2: Test API Endpoints

```bash
# Start backend
cd apps/bff
npm run dev

# Test in another terminal
curl http://localhost:3001/api/onboarding/sectors
```

**Expected Output:**
```json
[
  { "value": "banking", "label": "Banking & Finance", "labelAr": "الخدمات المصرفية" },
  { "value": "insurance", "label": "Insurance", "labelAr": "التأمين" },
  ...
]
```

---

## 3. FRONTEND INTEGRATION

### Step 3.1: Add Route

**File:** `apps/web/src/App.jsx` (or your router file)

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OnboardingPage from './pages/organizations/OnboardingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... existing routes ... */}

        {/* NEW: Onboarding route */}
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 3.2: Add Navigation Link

Add to your main navigation menu:

```jsx
// In your Navigation component
<Link
  to="/onboarding"
  className="nav-link"
>
  <Building2 className="w-5 h-5" />
  <span>Onboard Organization</span>
  <span className="text-xs text-gray-500" dir="rtl">تسجيل المنظمة</span>
</Link>
```

### Step 3.3: Start Frontend

```bash
cd apps/web
npm run dev

# Navigate to http://localhost:5173/onboarding
```

---

## 4. TESTING

### Test 1: Complete Onboarding Flow

**Steps:**
1. Navigate to `http://localhost:5173/onboarding`
2. Fill out Step 1 (Basic Info):
   - Organization Name: "Test Banking Corp"
   - Sector: "banking"
   - Contact Email: "test@example.com"
3. Fill out Step 2 (Size & Structure):
   - Employee Count: "250"
   - Annual Revenue: "100000000" (100M SAR)
4. Fill out Step 3 (Operations):
   - Check: "banking", "financial_services"
   - Business Model: "b2c"
5. Fill out Step 4 (Technology):
   - Data Classification: "confidential"
   - Check: "Processes PII", "Financial Data", "Online Services"
6. Fill out Step 5 (Security & Owner):
   - Security Maturity: "developing"
   - Owner Name: "John Doe"
   - Owner Email: "john@example.com"
7. Click "Complete Onboarding"

**Expected Result:**
- Loading spinner for 5-15 seconds
- Success modal appears:
  ```
  ✅ Onboarding Complete! 🎉

  Summary:
  - Organization: Test Banking Corp
  - Mandatory Frameworks: 6 (NCA ECC, SAMA, PCI-DSS, ISO 27001, PDPL, NDMO)
  - Total Controls: 287
  - Assessments Created: 6
  - Tasks Seeded: 4
  ```
- Auto-redirect to dashboard after 3 seconds

### Test 2: Verify Database Records

```bash
npx prisma studio
```

Check tables:
1. **organizations** → New record with "Test Banking Corp"
2. **organization_profiles** → 50+ fields populated
3. **assessments** → 6 new assessment records
4. **assessment_controls** → 287 control records
5. **tasks** → 4 initial tasks (review scope, upload evidence, assign team, schedule)
6. **notifications** → Welcome notification + 6 assessment notifications

### Test 3: API Endpoint Tests

```bash
# Test 1: Get sectors
curl http://localhost:3001/api/onboarding/sectors

# Test 2: Preview frameworks
curl -X POST http://localhost:3001/api/onboarding/preview \
  -H "Content-Type: application/json" \
  -d '{
    "sector": "banking",
    "employee_count": 250,
    "processes_payments": true,
    "processes_pii": true
  }'

# Expected: List of 6 mandatory frameworks for banking

# Test 3: Get frameworks
curl http://localhost:3001/api/onboarding/frameworks

# Expected: 139 frameworks
```

---

## 5. USAGE EXAMPLES

### Example 1: Using Card Components in Dashboard

**File:** `apps/web/src/pages/dashboard/DashboardPage.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import {
  StatsCard,
  FrameworkCard,
  ControlCard,
  GapCard,
  ScoreCard,
  AssessmentSummaryCard
} from '@/components/cards/AssessmentCards';
import { Shield, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [frameworks, setFrameworks] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data));

    fetch('/api/assessments')
      .then(res => res.json())
      .then(data => setFrameworks(data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Controls"
          titleAr="إجمالي الضوابط"
          value={stats.totalControls}
          subtitle="Across all frameworks"
          icon={Shield}
          color="blue"
        />

        <StatsCard
          title="Completed"
          titleAr="مكتمل"
          value={stats.completedControls}
          subtitle={`${Math.round((stats.completedControls / stats.totalControls) * 100)}% progress`}
          icon={CheckCircle2}
          trend={12}
          color="green"
        />

        <StatsCard
          title="Critical Gaps"
          titleAr="فجوات حرجة"
          value={stats.criticalGaps}
          subtitle="Require immediate attention"
          icon={AlertTriangle}
          color="red"
        />

        <StatsCard
          title="Compliance Score"
          titleAr="درجة الامتثال"
          value={`${stats.overallScore}%`}
          subtitle={stats.overallScore >= 60 ? "Above target" : "Below target"}
          icon={TrendingUp}
          trend={5}
          color={stats.overallScore >= 60 ? "green" : "red"}
        />
      </div>

      {/* Active Assessments */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Assessments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworks.map(framework => (
            <FrameworkCard
              key={framework.id}
              framework={framework}
              onClick={() => navigate(`/assessments/${framework.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
```

### Example 2: Scoring Engine Integration

**File:** `apps/bff/src/services/scoring/score-assessment.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { scoreControl, calculateMaturityLevel } from './control-scoring-engine';

const prisma = new PrismaClient();

export async function scoreAssessment(assessmentId: string) {
  // Get all assessment controls
  const assessmentControls = await prisma.assessment_controls.findMany({
    where: { assessment_id: assessmentId },
    include: {
      control_scores: true
    }
  });

  for (const assessmentControl of assessmentControls) {
    // Get evidence for this control
    const evidence = await prisma.assessment_evidence.findMany({
      where: {
        assessment_id: assessmentId,
        control_id: assessmentControl.control_id
      }
    });

    // CRITICAL: Check if evidence delivered
    const evidenceDelivered = evidence.length > 0;

    if (!evidenceDelivered) {
      // NO EVIDENCE = 0%
      await prisma.control_scores.upsert({
        where: { assessment_control_id: assessmentControl.id },
        update: {
          evidence_delivered: false,
          evidence_count: 0,
          maturity_level: 0,
          percentage_score: 0.0,
          pass_status: 'fail',
          gap_type: 'no_evidence',
          gap_severity: 'critical',
          gap_description: 'No evidence submitted for this control'
        },
        create: {
          assessment_control_id: assessmentControl.id,
          assessment_id: assessmentId,
          control_id: assessmentControl.control_id,
          tenant_id: assessmentControl.tenant_id,
          evidence_delivered: false,
          evidence_count: 0,
          maturity_level: 0,
          percentage_score: 0.0,
          pass_status: 'fail',
          gap_type: 'no_evidence',
          gap_severity: 'critical'
        }
      });
    } else {
      // EVIDENCE DELIVERED = Calculate score
      const scoreResult = await scoreControl(assessmentControl.id, evidence);

      await prisma.control_scores.upsert({
        where: { assessment_control_id: assessmentControl.id },
        update: scoreResult,
        create: {
          assessment_control_id: assessmentControl.id,
          assessment_id: assessmentId,
          control_id: assessmentControl.control_id,
          tenant_id: assessmentControl.tenant_id,
          ...scoreResult
        }
      });
    }
  }

  // Calculate overall assessment score
  const allScores = await prisma.control_scores.findMany({
    where: { assessment_id: assessmentId }
  });

  const overallScore = allScores.reduce((sum, s) => sum + s.percentage_score, 0) / allScores.length;

  await prisma.assessments.update({
    where: { id: assessmentId },
    data: { score: overallScore }
  });

  return { overallScore, controlScores: allScores };
}
```

### Example 3: Task Creation During Onboarding

**File:** `apps/bff/src/services/onboarding/seed-tasks.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedInitialTasks(
  organizationId: string,
  assessmentId: string,
  ownerId: string,
  tenantId: string
) {
  const tasks = [
    {
      tenant_id: tenantId,
      task_type: 'onboarding',
      title: 'Review Assessment Scope',
      title_ar: 'مراجعة نطاق التقييم',
      description: 'Review the assessment scope and control list. Confirm all controls are applicable.',
      description_ar: 'راجع نطاق التقييم وقائمة الضوابط. قم بتأكيد أن جميع الضوابط قابلة للتطبيق.',
      organization_id: organizationId,
      assessment_id: assessmentId,
      priority: 'high',
      status: 'pending',
      assigned_to: ownerId,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    {
      tenant_id: tenantId,
      task_type: 'evidence_review',
      title: 'Upload Initial Evidence',
      title_ar: 'تحميل الأدلة الأولية',
      description: 'Upload evidence documents for controls you have already implemented.',
      description_ar: 'قم بتحميل مستندات الأدلة للضوابط التي قمت بتنفيذها بالفعل.',
      organization_id: organizationId,
      assessment_id: assessmentId,
      priority: 'medium',
      status: 'pending',
      assigned_to: ownerId,
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    },
    {
      tenant_id: tenantId,
      task_type: 'assessment',
      title: 'Assign Team Members',
      title_ar: 'تعيين أعضاء الفريق',
      description: 'Assign team members to specific assessment sections or controls.',
      description_ar: 'قم بتعيين أعضاء الفريق لأقسام أو ضوابط معينة من التقييم.',
      organization_id: organizationId,
      assessment_id: assessmentId,
      priority: 'medium',
      status: 'pending',
      assigned_to: ownerId,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      tenant_id: tenantId,
      task_type: 'onboarding',
      title: 'Schedule Kickoff Meeting',
      title_ar: 'جدولة اجتماع البدء',
      description: 'Schedule a kickoff meeting with stakeholders to review the assessment process.',
      description_ar: 'قم بجدولة اجتماع بدء مع أصحاب المصلحة لمراجعة عملية التقييم.',
      organization_id: organizationId,
      assessment_id: assessmentId,
      priority: 'high',
      status: 'pending',
      assigned_to: ownerId,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    }
  ];

  const createdTasks = await prisma.tasks.createMany({
    data: tasks
  });

  return createdTasks;
}
```

---

## 🎯 VERIFICATION CHECKLIST

Before going to production, verify:

### Database
- [ ] All 4 new tables exist (`organization_profiles`, `control_scores`, `tasks`, `notifications`)
- [ ] Indexes created on key fields (tenant_id, assessment_id, etc.)
- [ ] Foreign key relationships working
- [ ] Sample data inserted successfully

### Backend
- [ ] `/api/onboarding` routes mounted and responding
- [ ] POST `/api/onboarding` completes in 5-15 seconds
- [ ] Database records created correctly
- [ ] Error handling working (try invalid data)
- [ ] Authentication middleware active

### Frontend
- [ ] `/onboarding` route accessible
- [ ] All 5 steps render correctly
- [ ] Form validation working
- [ ] Success modal displays
- [ ] Redirect to dashboard working
- [ ] Card components render correctly
- [ ] Bilingual support (AR/EN) working

### End-to-End
- [ ] Complete onboarding creates organization
- [ ] Profile with 50+ attributes saved
- [ ] Assessments created based on AI analysis
- [ ] Controls assigned to assessments
- [ ] Tasks seeded and assigned to owner
- [ ] Notifications sent (check database)
- [ ] Dashboard displays data correctly

---

## 🆘 TROUBLESHOOTING

### Issue: Migration Fails

**Error:** `Migration failed: Table already exists`

**Solution:**
```bash
# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Or manually drop conflicting tables
```

### Issue: API Returns 404

**Error:** `Cannot GET /api/onboarding/sectors`

**Solution:**
- Check route mounting in `apps/bff/src/index.ts`
- Verify server is running on correct port
- Check for typos in route path

### Issue: Onboarding Takes Too Long

**Error:** Onboarding takes > 30 seconds

**Solution:**
- Check database connection pool settings
- Verify Prisma query performance
- Add indexes to frequently queried fields
- Consider Redis caching for framework data

### Issue: Frontend Can't Connect to Backend

**Error:** `NetworkError: Failed to fetch`

**Solution:**
```javascript
// Check VITE_API_URL in apps/web/.env
VITE_API_URL=http://localhost:3001

// Verify CORS enabled in backend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 📚 ADDITIONAL RESOURCES

- **Prisma Docs:** https://www.prisma.io/docs
- **React Router:** https://reactrouter.com
- **Tailwind CSS:** https://tailwindcss.com
- **Lucide Icons:** https://lucide.dev

---

## ✅ SUCCESS!

If all tests pass, you now have:

✅ **Complete Database Schema** with AI-powered profiles
✅ **Automated Onboarding** in 5-15 seconds
✅ **Professional UI Components** with bilingual support
✅ **REST API Endpoints** for all operations
✅ **Evidence-Based Scoring** with 0%/20-100% rule

**Ready to onboard your first organization! 🎉**

---

**Next:** Deploy to production or start building additional features (dashboard, assessment pages, evidence upload, reporting).
