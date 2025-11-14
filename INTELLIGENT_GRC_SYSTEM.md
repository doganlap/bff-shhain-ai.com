# 🎯 INTELLIGENT GRC ASSESSMENT SYSTEM

## Overview

The **Intelligent GRC Assessment System** is an automated compliance management platform that **intelligently determines which regulatory frameworks and controls apply to each organization** based on multiple factors, then generates customized assessment templates with automated scoring, gap analysis, and remediation planning.

### 🌟 Key Innovation

**NOT all companies need to comply with ALL frameworks.** Compliance requirements vary based on:
- 📊 **Sector** (Banking, Insurance, Healthcare, Telecom, Retail, etc.)
- 👥 **Company Size** (Micro, Small, Medium, Large, Enterprise)
- 🏢 **Legal Type** (LLC, PLC, Branch, Government Entity)
- 💼 **Business Activities** (Payment processing, Data handling, etc.)
- 🌍 **Geographic Operations** (Local, Regional, International)
- 🔒 **Data Sensitivity** (PII storage, Government data, Financial data)
- 🏗️ **Infrastructure Type** (Critical infrastructure designation)
- ... and **many more factors**

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION PROFILE                         │
│  (Sector, Size, Legal Type, Activities, Data, Geography, etc.) │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              APPLICABILITY ENGINE (AI Brain)                    │
│  • Analyzes 50+ factors                                         │
│  • Evaluates 139+ regulatory frameworks                         │
│  • Applies mandatory rules (NCA, SAMA, PDPL, etc.)             │
│  • Calculates applicability scores                              │
│  • Determines mandatory vs. optional frameworks                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│             APPLICABLE FRAMEWORKS MATRIX                        │
│  ✅ Framework A (Mandatory) - 85 controls                       │
│  ✅ Framework B (Mandatory) - 120 controls                      │
│  🟡 Framework C (Recommended) - 45 controls                     │
│  ❌ Framework D (Not Applicable)                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│          ASSESSMENT TEMPLATE GENERATOR                          │
│  • Filters controls by applicability                            │
│  • Assigns risk multipliers                                     │
│  • Groups by domains/categories                                 │
│  • Adds scoring criteria (0-5 maturity levels)                  │
│  • Defines evidence requirements                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│            CUSTOMIZED ASSESSMENT TEMPLATE                       │
│  📋 Only relevant controls (250 instead of 2,000+)              │
│  🎯 Tailored to organization's context                          │
│  ⏱️  Realistic timeline estimation                              │
│  📊 Factor-based scoring system                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│            ASSESSMENT EXECUTION WORKFLOW                        │
│  1️⃣  Evidence Collection → Upload docs, screenshots, logs      │
│  2️⃣  Validation → AI + Manual review                           │
│  3️⃣  Scoring → Maturity level (0-5) per control                │
│  4️⃣  Gap Report → Identify non-compliant controls              │
│  5️⃣  Gap Analysis → Root cause + risk scoring                  │
│  6️⃣  Remediation Plan → Action items with timeline             │
│  7️⃣  Implementation → Task tracking + progress monitoring      │
│  8️⃣  Follow-up → Scheduled reviews + continuous improvement    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema (Enhanced with Intelligence)

### Core GRC Tables
- `grc_frameworks` - All regulatory frameworks (139+)
- `grc_controls` - All controls (2,400+)

### 🧠 Intelligence Layer
- `regulatory_applicability_rules` - **Framework applicability logic**
- `organization_profile_factors` - **Company profile with 50+ attributes**
- `applicable_frameworks_matrix` - **Calculated applicability results**
- `control_applicability_logic` - **Control-level filtering rules**

### 📋 Assessment Workflow
- `assessments` - Assessment instances
- `assessment_controls` - Control evaluation status
- `assessment_evidence` - Uploaded evidence files
- `evidence_validation` - Validation criteria checks

### 📈 Analysis & Reporting
- `assessment_findings` - Gap identification
- `gap_analysis` - Compliance score + statistics
- `remediation_plans` - Remediation strategies
- `remediation_tasks` - Action items with assignment
- `follow_up_schedule` - Progress review schedule

---

## 🎯 Example Use Cases

### 1. Insurance Company in Saudi Arabia

