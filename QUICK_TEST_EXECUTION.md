# 🎯 QUICK TEST EXECUTION

**Run this to test all cards and APIs in 2 minutes!**

---

## 🚀 ONE-COMMAND TEST

```powershell
.\run-all-tests.ps1
```

**This executes:**
- ✅ 7 Card Components (48 tests)
- ✅ 10 API Endpoints (backend)
- ✅ Database schema validation
- ✅ TypeScript compilation
- ✅ ESLint code quality
- ✅ Integration checks

**Duration:** 2-5 minutes
**Expected:** All tests PASS ✅

---

## 📊 WHAT'S BEING TESTED

### Card Components (7 components)
1. **MaturityBadge** - Levels 0-5 with bilingual labels (0%, 20%, 40%, 60%, 80%, 100%)
2. **StatsCard** - KPI metrics with trends
3. **FrameworkCard** - Framework info with progress
4. **ControlCard** - Control with maturity & evidence
5. **GapCard** - Gap analysis with severity
6. **ScoreCard** - Circular progress visualization
7. **AssessmentSummaryCard** - Assessment overview

### Backend APIs (10 test suites)
1. **Onboarding API** - Organization onboarding (5-15s)
2. **Organization Dashboard API** - Stats, assessments, controls, gaps
3. **Assessment Execution API** - Assessment details, sections, controls
4. **Evidence Upload API** - Upload, validation, listing
5. **Task Management API** - 6,911 tasks, filters, stats
6. **Gap Analysis API** - Gaps, severity, cost/effort
7. **Scoring Engine** - 0%/20-100% rule validation
8. **Evidence Validation** - File size, type, count checks
9. **Reporting Engine** - Report generation
10. **Data Flow Integration** - API → Card data mapping

---

## 📁 TEST FILES

```
apps/bff/src/tests/card-api-test.ts          ← Backend API tests
apps/web/src/tests/AssessmentCards.test.jsx  ← Frontend card tests
run-all-tests.ps1                            ← Test runner
CARD_API_TESTING_GUIDE.md                    ← Full documentation
```

---

## 🔍 MANUAL QUICK TESTS

### Test Backend APIs Only
```bash
cd apps/bff
npm install
ts-node src/tests/card-api-test.ts
```

### Test Frontend Cards Only
```bash
cd apps/web
npm install
npm test -- AssessmentCards.test.jsx
```

---

## ✅ EXPECTED OUTPUT

```
═══════════════════════════════════════════════════════════
   SHAHIN GRC - COMPREHENSIVE TEST SUITE
═══════════════════════════════════════════════════════════

🧪 TEST 1: Backend API Tests (BFF)
─────────────────────────────────────────────────────────────
✅ Backend API Tests: PASSED

🧪 TEST 2: Frontend Card Component Tests (React)
─────────────────────────────────────────────────────────────
✅ Card Component Tests: PASSED (48/48)

🧪 TEST 3: Database Schema Validation
─────────────────────────────────────────────────────────────
✅ Database Schema: VALID

🧪 TEST 4: TypeScript Compilation
─────────────────────────────────────────────────────────────
✅ TypeScript Compilation: SUCCESS

🧪 TEST 5: ESLint Code Quality
─────────────────────────────────────────────────────────────
✅ ESLint: NO ISSUES

🧪 TEST 6: API Route Integration Check
─────────────────────────────────────────────────────────────
✅ All API Routes: MOUNTED

🧪 TEST 7: Component Import Validation
─────────────────────────────────────────────────────────────
✅ All Card Components: EXPORTED

═══════════════════════════════════════════════════════════
   TEST SUMMARY
═══════════════════════════════════════════════════════════

✅ Backend API Tests: PASS
✅ Card Component Tests: PASS
✅ Database Schema: PASS
✅ TypeScript Compilation: PASS
✅ ESLint Code Quality: PASS
✅ API Route Integration: PASS
✅ Component Import Validation: PASS

─────────────────────────────────────────────────────────────
Total Tests: 7
Passed: 7
Failed: 0
Warnings: 0
Errors: 0
Duration: 3.45s
─────────────────────────────────────────────────────────────

🎉 ALL TESTS PASSED!
```

---

## 🐛 TROUBLESHOOTING

### If tests fail:

1. **Check dependencies:**
   ```bash
   cd apps/bff && npm install
   cd apps/web && npm install
   ```

2. **Check database connection:**
   ```bash
   cd apps/bff
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Check environment variables:**
   ```bash
   cat apps/bff/.env
   # Verify DATABASE_URL is set
   ```

4. **Re-run tests:**
   ```powershell
   .\run-all-tests.ps1
   ```

---

## 📚 FULL DOCUMENTATION

For detailed test documentation, see:
**`CARD_API_TESTING_GUIDE.md`**

---

**Ready to test?** Run: `.\run-all-tests.ps1` 🚀
