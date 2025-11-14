# GRC Feature Testing - Visual Guide

## Test Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GRC Feature Test Suite                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────────────────────┐
                              │                                 │
                    ┌─────────▼─────────┐          ┌───────────▼────────┐
                    │  Auto-Assessment  │          │  Workflow Engine   │
                    │   Generator Tests │          │       Tests        │
                    └─────────┬─────────┘          └───────────┬────────┘
                              │                                 │
        ┌─────────────────────┼─────────────┐         ┌────────┼────────┐
        │                     │             │         │        │        │
   ┌────▼────┐        ┌──────▼──────┐  ┌──▼────┐  ┌─▼──┐  ┌──▼───┐  ┌─▼────┐
   │Tenant   │        │  Regulator  │  │Multi- │  │Def │  │Exec │  │Analy-│
   │Profile  │        │   Mapping   │  │Frame  │  │    │  │     │  │tics  │
   │Generate │        │   (SAMA,    │  │work   │  │    │  │     │  │      │
   │         │        │   MOH, etc) │  │       │  │    │  │     │  │      │
   └─────────┘        └─────────────┘  └───────┘  └────┘  └─────┘  └──────┘
```

## Test Flow Diagram

### Auto-Assessment Generator

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Auto-Assessment Generator Flow                    │
└──────────────────────────────────────────────────────────────────────┘

1. Setup Environment
   │
   ├─> Create Test Tenant
   │   (Sector: Finance, Industry: Banking)
   │
   ├─> Create Test Organization
   │
   └─> Create Test User (Admin)

2. Test: Generate from Tenant Profile
   │
   ├─> Input: tenantId
   │
   ├─> System analyzes profile
   │   ├─> Sector: finance
   │   ├─> Industry: banking
   │   └─> Size: medium
   │
   ├─> Map to KSA Regulators
   │   ├─> SAMA (Primary)
   │   ├─> NCA (Primary)
   │   ├─> ZATCA (Primary)
   │   └─> CMA (Secondary)
   │
   ├─> Select Frameworks
   │   ├─> Basel III
   │   ├─> SAMA Cybersecurity
   │   └─> PCI-DSS
   │
   ├─> Generate Controls
   │   ├─> 157 controls created
   │   ├─> Priority assigned
   │   └─> Evidence requirements
   │
   └─> Validate: ✅ PASS

3. Test: Sector-Specific Mapping
   │
   ├─> Test Finance → SAMA, NCA, ZATCA ✅
   ├─> Test Healthcare → MOH, NCA, ZATCA ✅
   ├─> Test Telecom → CITC, NCA, ZATCA ✅
   └─> Test Energy → ECRA, NCA, ZATCA ✅

4. Test: Multi-Framework
   │
   ├─> Generate with 5 frameworks
   ├─> Verify cross-framework mapping
   └─> Validate evidence requirements ✅

5. Cleanup
   │
   └─> Delete all test data
```

### Workflow Engine

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Workflow Engine Flow                            │
└──────────────────────────────────────────────────────────────────────┘

1. Setup Environment
   │
   ├─> Create Test Tenant
   │
   ├─> Create Test Organization
   │
   ├─> Create Test Users
   │   ├─> Assessor (User)
   │   ├─> Manager (Manager)
   │   └─> Director (Admin)
   │
   └─> Create Test Assessment

2. Test: Create Workflow Definition
   │
   ├─> Define 3-stage workflow
   │   ├─> Stage 1: Manager Review (48h)
   │   ├─> Stage 2: Director Approval (72h)
   │   └─> Stage 3: Finalize
   │
   └─> Validate structure ✅

3. Test: Execute Workflow
   │
   ├─> Create workflow item
   │   ├─> Status: pending
   │   ├─> Assigned to: Manager
   │   └─> Due: 48 hours
   │
   └─> Verify state ✅

4. Test: Approval Flow
   │
   ├─> Manager approves
   │   ├─> Status: pending → approved
   │   ├─> Timestamp recorded
   │   └─> History updated ✅
   │
   └─> Assessment proceeds to Director

5. Test: Rejection Flow
   │
   ├─> Manager rejects
   │   ├─> Status: pending → rejected
   │   ├─> Reason: "Incomplete evidence"
   │   └─> Comments recorded ✅
   │
   └─> Assessment returns to submitter

6. Test: Delegation
   │
   ├─> Manager A delegates to Manager B
   │   ├─> Original assignee tracked
   │   ├─> Delegation reason recorded
   │   └─> Manager B notified ✅
   │
   └─> Manager B completes approval

