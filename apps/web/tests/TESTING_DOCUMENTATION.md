# GRC Feature Testing Documentation

## Overview
This document provides comprehensive testing documentation for the GRC (Governance, Risk, and Compliance) platform's core features:
- **Auto-Assessment Generator**: AI-powered assessment creation
- **Workflow Engine**: Approval workflows and task routing

## Test Files

### 1. `test_auto_assessment_generator.js`
Tests the autonomous assessment generation system with KSA regulator mappings.

**Test Cases:**
- ✅ Generate assessment from tenant profile
- ✅ Sector-specific regulator mapping (Finance, Healthcare, Telecom, Energy)
- ✅ Framework selection and control generation
- ✅ Multi-framework assessment creation
- ✅ Assessment scoring and priority levels
- ✅ AI-enhanced content generation

### 2. `test_workflow_engine.js`
Tests the workflow management, approval chains, and process orchestration.

**Test Cases:**
- ✅ Workflow definition creation
- ✅ Workflow execution and state management
- ✅ Approval workflow processing
- ✅ Rejection and remediation workflow
- ✅ Workflow delegation between users
- ✅ Automated workflow triggers
- ✅ Workflow analytics and reporting
- ✅ Workflow notifications and escalations

### 3. `run_all_tests.js`
Combined test runner that executes all test suites sequentially.

---

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install axios lodash

# Set environment variables
export API_BASE_URL=http://localhost:3006
export DATABASE_URL=postgresql://user:pass@localhost:5432/grc_db
```

### Run Individual Test Suites

**Auto-Assessment Generator Tests:**
```bash
node tests/test_auto_assessment_generator.js
```

**Workflow Engine Tests:**
```bash
node tests/test_workflow_engine.js
```

### Run All Tests
```bash
node tests/run_all_tests.js
```

### Run with npm scripts
Add to `package.json`:
```json
{
  "scripts": {
    "test:auto-assessment": "node tests/test_auto_assessment_generator.js",
    "test:workflow": "node tests/test_workflow_engine.js",
    "test:features": "node tests/run_all_tests.js"
  }
}
```

Then run:
```bash
npm run test:features
```

---

## Test Environment Setup

### Database Requirements
Tests require the following database tables:
- `tenants`
- `organizations`
- `users`
- `assessments`
- `assessment_workflow`
- `workflows`
- `workflow_steps`
- `workflow_triggers`
- `workflow_history`
- `notifications`
- `grc_frameworks`
- `grc_controls`
- `sector_controls`

### Test Data
Tests automatically create and clean up test data:
- Test tenants with sector profiles
- Test organizations
- Test users (assessor, manager, admin roles)
- Test assessments
- Test workflow items

**Cleanup:** All test data is automatically removed after test completion.

---

## Auto-Assessment Generator Feature

### How It Works

#### 1. **Tenant Profile Analysis**
```javascript
// System analyzes tenant profile
{
  sector: 'finance',
  industry: 'banking',
  organizationSize: 'medium'
}
```

#### 2. **Regulator Mapping (KSA-Specific)**
Based on sector/industry, the system identifies applicable regulators:

**Finance/Banking:**
- Primary: SAMA, NCA, ZATCA
- Frameworks: Basel III, SAMA Cybersecurity, PCI-DSS, AML/CFT

**Healthcare:**
- Primary: MOH, NCA, ZATCA
- Secondary: SFDA, MHRSD
- Frameworks: MOH Health Data Protection, Patient Privacy

**Telecom:**
- Primary: CITC, NCA, ZATCA
- Frameworks: CITC Telecom Regulations, Network Security

**Energy:**
- Primary: ECRA, NCA, ZATCA
- Frameworks: Critical Infrastructure Protection, Environmental Compliance

#### 3. **Framework Selection**
System selects 3-5 most relevant frameworks based on:
- Sector applicability
- Organization size
- Complexity level
- Historical assessment data

#### 4. **Control Generation**
For each framework, the system:
- Generates sector-specific controls
- Assigns priority levels (Critical/High/Medium/Low)
- Creates implementation guidance
- Defines testing procedures
- Maps evidence requirements

#### 5. **AI Enhancement** (Optional)
AI providers (OpenAI/Anthropic) enhance:
- Control descriptions
- Contextual guidance
- Implementation examples
- Risk scenarios

### API Endpoints

#### Generate Assessment from Tenant
```http
POST /api/auto-assessment/generate-from-tenant/:tenantId
Authorization: Bearer <token>

