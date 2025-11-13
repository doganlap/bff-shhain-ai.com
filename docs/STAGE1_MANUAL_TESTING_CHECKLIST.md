# Stage 1 Manual Testing Checklist

## Pre-Testing Setup

### Start All Services
```bash
# Terminal 1: Backend Service
cd apps/services/regulatory-intelligence-service-ksa
npm start

# Terminal 2: BFF
cd apps/bff
npm start

# Terminal 3: Frontend
cd apps/web
npm run dev
```

**Wait for all services to start (30-60 seconds)**

---

## Frontend UI Testing Checklist

### Test Environment
- **Browser:** Chrome/Edge (recommended)
- **URL:** http://localhost:5173
- **User:** Test admin user
- **Organization:** Test organization with sector assigned

---

## Part 1: Login & Navigation (5 tests)

### ✅ Test 1: Login
- [ ] Open http://localhost:5173
- [ ] Enter valid credentials
- [ ] Click login
- [ ] **Expected:** Redirects to dashboard
- [ ] **Expected:** No console errors

### ✅ Test 2: Navigate to Regulatory Intelligence
- [ ] Look for "Regulatory Intelligence" or "مركز الذكاء التنظيمي" in sidebar/menu
- [ ] Click menu item
- [ ] **Expected:** Navigates to `/app/regulatory`
- [ ] **Expected:** Page loads without errors

### ✅ Test 3: Page Header
- [ ] Check page title shows: "مركز الذكاء التنظيمي"
- [ ] Check English subtitle shows: "Regulatory Intelligence Center"
- [ ] Check refresh button is visible
- [ ] **Expected:** All elements present
- [ ] **Expected:** RTL layout (right-to-left)

### ✅ Test 4: Statistics Cards
- [ ] Check 4 statistics cards display
- [ ] Cards show:
  - Total changes (إجمالي التغييرات)
  - Critical changes (تغييرات حرجة)
  - This week (هذا الأسبوع)
  - This month (هذا الشهر)
- [ ] Numbers display (may be 0 initially)
- [ ] Icons render correctly
- [ ] **Expected:** All cards visible and formatted correctly

### ✅ Test 5: Filter Controls
- [ ] Check regulator dropdown exists
- [ ] Check urgency dropdown exists
- [ ] Dropdowns show Arabic + English text
- [ ] **Expected:** Both dropdowns functional

---

## Part 2: Regulatory Feed Widget (10 tests)

### ✅ Test 6: Empty State
- [ ] If no data in database, check for empty state message
- [ ] **Expected:** Shows "لا توجد تغييرات تنظيمية جديدة"
- [ ] **Expected:** Shows icon and message

### ✅ Test 7: Loading State
- [ ] Refresh page
- [ ] Observe loading state
- [ ] **Expected:** Shows skeleton/loading animation
- [ ] **Expected:** Transitions to content when loaded

### ✅ Test 8: Data Display
**Setup:** Run manual scrape first:
```bash
curl -X POST http://localhost:3008/api/regulatory/scrape/SAMA
```
- [ ] Refresh page
- [ ] **Expected:** Shows regulatory changes
- [ ] **Expected:** Each change shows:
  - Urgency badge with color (🔴🟠🟡🟢)
  - Date in Arabic
  - Regulator name
  - Title
  - Description (if available)
  - Affected sectors tags
  - Deadline date (if available)
  - Three action buttons

### ✅ Test 9: Urgency Color Coding
- [ ] Check urgency badges have correct colors:
  - Critical = Red background
  - High = Orange background
  - Medium = Yellow background
  - Low = Green background
- [ ] **Expected:** Colors match urgency levels

### ✅ Test 10: Regulator Filter
- [ ] Select "SAMA" from regulator dropdown
- [ ] **Expected:** Feed shows only SAMA changes
- [ ] Select "NCA" from dropdown
- [ ] **Expected:** Feed shows only NCA changes
- [ ] Select "All Regulators"
- [ ] **Expected:** Feed shows all changes

### ✅ Test 11: Urgency Filter
- [ ] Select "Critical" from urgency dropdown
- [ ] **Expected:** Shows only critical changes
- [ ] Select "High"
- [ ] **Expected:** Shows only high urgency changes
- [ ] Combined filters (SAMA + Critical)
- [ ] **Expected:** Shows only SAMA critical changes

### ✅ Test 12: View Impact Button
- [ ] Click "عرض التأثير" (View Impact) button
- [ ] **Expected:** Modal opens
- [ ] **Expected:** Loading state shows
- [ ] **Expected:** Impact data loads
- [ ] (See modal tests below)