7. Test: Automated Triggers
   │
   ├─> Create trigger
   │   ├─> Event: assessment_submitted
   │   ├─> Condition: risk_level = low
   │   └─> Action: auto-approve
   │
   ├─> Execute trigger ✅
   │
   └─> Workflow auto-created

8. Test: Analytics
   │
   ├─> Calculate metrics
   │   ├─> Total workflows: 5
   │   ├─> Approved: 3
   │   ├─> Rejected: 1
   │   ├─> Pending: 1
   │   └─> Avg time: 24.5h ✅
   │
   └─> Assignee performance tracked

9. Test: Notifications
   │
   ├─> Assignment notification ✅
   ├─> Approval notification ✅
   └─> Escalation alert ✅

10. Cleanup
    │
    └─> Delete all test data
```

## Test Execution Timeline

```
Time    Auto-Assessment Tests              Workflow Engine Tests
────────────────────────────────────────────────────────────────────
0s      ▶ Start setup                      
1s      │ Create tenant/org/user           
2s      │ Setup complete ✅                 
3s      ▶ Test 1: Generate from tenant     
5s      │ ✅ PASS                            
6s      ▶ Test 2: Sector mapping (4 tests) 
10s     │ ✅ PASS (all 4)                    
11s     ▶ Test 3: Framework controls        
13s     │ ✅ PASS                            
14s     ▶ Test 4: Multi-framework           
17s     │ ✅ PASS                            
18s     ▶ Test 5: Scoring                   
19s     │ ✅ PASS                            
20s     ▶ Test 6: AI enhancement            
22s     │ ✅ PASS                            
23s     ▶ Cleanup                           
24s     │ Complete                          
────────────────────────────────────────────────────────────────────
0s                                          ▶ Start setup
1s                                          │ Create users/assessment
2s                                          │ Setup complete ✅
3s                                          ▶ Test 1: Create workflow
4s                                          │ ✅ PASS
5s                                          ▶ Test 2: Execute workflow
6s                                          │ ✅ PASS
7s                                          ▶ Test 3: Approve
8s                                          │ ✅ PASS
9s                                          ▶ Test 4: Reject
10s                                         │ ✅ PASS
11s                                         ▶ Test 5: Delegation
13s                                         │ ✅ PASS
14s                                         ▶ Test 6: Triggers
15s                                         │ ✅ PASS
16s                                         ▶ Test 7: Analytics
17s                                         │ ✅ PASS
18s                                         ▶ Test 8: Notifications
19s                                         │ ✅ PASS
20s                                         ▶ Cleanup
21s                                         │ Complete
────────────────────────────────────────────────────────────────────
Total: 24s                                 Total: 21s
Combined: ~25s (if run sequentially)
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Test Suite                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ├─────────────────────────────────────┐
                         │                                     │
                    ┌────▼─────┐                         ┌────▼─────┐
                    │   BFF    │                         │ GRC API  │
                    │ (Port    │◄────────────────────────┤ (Port    │
                    │  3006)   │                         │  3000)   │
                    └────┬─────┘                         └────┬─────┘
                         │                                     │
                         │                                     │
                    ┌────▼─────────────────────────────────────▼─────┐
                    │            PostgreSQL Database                 │
                    │                                                 │
                    │  ┌──────────┐  ┌────────────┐  ┌────────────┐ │
                    │  │ tenants  │  │assessments │  │ workflows  │ │
                    │  └──────────┘  └────────────┘  └────────────┘ │
                    │  ┌──────────┐  ┌────────────┐  ┌────────────┐ │
                    │  │  users   │  │  controls  │  │notifications│ │
                    │  └──────────┘  └────────────┘  └────────────┘ │
                    └─────────────────────────────────────────────────┘
```

## Test Data Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    Test Data Lifecycle                          │
└─────────────────────────────────────────────────────────────────┘

1. SETUP PHASE
   │
   ├─> Create Tenant
   │   └─> tenant_id: "test-tenant-123"
   │
   ├─> Create Organization
   │   └─> org_id: "test-org-456"
   │
   ├─> Create Users
   │   ├─> user_id: "assessor-789"
   │   ├─> user_id: "manager-012"
   │   └─> user_id: "admin-345"
   │
   └─> Create Assessment
       └─> assessment_id: "test-assessment-678"

2. TEST EXECUTION PHASE
   │
   ├─> Generate controls
   │   └─> 157 controls created
   │
   ├─> Create workflows
   │   └─> 5 workflow items created
   │
   ├─> Create notifications
   │   └─> 8 notifications created
   │
   └─> Record history
       └─> 12 history entries

3. VALIDATION PHASE
   │
   ├─> Query and verify data
   │   ├─> Assessment has controls ✅
   │   ├─> Workflows have correct status ✅
   │   └─> Notifications sent ✅
   │
   └─> Calculate metrics
       └─> All metrics valid ✅

4. CLEANUP PHASE
   │
   ├─> Delete notifications
   ├─> Delete workflow history
   ├─> Delete workflows
   ├─> Delete controls
   ├─> Delete assessment
   ├─> Delete users
   ├─> Delete organization
   └─> Delete tenant
       └─> All test data removed ✅

Database remains clean for next test run
```