**Profile:**
- Sector: Insurance (General Insurance)
- Size: Large (450 employees, 850M SAR revenue)
- Activities: Underwriting, Claims, Customer Service
- Data: 250K customer records, PII storage
- Technology: Online portal, payment processing

**Calculated Requirements:**
```
🔴 MANDATORY FRAMEWORKS (Cannot operate without):
  ✅ SAMA-CSF - SAMA Cybersecurity Framework
  ✅ SAMA-INS - SAMA Insurance Regulations
  ✅ ICSQ - Insurance Cybersecurity Self-Assessment (NEW!)
  ✅ PDPL - Personal Data Protection Law
  ✅ PCI-DSS - Payment Card Industry Security
  ✅ NCA-ECC - NCA Essential Cybersecurity Controls

🟡 RECOMMENDED FRAMEWORKS:
  ✅ ISO 27001 - Information Security Management
  ✅ SOC 2 - Service Organization Controls
  ✅ AML-CFT - Anti-Money Laundering

TOTAL CONTROLS: 287 (from 2,400+ available)
ESTIMATED TIMELINE: 45 days
```

### 2. Small FinTech Startup

**Profile:**
- Sector: FinTech (Payment Services)
- Size: Small (35 employees, 15M SAR revenue)
- Activities: Payment processing, Digital wallet
- International: Yes (UAE, Kuwait customers)

**Calculated Requirements:**
```
🔴 MANDATORY FRAMEWORKS:
  ✅ SAMA-FST - SAMA Financial Technology
  ✅ SAMA-CSF - SAMA Cybersecurity Framework
  ✅ PCI-DSS - Payment Card Industry (CRITICAL!)
  ✅ PDPL - Personal Data Protection Law
  ✅ NCA-ECC - NCA Controls (if >50 employees)

🟡 RECOMMENDED FRAMEWORKS:
  ✅ ISO 27001
  ✅ SOC 2
  ✅ GDPR (for international operations)

TOTAL CONTROLS: 145 (focused on payment security)
ESTIMATED TIMELINE: 25 days
```

### 3. Large Healthcare Provider

**Profile:**
- Sector: Healthcare (Hospital Network)
- Size: Enterprise (3,500 employees, 2.5B SAR)
- Activities: Patient care, Diagnostics, Pharmacy
- Data: 1.5M patient records (HIGHLY sensitive)
- Critical Infrastructure: Yes

**Calculated Requirements:**
```
🔴 MANDATORY FRAMEWORKS:
  ✅ MOH-PS - Patient Safety (MANDATORY)
  ✅ MOH-QM - Quality Management
  ✅ MOH-EMR - Electronic Medical Records
  ✅ CHI-NPHIES - Health Insurance Platform
  ✅ PDPL - Data Protection (CRITICAL for healthcare)
  ✅ NCA-ECC - NCA Controls (Critical infrastructure)
  ✅ NCA-CNCA - Critical National Assets

🟡 RECOMMENDED FRAMEWORKS:
  ✅ HIPAA-SEC - HIPAA Security Rule
  ✅ ISO 27001
  ✅ HL7-FHIR - Healthcare Interoperability

TOTAL CONTROLS: 425 (comprehensive healthcare compliance)
ESTIMATED TIMELINE: 90 days
```

---

## 🚀 Quick Start Usage

### Step 1: Create Organization Profile

```typescript
import { applicabilityEngine } from './services/applicability-engine';

const orgProfile = {
  organizationId: 'org-insurance-001',
  tenantId: 'tenant-001',

  // Basic Profile
  sector: 'insurance',
  legalType: 'PLC',
  companySize: 'large',

  // Size Metrics
  employeeCount: 450,
  annualRevenueSar: 850000000,

  // Business Activities
  businessActivities: ['insurance_underwriting', 'claims_processing'],

  // Data & Technology
  storesPii: true,
  processesPayments: true,
  hasOnlinePlatform: true,

  // Compliance
  existingCertifications: ['ISO27001'],
  criticalInfrastructure: false
};
```

### Step 2: Calculate Applicable Frameworks