### ✅ Test 13: Add to Calendar Button
- [ ] Click "إضافة للتقويم" (Add to Calendar) button
- [ ] Open browser DevTools → Network tab
- [ ] **Expected:** API call to `/api/regulatory/calendar/add`
- [ ] **Expected:** Success response or proper error handling
- [ ] **Expected:** Visual feedback (alert/toast)

### ✅ Test 14: External Link Button
- [ ] Click "الرابط" (Link) button
- [ ] **Expected:** Opens regulation URL in new tab
- [ ] **Expected:** Link is valid (or button disabled if no URL)

### ✅ Test 15: Date Formatting
- [ ] Check dates display in Arabic format
- [ ] Check Hijri calendar dates (if available)
- [ ] **Expected:** Dates readable and properly formatted

---

## Part 3: Impact Assessment Modal (8 tests)

### ✅ Test 16: Modal Opening
- [ ] Click "View Impact" on any regulatory change
- [ ] **Expected:** Modal appears
- [ ] **Expected:** Background darkens
- [ ] **Expected:** Modal centered on screen

### ✅ Test 17: Modal Header
- [ ] Check modal shows:
  - "تقييم التأثير - Impact Assessment"
  - Regulator name
  - Change title
  - Close (X) button
- [ ] **Expected:** All elements visible

### ✅ Test 18: Impact Score Display
- [ ] Check impact score shows (e.g., "7/10")
- [ ] Check score has color coding:
  - 8-10 = Red
  - 6-7 = Orange
  - 4-5 = Yellow
  - 1-3 = Green
- [ ] **Expected:** Score visible and colored correctly

### ✅ Test 19: Key Metrics
- [ ] Check three metric cards show:
  - Estimated Cost (التكلفة المقدرة)
  - Timeline (الجدول الزمني)
  - Responsible Department (القسم المسؤول)
- [ ] **Expected:** All metrics display
- [ ] **Expected:** Values populated

### ✅ Test 20: Key Changes Section
- [ ] Check "Key Changes" section exists
- [ ] Check numbered list of changes
- [ ] **Expected:** List displays clearly
- [ ] **Expected:** Arabic/English text readable

### ✅ Test 21: Required Actions Section
- [ ] Check "Required Actions" section exists
- [ ] Check checklist items with checkmarks
- [ ] **Expected:** Actions listed clearly
- [ ] **Expected:** Readable and actionable

### ✅ Test 22: Close Modal
- [ ] Click X button in top right
- [ ] **Expected:** Modal closes
- [ ] Click background (outside modal)
- [ ] **Expected:** Modal closes
- [ ] Click "إغلاق" (Close) button at bottom
- [ ] **Expected:** Modal closes

### ✅ Test 23: Add to Calendar from Modal
- [ ] Click "إضافة إلى التقويم" button
- [ ] **Expected:** API call made
- [ ] **Expected:** Success alert shows
- [ ] **Expected:** Modal closes
- [ ] **Expected:** Calendar widget updates

---

## Part 4: Compliance Calendar Widget (7 tests)

### ✅ Test 24: Widget Display
- [ ] Check calendar widget on right side
- [ ] Title shows: "تقويم الامتثال"
- [ ] Subtitle shows: "Compliance Calendar"
- [ ] **Expected:** Widget visible and formatted

### ✅ Test 25: Days Filter Buttons
- [ ] Check three buttons: 30 يوم, 60 يوم, 90 يوم
- [ ] Click each button
- [ ] **Expected:** Active button highlighted
- [ ] **Expected:** Calendar data updates

### ✅ Test 26: Empty State
- [ ] If no deadlines, check for empty state
- [ ] **Expected:** Shows checkmark icon
- [ ] **Expected:** Shows "لا توجد مواعيد نهائية قادمة"

### ✅ Test 27: Deadline Items
**Setup:** Add item to calendar first
- [ ] Check deadline items display
- [ ] Each item shows:
  - Title
  - Regulator name
  - Deadline date (Gregorian)
  - Hijri date (if available)
  - Days until deadline badge
- [ ] **Expected:** All information visible

### ✅ Test 28: Days Until Deadline
- [ ] Check color coding:
  - ≤ 7 days = Red
  - ≤ 14 days = Orange
  - ≤ 30 days = Yellow
  - > 30 days = Green
- [ ] **Expected:** Colors match urgency

### ✅ Test 29: Mark Complete Button
- [ ] Click "تحديد كمكتمل" (Mark Complete) button
- [ ] **Expected:** API call made
- [ ] **Expected:** Item updates or disappears
- [ ] **Expected:** Visual confirmation