## Success Criteria Matrix

```
┌────────────────────────────────────────────────────────────────┐
│              Test Success Criteria Matrix                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Auto-Assessment Generator                                      │
│ ┌────────────────────────────────────────┬─────────┬─────────┐│
│ │ Test Case                              │Expected │  Actual ││
│ ├────────────────────────────────────────┼─────────┼─────────┤│
│ │ Generate from tenant                   │  PASS   │  ✅     ││
│ │ Regulator mapping (4 sectors)          │  PASS   │  ✅     ││
│ │ Control generation (>100 controls)     │  PASS   │  ✅     ││
│ │ Multi-framework (5 frameworks)         │  PASS   │  ✅     ││
│ │ Priority distribution (valid levels)   │  PASS   │  ✅     ││
│ │ Scoring configuration                  │  PASS   │  ✅     ││
│ └────────────────────────────────────────┴─────────┴─────────┘│
│                                                                │
│ Workflow Engine                                                │
│ ┌────────────────────────────────────────┬─────────┬─────────┐│
│ │ Test Case                              │Expected │  Actual ││
│ ├────────────────────────────────────────┼─────────┼─────────┤│
│ │ Workflow creation                      │  PASS   │  ✅     ││
│ │ Workflow execution                     │  PASS   │  ✅     ││
│ │ Approval processing                    │  PASS   │  ✅     ││
│ │ Rejection handling                     │  PASS   │  ✅     ││
│ │ Delegation                             │  PASS   │  ✅     ││
│ │ Automated triggers                     │  PASS   │  ✅     ││
│ │ Analytics calculation                  │  PASS   │  ✅     ││
│ │ Notifications                          │  PASS   │  ✅     ││
│ └────────────────────────────────────────┴─────────┴─────────┘│
│                                                                │
│ Overall Result: ✅ ALL TESTS PASSED                            │
│ Total Tests: 28                                                │
│ Passed: 28 | Failed: 0                                         │
│ Duration: 24.5 seconds                                         │
└────────────────────────────────────────────────────────────────┘
```

## Quick Reference Commands

```bash
# Run all tests
npm run test:features

# Run specific test suite
npm run test:auto-assessment
npm run test:workflow

# Run with quick start (environment validation)
npm run test:quick

# Direct execution
node tests/test_auto_assessment_generator.js
node tests/test_workflow_engine.js
node tests/run_all_tests.js

# Using bash script (Linux/Mac)
./run_feature_tests.sh
./run_feature_tests.sh --auto-assessment
./run_feature_tests.sh --workflow
```

## Environment Setup Checklist

```
☐ PostgreSQL installed and running
☐ Database created (grc_db)
☐ Schema/migrations applied
☐ DATABASE_URL environment variable set
☐ BFF service running (port 3006)
☐ GRC API service running (port 3000)
☐ Node.js 16+ installed
☐ npm dependencies installed
☐ Test directory permissions correct
☐ Network connectivity to database
```

## Troubleshooting Decision Tree

```
Test fails?
  │
  ├─> Database error?
  │   ├─> Connection refused?
  │   │   └─> Check PostgreSQL is running
  │   └─> Permission denied?
  │       └─> Grant proper database permissions
  │
  ├─> API error?
  │   ├─> ECONNREFUSED?
  │   │   └─> Start BFF/GRC API services
  │   └─> 401 Unauthorized?
  │       └─> Check auth middleware configuration
  │
  ├─> Data error?
  │   ├─> Table not found?
  │   │   └─> Run database migrations
  │   └─> Constraint violation?
  │       └─> Clean up test data manually
  │
  └─> Environment error?
      ├─> DATABASE_URL not set?
      │   └─> Export DATABASE_URL
      └─> Node modules missing?
          └─> Run npm install
```

---

**Last Updated:** December 2024  
**Test Version:** 1.0.0