{
  "maxFrameworks": 3,
  "includeControls": true,
  "generateQuestions": true,
  "controlDensity": "comprehensive"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "uuid",
      "name": "KSA Compliance Assessment",
      "frameworks": ["ISO 27001", "SAMA Cybersecurity"],
      "controls": [/* array of controls */],
      "totalControls": 157
    },
    "regulators": {
      "primary": ["SAMA", "NCA", "ZATCA"],
      "frameworks": ["Basel III", "SAMA Cybersecurity", "PCI-DSS"]
    }
  }
}
```

#### Generate Assessment from Custom Profile
```http
POST /api/auto-assessment/generate-from-profile
Authorization: Bearer <token>

{
  "sector": "finance",
  "industry": "banking",
  "organizationSize": "large",
  "frameworks": ["ISO 27001", "SOC2"],
  "aiProvider": "openai"
}
```

---

## Workflow Engine Feature

### How It Works

#### 1. **Workflow Definition**
Define multi-step approval workflows:
```javascript
{
  name: "Assessment Approval Workflow",
  trigger_type: "manual",
  steps: [
    {
      name: "Manager Review",
      type: "approval",
      config: {
        approver_role: "manager",
        timeout: 48 // hours
      }
    },
    {
      name: "Director Approval",
      type: "approval",
      config: {
        approver_role: "admin",
        timeout: 72
      }
    }
  ]
}
```

#### 2. **Workflow Execution**
When triggered (manually or automatically):
1. Workflow item created with status `pending`
2. Assigned to first approver based on role
3. Notification sent to assignee
4. Due date calculated based on timeout

#### 3. **Approval/Rejection**
**Approval Flow:**
```
Pending → Manager Approves → Director Approves → Approved
```

**Rejection Flow:**
```
Pending → Manager Rejects → Requires Changes → Resubmit → Pending
```

#### 4. **Workflow Features**

**Delegation:**
- Transfer workflow to another user
- Record delegation reason
- Maintain audit trail

**Escalation:**
- Automatic escalation when overdue
- Configurable escalation rules
- Priority-based routing

**Notifications:**
- Assignment notifications
- Approval/rejection updates
- Escalation alerts
- Due date reminders

**Analytics:**
- Workflow performance metrics
- Average approval time
- Assignee performance
- Bottleneck identification

### API Endpoints

#### Create Workflow
```http
POST /api/workflows
Authorization: Bearer <token>

{
  "name": "Assessment Approval",
  "category": "approval",
  "trigger_type": "manual",
  "steps": [/* workflow steps */]
}
```

#### Execute Workflow on Assessment
```http
POST /api/assessment-workflow
Authorization: Bearer <token>

{
  "assessment_id": "uuid",
  "workflow_type": "approval",
  "assigned_to": "user_id",
  "priority": "high",
  "due_date": "2024-12-31"
}
```

#### Approve Workflow Item
```http
POST /api/assessment-workflow/:id/approve
Authorization: Bearer <token>

{
  "comment": "Assessment meets all requirements",
  "userId": "approver_id"
}
```

#### Reject Workflow Item
```http
POST /api/assessment-workflow/:id/reject
Authorization: Bearer <token>

{
  "reason": "Incomplete evidence",
  "comments": ["Missing control evidence", "Clarify implementation details"],
  "userId": "approver_id"
}
```

#### Delegate Workflow
```http
POST /api/assessment-workflow/:id/delegate
Authorization: Bearer <token>

{
  "delegate_to": "user_id",
  "reason": "Manager on vacation"
}
```

#### Get Workflow Analytics
```http
GET /api/workflows/analytics?assessment_id=uuid
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalWorkflows": 45,
    "pending": 8,
    "approved": 32,
    "rejected": 5,
    "avgApprovalTime": "24.5 hours",
    "performance": [
      {
        "assignee": "John Manager",
        "assigned": 15,
        "approved": 12,
        "avgResponseTime": "18 hours"
      }
    ]
  }
}
```

---

## Test Scenarios

### Auto-Assessment Generator

#### Scenario 1: Financial Institution
```javascript
Input:
- Sector: finance
- Industry: banking
- Size: large

Expected Output:
- Regulators: SAMA, NCA, ZATCA, CMA
- Frameworks: Basel III, SAMA Cybersecurity, PCI-DSS, AML/CFT
- Controls: 150-200 controls
- Priority distribution: 30% Critical/High, 50% Medium, 20% Low
```

#### Scenario 2: Healthcare Provider
```javascript
Input:
- Sector: healthcare
- Industry: hospital
- Size: medium

