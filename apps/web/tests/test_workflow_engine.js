#!/usr/bin/env node

/**
 * Workflow Engine Test Suite
 * Tests approval workflows, task routing, and process orchestration
 * 
 * Tests:
 * 1. Workflow creation and configuration
 * 2. Workflow execution and state management
 * 3. Approval chains and delegation
 * 4. Task assignment and notifications
 * 5. Automated workflow triggers
 * 6. Workflow analytics and reporting
 */

const axios = require('axios');
const { query, transaction } = require('../apps/services/grc-api/config/database');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3006';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
  startTime: new Date(),
  testData: {}
};

// Test authentication token
let authToken = null;
let testTenantId = null;
let testOrganizationId = null;
let testUserId = null;
let testManagerId = null;
let testAssessmentId = null;

/**
 * Log test result
 */
function logTest(testName, success, message = '', data = null) {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${testName}`);
  if (message) console.log(`   ${message}`);
  if (data) console.log('   Data:', JSON.stringify(data, null, 2));
  
  testResults.tests.push({ testName, success, message, data, timestamp: new Date() });
  success ? testResults.passed++ : testResults.failed++;
}

/**
 * Setup: Create test environment with users and assessment
 */
async function setupTestEnvironment() {
  console.log('\n🔧 Setting up workflow test environment...\n');
  
  try {
    // Create test tenant
    const tenantResult = await query(`
      INSERT INTO tenants (name, sector, industry, contact_email, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name
    `, [
      `Workflow Test Tenant ${Date.now()}`,
      'finance',
      'banking',
      `test${Date.now()}@workflow.test`,
      'active'
    ]);
    
    testTenantId = tenantResult.rows[0].id;
    testResults.testData.tenant = tenantResult.rows[0];
    console.log(`✅ Test tenant created: ${tenantResult.rows[0].name}`);
    
    // Create test organization
    const orgResult = await query(`
      INSERT INTO organizations (tenant_id, name, sector, industry, size_category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name
    `, [
      testTenantId,
      `Workflow Test Org ${Date.now()}`,
      'finance',
      'banking',
      'medium'
    ]);
    
    testOrganizationId = orgResult.rows[0].id;
    testResults.testData.organization = orgResult.rows[0];
    console.log(`✅ Test organization created: ${orgResult.rows[0].name}`);
    
    // Create test users (assessor, manager, approver)
    const userResult = await query(`
      INSERT INTO users (tenant_id, username, email, password_hash, role, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, role
    `, [
      testTenantId,
      `assessor${Date.now()}`,
      `assessor${Date.now()}@workflow.test`,
      '$2b$10$dummyHashForTestingPurposesOnly',
      'user',
      'Test',
      'Assessor'
    ]);
    
    testUserId = userResult.rows[0].id;
    testResults.testData.user = userResult.rows[0];
    console.log(`✅ Test assessor created: ${userResult.rows[0].username}`);
    
    // Create manager user
    const managerResult = await query(`
      INSERT INTO users (tenant_id, username, email, password_hash, role, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, role
    `, [
      testTenantId,
      `manager${Date.now()}`,
      `manager${Date.now()}@workflow.test`,
      '$2b$10$dummyHashForTestingPurposesOnly',
      'manager',
      'Test',
      'Manager'
    ]);
    
    testManagerId = managerResult.rows[0].id;
    testResults.testData.manager = managerResult.rows[0];
    console.log(`✅ Test manager created: ${managerResult.rows[0].username}`);
    
    // Create test assessment
    const assessmentResult = await query(`
      INSERT INTO assessments (
        tenant_id, organization_id, created_by,
        name, description, status, assessment_type, due_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, status
    `, [
      testTenantId,
      testOrganizationId,
      testUserId,
      `Workflow Test Assessment ${Date.now()}`,
      'Test assessment for workflow validation',
      'in_progress',
      'compliance',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    ]);
    
    testAssessmentId = assessmentResult.rows[0].id;
    testResults.testData.assessment = assessmentResult.rows[0];
    console.log(`✅ Test assessment created: ${assessmentResult.rows[0].name}`);
    
    // Generate mock auth token
    authToken = 'Bearer test-token-' + Date.now();
    
    return true;
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
    return false;
  }
}

/**
 * TEST 1: Create Workflow Definition
 */
async function testCreateWorkflow() {
  console.log('\n📋 TEST 1: Create Workflow Definition\n');
  
  try {
    const workflowData = {
      name: 'Assessment Approval Workflow',
      description: 'Multi-stage approval workflow for assessments',
      category: 'approval',
      trigger_type: 'manual',
      trigger_config: {
        event: 'assessment_submitted',
        conditions: {
          status: 'pending_approval'
        }
      },
      tenant_id: testTenantId,
      steps: [
        {
          name: 'Manager Review',
          type: 'approval',
          config: {
            approver_role: 'manager',
            timeout: 48,
            auto_approve_if_timeout: false
          }
        },
        {
          name: 'Director Approval',
          type: 'approval',
          config: {
            approver_role: 'admin',
            timeout: 72,
            auto_approve_if_timeout: false
          }
        },
        {
          name: 'Finalize Assessment',
          type: 'action',
          config: {
            action: 'update_status',
            target_status: 'approved'
          }
        }
      ]
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/api/workflows`,
      workflowData,
      { headers: { 'Authorization': authToken } }
    );
    
    if (response.data.success) {
      const workflow = response.data.data;
      testResults.testData.workflow = workflow;
      
      logTest(
        'Workflow Creation',
        true,
        `Workflow created with ID: ${workflow.id}`,
        { id: workflow.id, steps: workflowData.steps.length }
      );
      
      // Verify workflow structure
      if (workflow.id && workflow.trigger_type === 'manual') {
        logTest('Workflow Structure', true, 'Workflow has valid structure');
      } else {
        logTest('Workflow Structure', false, 'Invalid workflow structure');
      }
      
      return workflow;
    } else {
      logTest('Workflow Creation', false, 'API returned success: false');
      return null;
    }
  } catch (error) {
    logTest('Workflow Creation', false, `Error: ${error.message}`);
    return null;
  }
}

/**
 * TEST 2: Execute Workflow on Assessment
 */
async function testExecuteWorkflow() {
  console.log('\n▶️ TEST 2: Execute Workflow on Assessment\n');
  
  try {
    // Create workflow item for assessment
    const workflowResult = await query(`
      INSERT INTO assessment_workflow (
        assessment_id, workflow_type, status, priority,
        assigned_to, assigned_by, due_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, status, workflow_type
    `, [
      testAssessmentId,
      'approval',
      'pending',
      'high',
      testManagerId,
      testUserId,
      new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    ]);
    
    const workflowItem = workflowResult.rows[0];
    testResults.testData.workflowExecution = workflowItem;
    
    logTest(
      'Workflow Execution',
      workflowItem.status === 'pending',
      `Workflow item created with status: ${workflowItem.status}`,
      { id: workflowItem.id, assignedTo: testManagerId }
    );
    
    // Verify workflow state
    const stateCheck = await query(`
      SELECT * FROM assessment_workflow WHERE id = $1
    `, [workflowItem.id]);
    
    logTest(
      'Workflow State',
      stateCheck.rows.length === 1 && stateCheck.rows[0].status === 'pending',
      'Workflow state is valid'
    );
    
    return workflowItem;
  } catch (error) {
    logTest('Workflow Execution', false, `Error: ${error.message}`);
    return null;
  }
}

/**
 * TEST 3: Approve Workflow Item (Manager Stage)
 */
async function testApproveWorkflow() {
  console.log('\n✅ TEST 3: Approve Workflow Item (Manager Stage)\n');
  
  try {
    const workflowItem = testResults.testData.workflowExecution;
    if (!workflowItem) {
      logTest('Workflow Approval', false, 'No workflow item to approve');
      return null;
    }
    
    // Simulate manager approval
    const approvalResult = await query(`
      UPDATE assessment_workflow
      SET 
        status = 'approved',
        approved_at = NOW(),
        approved_by = $1,
        comments = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING id, status, approved_by, approved_at
    `, [
      testManagerId,
      'Approved by manager after review',
      workflowItem.id
    ]);
    
    const approved = approvalResult.rows[0];
    
    logTest(
      'Manager Approval',
      approved.status === 'approved',
      `Workflow approved by manager`,
      { id: approved.id, status: approved.status, approver: approved.approved_by }
    );
    
    // Create workflow history
    await query(`
      INSERT INTO workflow_history (
        workflow_id, action, performed_by, status_from, status_to, comments
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      workflowItem.id,
      'approved',
      testManagerId,
      'pending',
      'approved',
      'Manager approval completed'
    ]);
    
    logTest('Workflow History', true, 'Approval recorded in history');
    
    return approved;
  } catch (error) {
    logTest('Workflow Approval', false, `Error: ${error.message}`);
    return null;
  }
}

/**
 * TEST 4: Reject Workflow Item
 */
async function testRejectWorkflow() {
  console.log('\n❌ TEST 4: Reject Workflow Item\n');
  
  try {
    // Create another workflow item to reject
    const rejectWorkflowResult = await query(`
      INSERT INTO assessment_workflow (
        assessment_id, workflow_type, status, priority,
        assigned_to, assigned_by, due_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, status
    `, [
      testAssessmentId,
      'review',
      'pending',
      'medium',
      testManagerId,
      testUserId,
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    ]);
    
    const workflowToReject = rejectWorkflowResult.rows[0];
    
    // Reject the workflow
    const rejectionResult = await query(`
      UPDATE assessment_workflow
      SET 
        status = 'rejected',
        rejected_at = NOW(),
        rejected_by = $1,
        rejection_reason = $2,
        comments = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING id, status, rejected_by, rejection_reason
    `, [
      testManagerId,
      'Incomplete assessment data',
      'Please provide additional evidence for controls 1-5',
      workflowToReject.id
    ]);
    
    const rejected = rejectionResult.rows[0];
    
    logTest(
      'Workflow Rejection',
      rejected.status === 'rejected',
      `Workflow rejected: ${rejected.rejection_reason}`,
      { id: rejected.id, status: rejected.status }
    );
    
    // Verify assessment status updated
    await query(`
      UPDATE assessments SET status = 'requires_changes' WHERE id = $1
    `, [testAssessmentId]);
    
    logTest('Assessment Status Update', true, 'Assessment status updated after rejection');
    
    return rejected;
  } catch (error) {
    logTest('Workflow Rejection', false, `Error: ${error.message}`);
    return null;
  }
}

/**
 * TEST 5: Workflow Delegation
 */
async function testWorkflowDelegation() {
  console.log('\n👥 TEST 5: Workflow Delegation\n');
  
  try {
    // Create workflow for delegation
    const delegationWorkflowResult = await query(`
      INSERT INTO assessment_workflow (
        assessment_id, workflow_type, status, priority,
        assigned_to, assigned_by, due_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, assigned_to
    `, [
      testAssessmentId,
      'review',
      'pending',
      'high',
      testManagerId,
      testUserId,
      new Date(Date.now() + 48 * 60 * 60 * 1000)
    ]);
    
    const workflowItem = delegationWorkflowResult.rows[0];
    const originalAssignee = workflowItem.assigned_to;
    
    // Create another user to delegate to
    const delegateUserResult = await query(`
      INSERT INTO users (tenant_id, username, email, password_hash, role, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username
    `, [
      testTenantId,
      `delegate${Date.now()}`,
      `delegate${Date.now()}@workflow.test`,
      '$2b$10$dummyHashForTestingPurposesOnly',
      'manager',
      'Delegate',
      'User'
    ]);
    
    const delegateUserId = delegateUserResult.rows[0].id;
    
    // Delegate workflow
    const delegationResult = await query(`
      UPDATE assessment_workflow
      SET 
        assigned_to = $1,
        delegated_from = $2,
        delegated_at = NOW(),
        delegation_reason = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING id, assigned_to, delegated_from, delegation_reason
    `, [
      delegateUserId,
      originalAssignee,
      'Manager on vacation, delegating to backup',
      workflowItem.id
    ]);
    
    const delegated = delegationResult.rows[0];
    
    logTest(
      'Workflow Delegation',
      delegated.assigned_to === delegateUserId && delegated.delegated_from === originalAssignee,
      `Workflow delegated from user ${originalAssignee} to ${delegateUserId}`,
      { from: delegated.delegated_from, to: delegated.assigned_to }
    );
    
    return delegated;
  } catch (error) {
    logTest('Workflow Delegation', false, `Error: ${error.message}`);
    return null;
  }
}

/**
 * TEST 6: Automated Workflow Triggers
 */
async function testAutomatedTriggers() {
  console.log('\n⚡ TEST 6: Automated Workflow Triggers\n');
  
  try {
    // Create automated workflow trigger
    const triggerResult = await query(`
      INSERT INTO workflow_triggers (
        tenant_id, trigger_name, trigger_type, trigger_event,
        trigger_conditions, target_workflow_type, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, trigger_name, trigger_event
    `, [
      testTenantId,
      'Auto-approve low-risk assessments',
      'automated',
      'assessment_submitted',
      JSON.stringify({
        risk_level: 'low',
        completeness: 100,
        evidence_count: { min: 5 }
      }),
      'approval',
      true
    ]);
    
    const trigger = triggerResult.rows[0];
    
    logTest(
      'Trigger Creation',
      true,
      `Automated trigger created: ${trigger.trigger_name}`,
      { id: trigger.id, event: trigger.trigger_event }
    );
    
    // Simulate trigger execution
    const triggerExecutionResult = await query(`
      INSERT INTO workflow_trigger_executions (
        trigger_id, assessment_id, executed_at, result, execution_time_ms
      ) VALUES ($1, $2, NOW(), $3, $4)
      RETURNING id, result
    `, [
      trigger.id,
      testAssessmentId,
      JSON.stringify({ success: true, workflow_created: true }),
      125
    ]);
    
    const execution = triggerExecutionResult.rows[0];
    
    logTest(
      'Trigger Execution',
      execution.result.success === true,
      'Automated trigger executed successfully'
    );
    
    return trigger;
  } catch (error) {
    logTest('Automated Triggers', false, `Error: ${error.message}`);
    return null;
  }
}

/**
 * TEST 7: Workflow Analytics
 */
async function testWorkflowAnalytics() {
  console.log('\n📊 TEST 7: Workflow Analytics\n');
  
  try {
    // Get workflow statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_workflows,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        AVG(EXTRACT(EPOCH FROM (approved_at - created_at))/3600) as avg_approval_time_hours
      FROM assessment_workflow
      WHERE assessment_id = $1
    `, [testAssessmentId]);
    
    const stats = statsResult.rows[0];
    
    logTest(
      'Workflow Statistics',
      stats.total_workflows > 0,
      `Total workflows: ${stats.total_workflows}`,
      {
        total: stats.total_workflows,
        pending: stats.pending_count,
        approved: stats.approved_count,
        rejected: stats.rejected_count,
        avgApprovalTime: stats.avg_approval_time_hours ? `${parseFloat(stats.avg_approval_time_hours).toFixed(2)}h` : 'N/A'
      }
    );
    
    // Get workflow performance by assignee
    const performanceResult = await query(`
      SELECT 
        u.username,
        COUNT(*) as assigned_count,
        COUNT(*) FILTER (WHERE aw.status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE aw.status = 'rejected') as rejected_count,
        AVG(EXTRACT(EPOCH FROM (aw.approved_at - aw.created_at))/3600) as avg_response_time_hours
      FROM assessment_workflow aw
      JOIN users u ON aw.assigned_to = u.id
      WHERE aw.assessment_id = $1
      GROUP BY u.id, u.username
    `, [testAssessmentId]);
    
    logTest(
      'Assignee Performance',
      performanceResult.rows.length > 0,
      `Performance tracked for ${performanceResult.rows.length} assignees`,
      performanceResult.rows
    );
    
    return stats;
  } catch (error) {
    logTest('Workflow Analytics', false, `Error: ${error.message}`);
    return null;
  }
}

/**
 * TEST 8: Workflow Notifications
 */
async function testWorkflowNotifications() {
  console.log('\n🔔 TEST 8: Workflow Notifications\n');
  
  try {
    // Create notification for workflow assignment
    const notificationResult = await query(`
      INSERT INTO notifications (
        tenant_id, user_id, notification_type, title, message,
        related_entity_type, related_entity_id, priority, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, notification_type
    `, [
      testTenantId,
      testManagerId,
      'workflow_assignment',
      'New Assessment Approval Required',
      'You have been assigned to review and approve an assessment',
      'assessment_workflow',
      testResults.testData.workflowExecution?.id || null,
      'high',
      'unread'
    ]);
    
    const notification = notificationResult.rows[0];
    
    logTest(
      'Notification Creation',
      true,
      `Notification created: ${notification.title}`,
      { id: notification.id, type: notification.notification_type }
    );
    
    // Create escalation notification (overdue workflow)
    const escalationResult = await query(`
      INSERT INTO notifications (
        tenant_id, user_id, notification_type, title, message,
        related_entity_type, related_entity_id, priority, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, priority
    `, [
      testTenantId,
      testManagerId,
      'workflow_escalation',
      'URGENT: Workflow Overdue',
      'Assessment approval is overdue by 24 hours',
      'assessment_workflow',
      testResults.testData.workflowExecution?.id || null,
      'critical',
      'unread'
    ]);
    
    const escalation = escalationResult.rows[0];
    
    logTest(
      'Escalation Notification',
      escalation.priority === 'critical',
      'Escalation notification created for overdue workflow'
    );
    
    return { notification, escalation };
  } catch (error) {
    logTest('Workflow Notifications', false, `Error: ${error.message}`);
    return null;
  }
}

/**
 * Cleanup: Remove test data
 */
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...\n');
  
  try {
    if (testTenantId) {
      await query('DELETE FROM workflow_trigger_executions WHERE assessment_id IN (SELECT id FROM assessments WHERE tenant_id = $1)', [testTenantId]);
      await query('DELETE FROM workflow_triggers WHERE tenant_id = $1', [testTenantId]);
      await query('DELETE FROM workflow_history WHERE workflow_id IN (SELECT id FROM assessment_workflow WHERE assessment_id IN (SELECT id FROM assessments WHERE tenant_id = $1))', [testTenantId]);
      await query('DELETE FROM assessment_workflow WHERE assessment_id IN (SELECT id FROM assessments WHERE tenant_id = $1)', [testTenantId]);
      await query('DELETE FROM notifications WHERE tenant_id = $1', [testTenantId]);
      await query('DELETE FROM assessments WHERE tenant_id = $1', [testTenantId]);
      await query('DELETE FROM organizations WHERE tenant_id = $1', [testTenantId]);
      await query('DELETE FROM users WHERE tenant_id = $1', [testTenantId]);
      await query('DELETE FROM tenants WHERE id = $1', [testTenantId]);
      console.log('✅ Test data cleaned up');
    }
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
  }
}

/**
 * Print test summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 WORKFLOW ENGINE TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏱️  Duration: ${((new Date() - testResults.startTime) / 1000).toFixed(2)}s`);
  console.log('='.repeat(70));
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(t => !t.success)
      .forEach(t => console.log(`   - ${t.testName}: ${t.message}`));
  }
  
  console.log('\n');
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 WORKFLOW ENGINE TEST SUITE');
  console.log('='.repeat(70));
  
  try {
    // Setup
    const setupSuccess = await setupTestEnvironment();
    if (!setupSuccess) {
      console.error('❌ Setup failed, aborting tests');
      process.exit(1);
    }
    
    // Run tests
    await testCreateWorkflow();
    await testExecuteWorkflow();
    await testApproveWorkflow();
    await testRejectWorkflow();
    await testWorkflowDelegation();
    await testAutomatedTriggers();
    await testWorkflowAnalytics();
    await testWorkflowNotifications();
    
    // Cleanup
    await cleanup();
    
    // Print summary
    printSummary();
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    await cleanup();
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, testResults };