### ✅ Test 30: Alert Icon for Urgent Items
- [ ] Items within 14 days should show warning triangle
- [ ] **Expected:** Orange alert icon visible

---

## Part 5: Responsiveness (4 tests)

### ✅ Test 31: Desktop View (1920px)
- [ ] Open in full screen
- [ ] **Expected:** 3-column layout (Feed + Feed + Calendar)
- [ ] **Expected:** All content visible
- [ ] **Expected:** No horizontal scroll

### ✅ Test 32: Laptop View (1366px)
- [ ] Resize browser to 1366px width
- [ ] **Expected:** 2-column layout (Feed + Calendar)
- [ ] **Expected:** Content adjusts properly

### ✅ Test 33: Tablet View (768px)
- [ ] Resize to 768px width
- [ ] **Expected:** Single column layout
- [ ] **Expected:** Calendar below feed
- [ ] **Expected:** All features accessible

### ✅ Test 34: Mobile View (375px)
- [ ] Resize to 375px width or use mobile device
- [ ] **Expected:** Mobile-optimized layout
- [ ] **Expected:** Buttons are tappable
- [ ] **Expected:** Text readable
- [ ] **Expected:** No horizontal scroll

---

## Part 6: Arabic/RTL Testing (5 tests)

### ✅ Test 35: RTL Layout
- [ ] Check entire page is right-to-left
- [ ] Check Arabic text aligns to right
- [ ] Check English text aligns to left (when mixed)
- [ ] **Expected:** Proper RTL layout throughout

### ✅ Test 36: Arabic Text Display
- [ ] Check all Arabic labels render correctly
- [ ] No broken characters or encoding issues
- [ ] Arabic numbers formatted correctly
- [ ] **Expected:** Clean Arabic text throughout

### ✅ Test 37: Hijri Calendar Dates
- [ ] Check Hijri dates display correctly
- [ ] Format: ١٤٤٥/٠٥/٠١ (Arabic-Indic numerals)
- [ ] **Expected:** Hijri dates formatted properly

### ✅ Test 38: Bilingual Content
- [ ] Check Arabic and English both present
- [ ] Labels show: "Arabic - English" format
- [ ] **Expected:** Clean bilingual display

### ✅ Test 39: Cultural Elements
- [ ] Check for Islamic calendar awareness
- [ ] Check date formats respect Saudi locale
- [ ] **Expected:** Culturally appropriate

---

## Part 7: Error Handling (6 tests)

### ✅ Test 40: Backend Down
- [ ] Stop backend service
- [ ] Refresh page
- [ ] **Expected:** Error message shows
- [ ] **Expected:** No white screen of death
- [ ] **Expected:** User-friendly error message

### ✅ Test 41: Network Error
- [ ] Simulate slow network (DevTools → Network → Slow 3G)
- [ ] Refresh page
- [ ] **Expected:** Loading states show
- [ ] **Expected:** Timeout handled gracefully
- [ ] **Expected:** Error message if timeout exceeded

### ✅ Test 42: Invalid Data
- [ ] Manually insert invalid data in DB (e.g., NULL title)
- [ ] Refresh page
- [ ] **Expected:** Skips invalid records or shows error
- [ ] **Expected:** Page doesn't crash

### ✅ Test 43: API Error Response
- [ ] Trigger API error (e.g., scrape invalid regulator)
- [ ] **Expected:** Error message displayed to user
- [ ] **Expected:** Error is user-friendly (not technical)

### ✅ Test 44: Modal Error State
- [ ] Open impact modal for change with no AI analysis
- [ ] **Expected:** Shows error state or loading failure message
- [ ] **Expected:** Close button still works

### ✅ Test 45: Calendar Error
- [ ] Try to add invalid item to calendar
- [ ] **Expected:** Error message shows
- [ ] **Expected:** Page remains functional

---

## Part 8: User Experience Flow (Complete Scenarios)

### ✅ Scenario 1: Morning Compliance Officer Routine
**Steps:**
1. [ ] Login to platform
2. [ ] Navigate to Regulatory Intelligence
3. [ ] View statistics (should show overnight changes)
4. [ ] Filter to show only their regulator (e.g., SAMA)
5. [ ] Click on critical change
6. [ ] View AI impact analysis
7. [ ] Review required actions
8. [ ] Add to compliance calendar
9. [ ] Check calendar widget for new deadline
10. [ ] **Expected:** Smooth workflow, no errors, clear information