Expected Output:
- Regulators: MOH, NCA, ZATCA, SFDA
- Frameworks: MOH Health Data Protection, Medical Records Management
- Controls: 80-120 controls
- Special focus: Patient privacy, medical data security
```

### Workflow Engine

#### Scenario 1: Multi-Stage Approval
```
1. User submits assessment (status: pending_approval)
2. System creates workflow → Manager (48h timeout)
3. Manager approves → Director (72h timeout)
4. Director approves → Assessment approved
5. Notifications sent at each stage
```

#### Scenario 2: Rejection and Remediation
```
1. User submits assessment
2. Workflow assigned to Manager
3. Manager rejects with comments
4. Assessment status → requires_changes
5. User receives notification with rejection reasons
6. User updates assessment
7. Assessment resubmitted → New workflow created
```

#### Scenario 3: Delegation Due to Absence
```
1. Workflow assigned to Manager A
2. Manager A on vacation
3. Manager A delegates to Manager B
4. System records delegation
5. Manager B receives notification
6. Manager B completes approval
7. Delegation tracked in analytics
```

---

## Expected Results

### Auto-Assessment Generator Tests
```
✅ Generate from Tenant Profile
✅ Sector Mapping: finance (SAMA, NCA, ZATCA)
✅ Sector Mapping: healthcare (MOH, NCA, ZATCA)
✅ Sector Mapping: telecom (CITC, NCA, ZATCA)
✅ Sector Mapping: energy (ECRA, NCA, ZATCA)
✅ Framework Control Generation (3 frameworks)
✅ Control Diversity (5+ control types)
✅ Multi-Framework Generation (5 frameworks)
✅ Cross-Framework Mapping
✅ Evidence Requirements
✅ Control Priorities
✅ Scoring Configuration
✅ AI Content Generation (if enabled)

Total: 12-13 tests | Expected: All Pass
```

### Workflow Engine Tests
```
✅ Workflow Creation
✅ Workflow Structure Validation
✅ Workflow Execution
✅ Workflow State Management
✅ Manager Approval
✅ Workflow History Recording
✅ Workflow Rejection
✅ Assessment Status Update
✅ Workflow Delegation
✅ Automated Trigger Creation
✅ Trigger Execution
✅ Workflow Statistics
✅ Assignee Performance
✅ Notification Creation
✅ Escalation Notification

Total: 15 tests | Expected: All Pass
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: Connection refused to database
```
**Solution:**
- Verify DATABASE_URL environment variable
- Ensure PostgreSQL is running
- Check database credentials

#### 2. Authentication Error
```
Error: 401 Unauthorized
```
**Solution:**
- Tests use mock authentication
- Verify auth middleware is configured correctly
- Check if requirePermission middleware allows test users

#### 3. Missing Tables
```
Error: relation "assessment_workflow" does not exist
```
**Solution:**
```bash
# Run database migrations
npm run migrate

# Or execute SQL schema
psql -U postgres -d grc_db -f schema.sql
```

#### 4. API Not Reachable
```
Error: ECONNREFUSED at localhost:3006
```
**Solution:**
```bash
# Start the GRC API service
cd apps/services/grc-api
npm run dev

# Or start BFF
cd apps/bff
npm run dev
```

---

## Performance Benchmarks

### Auto-Assessment Generator
- Assessment Generation: < 2 seconds
- Control Generation (100 controls): < 500ms
- Framework Mapping: < 100ms
- AI Enhancement: 2-5 seconds (if enabled)

### Workflow Engine
- Workflow Creation: < 100ms
- Workflow Execution: < 50ms
- Approval Processing: < 100ms
- Notification Delivery: < 200ms
- Analytics Query: < 500ms

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: GRC Feature Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: grc_test
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run database migrations
        run: npm run migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/grc_test
      
      - name: Run feature tests
        run: npm run test:features
        env:
          API_BASE_URL: http://localhost:3006
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/grc_test
```

---

## Conclusion

These test suites provide comprehensive coverage of the GRC platform's core features:

**Auto-Assessment Generator:**
- ✅ Automated assessment creation
- ✅ KSA regulator compliance mapping
- ✅ Multi-framework support
- ✅ AI-enhanced content generation

**Workflow Engine:**
- ✅ Flexible workflow definitions
- ✅ Multi-stage approvals
- ✅ Delegation and escalation
- ✅ Analytics and reporting

Run these tests regularly to ensure system reliability and catch regressions early.