```typescript
// Automatic calculation based on 50+ factors
const result = await applicabilityEngine.calculateApplicability(orgProfile);

console.log(`Found ${result.totalFrameworks} applicable frameworks`);
console.log(`Mandatory: ${result.mandatoryCount}`);
console.log(`Recommended: ${result.optionalCount}`);

result.applicableFrameworks.forEach(framework => {
  console.log(`${framework.isMandatory ? '🔴' : '🟡'} ${framework.frameworkName}`);
  console.log(`   Applicability Score: ${framework.applicabilityScore * 100}%`);
  console.log(`   Reason: ${framework.reason}`);
  console.log(`   Controls: ${framework.applicableControls}/${framework.totalControls}`);
});
```

### Step 3: Generate Custom Assessment Template

```typescript
import { templateGenerator } from './services/assessment-template-generator';

const template = await templateGenerator.generateTemplate(
  organizationId,
  tenantId,
  'comprehensive' // or 'quick', 'risk_based'
);

console.log(`Template: ${template.title}`);
console.log(`Total Controls: ${template.totalControls}`);
console.log(`Estimated Duration: ${template.estimatedDuration}`);

// Template contains:
// - Only applicable frameworks
// - Only applicable controls
// - Evidence requirements per control
// - Scoring criteria (0-5 maturity levels)
// - Risk multipliers
// - Implementation guidance
```

### Step 4: Create Assessment from Template

```typescript
const assessmentId = await templateGenerator.createAssessmentFromTemplate(
  template,
  tenantId,
  'user-auditor-001' // Assigned to
);

console.log(`Assessment created: ${assessmentId}`);
// Ready for evidence collection, scoring, and reporting
```

### Step 5: Execute Assessment Workflow

```typescript
// 1. Collect Evidence
await prisma.assessment_evidence.create({
  data: {
    assessment_id: assessmentId,
    control_id: 'SAMA-CSF-1-1',
    evidence_type: 'policy',
    evidence_name: 'Information Security Policy v2.0',
    file_url: 's3://bucket/policies/infosec-policy.pdf',
    validation_status: 'approved',
    meets_requirement: true
  }
});

// 2. Score Control
await prisma.assessment_controls.update({
  where: { id: controlId },
  data: {
    status: 'completed',
    compliance_status: 'compliant',
    score: 80, // Maturity Level 4
    evidence_submitted: true
  }
});

// 3. Generate Gap Analysis
await prisma.gap_analysis.create({
  data: {
    assessment_id: assessmentId,
    framework_id: frameworkId,
    total_controls: 100,
    compliant_controls: 65,
    non_compliant_controls: 15,
    overall_compliance_score: 72.5,
    gap_percentage: 27.5,
    critical_gaps: 3
  }
});

// 4. Create Remediation Plan
const plan = await prisma.remediation_plans.create({
  data: {
    assessment_id: assessmentId,
    plan_name: 'Q1 2025 Compliance Remediation',
    estimated_budget_sar: 1500000,
    estimated_effort_days: 120,
    status: 'approved'
  }
});

// 5. Add Remediation Tasks
await prisma.remediation_tasks.create({
  data: {
    remediation_plan_id: plan.id,
    task_title: 'Implement MFA for privileged accounts',
    priority: 'high',
    assigned_to: 'security-team',
    estimated_hours: 40
  }
});

// 6. Schedule Follow-ups
await prisma.follow_up_schedule.create({
  data: {
    assessment_id: assessmentId,
    follow_up_type: 'progress_review',
    title: '30-Day Progress Review',
    scheduled_date: thirtyDaysFromNow
  }
});
```

---

## 🎓 Scoring System: Maturity Levels

Each control is scored on a **0-5 maturity scale**:

| Level | Label | Description | Score |
|-------|-------|-------------|-------|
| **0** | Not Implemented | No processes or controls exist | 0% |
| **1** | Initial/Ad-hoc | Informal, undocumented processes | 20% |
| **2** | Developing | Basic documentation exists | 40% |
| **3** | Defined | Well-defined and consistent | 60% |
| **4** | Managed | Actively monitored with metrics | 80% |
| **5** | Optimizing | Continuously improved | 100% |

### Example Control Evaluation:

**Control:** "Multi-Factor Authentication for Privileged Access"

**Evidence Required:**
- ✅ MFA Policy Document
- ✅ System Configuration Screenshots
- ✅ User Access Logs showing MFA enforcement
- ✅ Training Records for administrators

