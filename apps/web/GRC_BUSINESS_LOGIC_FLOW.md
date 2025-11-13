# GRC Business Logic Flow

## Navigation Structure

The navigation has been reorganized to follow the **natural GRC workflow** from setup through operations to reporting.

---

## 🎯 The 7-Stage GRC Workflow

### 1. **Dashboard & Overview** 📊
*Starting point - See the big picture*

**Purpose:** Executive overview of GRC status

**Pages:**
- Main Dashboard → `/app` (Enhanced with KPIs, heatmaps, trends)
- Analytics Dashboard → `/app/dashboard` (Detailed metrics)

**User Journey:** "Where do I stand right now?"

---

### 2. **Governance Setup** ⚙️
*Foundation - Define what to comply with and who is involved*

**Purpose:** Establish governance structure and requirements

**Pages:**
- Frameworks → `/app/frameworks` (Define standards & regulations to follow)
- Organizations → `/app/organizations` (Structure your entities)
- Users & Access → `/app/users` (Define who can do what)
- Regulators → `/app/regulators` (Track regulatory bodies)

**User Journey:** 
1. "What regulations apply to us?" → Frameworks
2. "How is our organization structured?" → Organizations  
3. "Who needs access?" → Users
4. "Who regulates us?" → Regulators

**Business Logic:** You must define your governance structure BEFORE you can assess risks or track compliance.

---

### 3. **Risk Management** ⚠️
*Identify, assess & mitigate risks*

**Purpose:** Proactive risk identification and treatment

**Pages:**
- Risk Register → `/app/risks` (Identify and catalog all risks)
- Risk Assessment → `/app/risk-management` (Assess likelihood × impact, plan treatments)
- Controls → `/app/controls` (Implement mitigating controls)

**User Journey:**
1. "What could go wrong?" → Risk Register
2. "How bad is it? What should we do?" → Risk Assessment
3. "What controls mitigate these risks?" → Controls

**Business Logic:** 
- First IDENTIFY risks
- Then ASSESS their severity
- Finally IMPLEMENT controls to mitigate them

---

### 4. **Compliance Operations** ✅
*Assess, track & prove compliance*

**Purpose:** Execute compliance activities and maintain evidence

**Pages:**
- Assessments → `/app/assessments` (Conduct compliance assessments)
- Compliance Tracking → `/app/compliance` (Monitor ongoing compliance status)
- Evidence → `/app/evidence` (Collect and manage proof)
- Audit Trail → `/app/audit-logs` (Track all changes)

**User Journey:**
1. "Let's assess against a framework" → Assessments
2. "Are we compliant?" → Compliance Tracking
3. "Where's the proof?" → Evidence
4. "What changed?" → Audit Trail

**Business Logic:**
- ASSESS compliance against frameworks
- TRACK ongoing compliance status
- COLLECT evidence to prove compliance
- AUDIT everything for accountability

---

### 5. **Reporting & Intelligence** 📈
*Insights & regulatory updates*

**Purpose:** Generate reports and stay informed about regulatory changes

**Pages:**
- Reports & Analytics → `/app/reports` (Generate compliance reports)
- Regulatory Intelligence → `/app/regulatory-intelligence` (Track regulatory changes)
- Sector Intelligence → `/app/sector-intelligence` (Industry insights)

**User Journey:**
1. "Show me our compliance status" → Reports
2. "What's changing in regulations?" → Regulatory Intelligence
3. "What are industry trends?" → Sector Intelligence

**Business Logic:**
- REPORT on current status
- MONITOR regulatory changes
- LEARN from industry insights

---

### 6. **Automation & AI** 🤖
*Intelligent automation & assistance*

**Purpose:** Automate repetitive tasks and get AI assistance

**Pages:**
- Workflows → `/app/workflows` (Automate business processes)
- AI Scheduler → `/app/ai-scheduler` (Intelligent task scheduling)
- RAG AI Assistant → `/app/rag` (AI-powered knowledge base)
- Regulatory Engine → `/app/regulatory-engine` (Automated regulatory monitoring)

**User Journey:**
1. "Automate this process" → Workflows
2. "Schedule assessments intelligently" → AI Scheduler
3. "Ask AI about compliance" → RAG Assistant
4. "Auto-monitor regulations" → Regulatory Engine