### ✅ Scenario 2: Executive Quick Review
**Steps:**
1. [ ] Login to platform
2. [ ] View dashboard (with regulatory widget if added)
3. [ ] See top 3 critical changes in widget
4. [ ] Click widget to go to full page
5. [ ] Filter to "Critical" urgency only
6. [ ] Review titles and regulators
7. [ ] Export/screenshot for board meeting
8. [ ] **Expected:** Quick access to critical information

### ✅ Scenario 3: Add Multiple Deadlines
**Steps:**
1. [ ] Go to Regulatory Intelligence page
2. [ ] View 5 different regulatory changes
3. [ ] Click "Add to Calendar" on each
4. [ ] Go to calendar widget
5. [ ] Verify all 5 appear in calendar
6. [ ] Filter to 30 days
7. [ ] **Expected:** All deadlines tracked correctly

### ✅ Scenario 4: Complete Compliance Task
**Steps:**
1. [ ] View calendar widget
2. [ ] Find completed compliance task
3. [ ] Click "Mark Complete" button
4. [ ] **Expected:** Item updates
5. [ ] **Expected:** Item removed from pending list
6. [ ] **Expected:** Confirmation shown

---

## Part 9: Cross-Browser Testing

### ✅ Test in Chrome
- [ ] All tests above pass
- [ ] No console errors
- [ ] Performance acceptable

### ✅ Test in Edge
- [ ] All tests above pass
- [ ] No console errors
- [ ] Performance acceptable

### ✅ Test in Firefox
- [ ] All tests above pass
- [ ] Arabic text displays correctly
- [ ] No console errors

### ✅ Test in Safari (if available)
- [ ] All tests above pass
- [ ] Date formatting works
- [ ] No console errors

---

## Part 10: Data Integrity Testing

### ✅ Test 46: Run Full Scrape
```bash
# In terminal, run scrapes for all regulators
curl -X POST http://localhost:3008/api/regulatory/scrape/SAMA
curl -X POST http://localhost:3008/api/regulatory/scrape/NCA
curl -X POST http://localhost:3008/api/regulatory/scrape/MOH
curl -X POST http://localhost:3008/api/regulatory/scrape/ZATCA
curl -X POST http://localhost:3008/api/regulatory/scrape/SDAIA
curl -X POST http://localhost:3008/api/regulatory/scrape/CMA
```

Then on frontend:
- [ ] Refresh page
- [ ] **Expected:** Shows data from all 6 regulators
- [ ] **Expected:** Can filter by each regulator
- [ ] **Expected:** Statistics updated correctly

### ✅ Test 47: AI Impact Analysis
- [ ] Click "View Impact" on a regulatory change
- [ ] Wait for AI analysis (may take 3-5 seconds)
- [ ] **Expected:** Shows impact score (1-10)
- [ ] **Expected:** Shows required actions
- [ ] **Expected:** Shows estimated cost
- [ ] **Expected:** Analysis makes sense contextually

### ✅ Test 48: Calendar Date Accuracy
- [ ] Add item with deadline to calendar
- [ ] Check Gregorian date is correct
- [ ] Check Hijri date is correct (if shown)
- [ ] Check "days until" calculation is accurate
- [ ] **Expected:** All dates accurate

---

## Part 11: Performance Testing (User Perspective)

### ✅ Test 49: Page Load Speed
- [ ] Open DevTools → Network tab
- [ ] Hard refresh page (Ctrl+Shift+R)
- [ ] Check "Load" time
- [ ] **Expected:** < 3 seconds for initial load
- [ ] **Expected:** < 1 second for subsequent loads (cached)

### ✅ Test 50: Filter Performance
- [ ] Change regulator filter 10 times rapidly
- [ ] **Expected:** UI remains responsive
- [ ] **Expected:** No lag or freezing

### ✅ Test 51: Scroll Performance
- [ ] If 50+ changes, scroll through feed
- [ ] **Expected:** Smooth scrolling
- [ ] **Expected:** No janky animation

### ✅ Test 52: Modal Performance
- [ ] Open and close modal 5 times rapidly
- [ ] **Expected:** Smooth animation
- [ ] **Expected:** No memory leaks

---

## Part 12: Accessibility Testing

### ✅ Test 53: Keyboard Navigation
- [ ] Use Tab key to navigate through page
- [ ] **Expected:** Can reach all interactive elements
- [ ] **Expected:** Focus indicators visible
- [ ] Press Enter on buttons
- [ ] **Expected:** Buttons activate

### ✅ Test 54: Screen Reader (if available)
- [ ] Enable screen reader
- [ ] Navigate through page
- [ ] **Expected:** Elements are announced
- [ ] **Expected:** Alt text present on icons