**Scoring:**
- **Level 0**: No MFA implemented
- **Level 1**: MFA available but not enforced
- **Level 2**: MFA enforced for some admin accounts
- **Level 3**: MFA enforced for all admin accounts
- **Level 4**: MFA with risk-based authentication + monitoring
- **Level 5**: Adaptive MFA with AI threat detection + continuous validation

---

## 📊 Gap Analysis & Reporting

After assessment completion, the system generates comprehensive reports:

### Gap Analysis Report
```
=====================================
COMPLIANCE GAP ANALYSIS
=====================================

Framework: SAMA Cybersecurity Framework
Assessment Date: January 15, 2025

OVERALL COMPLIANCE: 72.5%
Gap: 27.5%

CONTROL BREAKDOWN:
  ✅ Compliant: 65 controls (65%)
  🟡 Partially Compliant: 20 controls (20%)
  ❌ Non-Compliant: 15 controls (15%)

PRIORITY GAPS:
  🔴 Critical: 3 gaps
  🟠 High: 8 gaps
  🟡 Medium: 4 gaps

TOP CRITICAL GAPS:
  1. Incident Response Plan - Not Documented
     Risk: HIGH | Impact: SEVERE
     Estimated Fix: 30 days, 200K SAR

  2. Data Encryption at Rest - Partially Implemented
     Risk: HIGH | Impact: MAJOR
     Estimated Fix: 45 days, 500K SAR

  3. Vendor Risk Assessment - Not Performed
     Risk: MEDIUM | Impact: MODERATE
     Estimated Fix: 60 days, 150K SAR

ESTIMATED REMEDIATION:
  Timeline: 6 months
  Budget: 1.5M SAR
  Effort: 120 person-days
```

---

## 🛠️ Technology Stack

- **Database**: PostgreSQL with Prisma ORM
- **Backend**: Node.js + TypeScript
- **Intelligence**: Rule-based engine with scoring algorithms
- **Cloud**: Prisma Postgres (accelerated)
- **Storage**: S3/Azure Blob for evidence files

---

## 📚 Regulatory Frameworks Supported

### Saudi Arabia Regulators (50+)
- **NCA** - National Cybersecurity Authority (ECC, CNCA)
- **SAMA** - Saudi Central Bank (CSF, INS, FST, ERM, BCM)
- **SDAIA** - Data & AI Authority (PDPL)
- **MOH** - Ministry of Health (PS, QM, EMR, HIS)
- **CITC** - Telecom Regulator (REG, CS, CP)
- **CMA** - Capital Market Authority (CG, MR, DR, IC, AML)
- **SFDA** - Food & Drug Authority (DATA, QM, GMP)
- **DGA** - Digital Government Authority
- **MOCI** - Commerce Ministry (CP, EC)
- **MOE** - Education Ministry

### International Standards (50+)
- **ISO** - 27001, 27002, 27017, 27018, 31000, 13485
- **PCI-DSS** - Payment Card Industry
- **NIST** - CSF, SP 800 series
- **HIPAA** - Healthcare (US)
- **GDPR** - Data Protection (EU)
- **SOC 2** - Service Organization Controls
- **COBIT** - IT Governance
- **ITIL** - Service Management
- **Basel III** - Banking

---

## 🎯 Next Steps

1. **Push Enhanced Schema**
   ```bash
   cd apps/bff
   npx prisma db push
   npx prisma generate
   ```

2. **Run Demo Examples**
   ```bash
   npx tsx src/services/grc-system-demo.ts
   ```

3. **Integrate with Frontend**
   - Organization profile form
   - Assessment dashboard
   - Evidence upload interface
   - Gap analysis charts
   - Remediation task tracker

4. **Parse KSA-ICSQ Questionnaire**
   - Extract 10,000-line HTML structure
   - Map sections to controls
   - Import scoring criteria

5. **Add AI/ML Features**
   - Automated evidence validation
   - Risk prediction models
   - Remediation recommendations
   - Compliance forecasting

---

## 📞 Support

For questions or issues:
- **Documentation**: `/docs/grc-system-guide.md`
- **API Reference**: `/docs/api-reference.md`
- **Examples**: `/apps/bff/src/services/grc-system-demo.ts`

---

## 📄 License

Proprietary - Shahin GRC Platform
© 2025 DoganConsult

---

**Built with ❤️ by Dr. Ahmed Dogan for Saudi Arabia's compliance landscape**