**Business Logic:** Automate and enhance all previous stages with AI

---

### 7. **Administration** ⚙️
*System management & configuration*

**Purpose:** Support functions and system administration

**Pages:**
- Documents → `/app/documents` (Document repository)
- Partners → `/app/partners` (Third-party relationships)
- Notifications → `/app/notifications` (Alert management)
- Performance → `/app/performance` (System monitoring)
- Database → `/app/database` (Data management)
- API Management → `/app/api-management` (API configuration)
- Settings → `/app/settings` (System configuration)

**User Journey:** Supporting functions for system administration

---

## 📋 Navigation State

**Open by Default:**
1. ✅ Dashboard (always visible - starting point)
2. ✅ Governance Setup (foundation must be visible)

**Collapsed by Default:**
3. Risk Management
4. Compliance Operations  
5. Reporting & Intelligence
6. Automation & AI
7. Administration

**Why?** Users start with dashboard and governance setup. Other sections expand as needed during workflow.

---

## 🔄 Typical User Workflows

### New Organization Setup
```
1. Dashboard (See current state)
2. Frameworks (Select ISO 27001, SAMA, etc.)
3. Organizations (Create org structure)
4. Users (Add team members)
5. Regulators (Add SAMA, CMA)
```

### Risk Assessment Cycle
```
1. Risk Register (Identify new risks)
2. Risk Assessment (L×I matrix, score = 20, High)
3. Controls (Implement access control)
4. Evidence (Upload implementation proof)
5. Compliance Tracking (Monitor effectiveness)
```

### Compliance Assessment
```
1. Dashboard (Check current compliance %)
2. Assessments (Launch SAMA assessment)
3. RAG AI (Get help with questions)
4. Evidence (Attach required documents)
5. Compliance Tracking (Monitor progress)
6. Reports (Generate final report)
```

### Regulatory Update
```
1. Regulatory Intelligence (New SAMA update detected)
2. Frameworks (Update framework version)
3. Assessments (Reassess affected controls)
4. Compliance Tracking (Track new gaps)
5. Workflows (Trigger remediation)
```

---

## 🎨 Visual Flow

```
START
  ↓
[1. Dashboard] ← Always return here for overview
  ↓
[2. Governance Setup]
  ├─ Frameworks (What to comply with)
  ├─ Organizations (Who we are)
  ├─ Users (Who does what)
  └─ Regulators (Who regulates us)
  ↓
[3. Risk Management]
  ├─ Risk Register (Identify)
  ├─ Risk Assessment (Assess)
  └─ Controls (Mitigate)
  ↓
[4. Compliance Operations]
  ├─ Assessments (Assess)
  ├─ Compliance Tracking (Monitor)
  ├─ Evidence (Prove)
  └─ Audit Trail (Track)
  ↓
[5. Reporting & Intelligence]
  ├─ Reports (Report status)
  ├─ Regulatory Intelligence (Stay updated)
  └─ Sector Intelligence (Learn trends)
  ↓
[6. Automation & AI] ← Enhance any stage
  ├─ Workflows (Automate)
  ├─ AI Scheduler (Schedule)
  ├─ RAG AI (Assist)
  └─ Regulatory Engine (Monitor)
  ↓
[7. Administration] ← Support all stages
  └─ System management
  ↓
LOOP BACK TO DASHBOARD
```

---

## ✅ Benefits of This Structure

1. **Logical Progression:** Follows natural GRC workflow
2. **Clear Phases:** Each stage has distinct purpose
3. **Intuitive:** Users know where to go next
4. **Scalable:** Easy to add new features in right category
5. **Training-Friendly:** New users learn the process through navigation
6. **Business-Aligned:** Matches how GRC actually works

---

## 🎓 Learning Path for New Users

**Week 1: Setup**
- Dashboard overview
- Add frameworks
- Create org structure
- Invite users

**Week 2: Operations**
- Identify risks
- Conduct assessments
- Track compliance

**Week 3: Advanced**
- Generate reports
- Use AI assistant
- Automate workflows

---

*This structure ensures users follow best practices naturally through the navigation itself.*