### ✅ Test 55: Color Contrast
- [ ] Check text is readable
- [ ] Check color combinations meet WCAG standards
- [ ] **Expected:** Good contrast ratios

---

## Part 13: Edge Cases

### ✅ Test 56: Very Long Titles
- [ ] Insert test data with very long title (200+ characters)
- [ ] View in feed
- [ ] **Expected:** Text truncates or wraps properly
- [ ] **Expected:** No layout breaking

### ✅ Test 57: Special Characters
- [ ] Test with Arabic special characters: إ أ ؤ ئ
- [ ] Test with English special characters: & < > "
- [ ] **Expected:** All render correctly
- [ ] **Expected:** No HTML injection

### ✅ Test 58: Large Dataset
- [ ] Insert 100+ regulatory changes in database
- [ ] Load page
- [ ] **Expected:** Handles large dataset
- [ ] **Expected:** Scrolling works smoothly
- [ ] **Expected:** Filters still performant

### ✅ Test 59: Concurrent Users
- [ ] Open in two different browsers/incognito windows
- [ ] Login as different users/organizations
- [ ] Both add same item to calendar
- [ ] **Expected:** Each user's calendar separate (tenant isolation)

### ✅ Test 60: Session Timeout
- [ ] Login and go to regulatory page
- [ ] Wait for session to expire (or manually expire session)
- [ ] Try to interact (click button)
- [ ] **Expected:** Redirects to login
- [ ] **Expected:** No data loss

---

## Part 14: Mobile Testing

### ✅ Test 61: Mobile Chrome (Android)
- [ ] Open on Android device
- [ ] **Expected:** Layout mobile-optimized
- [ ] **Expected:** All features accessible
- [ ] **Expected:** Touch targets large enough

### ✅ Test 62: Mobile Safari (iOS)
- [ ] Open on iOS device
- [ ] **Expected:** Layout mobile-optimized
- [ ] **Expected:** All features work
- [ ] **Expected:** No rendering issues

---

## Testing Report Template

```
STAGE 1 MANUAL TESTING REPORT
Date: _______________
Tester: _______________
Browser: _______________
OS: _______________

RESULTS:
- Part 1 (Login & Navigation): ____ / 5 passed
- Part 2 (Regulatory Feed): ____ / 10 passed
- Part 3 (Impact Modal): ____ / 8 passed
- Part 4 (Calendar Widget): ____ / 7 passed
- Part 5 (Responsiveness): ____ / 4 passed
- Part 6 (Arabic/RTL): ____ / 5 passed
- Part 7 (Error Handling): ____ / 6 passed
- Part 8 (User Scenarios): ____ / 4 passed
- Part 9 (Cross-Browser): ____ / 4 passed
- Part 10 (Data Integrity): ____ / 3 passed
- Part 11 (Performance): ____ / 4 passed
- Part 12 (Accessibility): ____ / 3 passed
- Part 13 (Edge Cases): ____ / 5 passed
- Part 14 (Mobile): ____ / 2 passed

TOTAL: ____ / 70 passed

CRITICAL ISSUES:
1. _______________
2. _______________

MINOR ISSUES:
1. _______________
2. _______________

PRODUCTION READY: YES / NO

Notes:
_______________________________________________
_______________________________________________

Approved by: _______________
Date: _______________
```

---

## Quick Test Commands

```bash
# Run automated backend tests
cd apps/services/regulatory-intelligence-service-ksa
./test-production-ready.sh

# Or on Windows:
.\test-production-ready.ps1

# Manual scrape test (populate data for testing)
curl -X POST http://localhost:3008/api/regulatory/scrape/SAMA
curl -X POST http://localhost:3008/api/regulatory/scrape/NCA

# Check data was saved
curl http://localhost:3008/api/regulatory/changes

# Check stats updated
curl http://localhost:3008/api/regulatory/stats
```

---

## Minimum Pass Criteria

**To deploy to production, must have:**
- ✅ 90%+ of tests passing
- ✅ Zero critical failures
- ✅ All security tests pass
- ✅ Performance within targets
- ✅ Works on primary browser (Chrome/Edge)
- ✅ Arabic/RTL working correctly
- ✅ Mobile responsive

**Warnings acceptable (but should fix):**
- Optional services not configured (WhatsApp, SMS)
- Minor UI tweaks needed
- Performance slightly below target

**Not acceptable for production:**
- Any security test failures
- Service crashes
- Data corruption
- Authentication bypass
- Cross-tenant data leakage

---

**Estimated Testing Time:** 2-4 hours for complete manual testing  
**Recommended:** Test twice (once in dev, once in staging before production)

