/**
 * GRC WORKFLOW TEST SUITE
 * End-to-end testing of task management APIs
 */

const http = require('http');
const BASE_URL = process.env.BFF_URL || 'http://localhost:3005';
const TENANT_ID = 'default';

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'blue');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'yellow');
}

async function makeRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port || 3005,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            success: false,
            error: `Parse error: ${error.message}`,
            rawData: data
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}async function test1_GetAllTasks() {
  logSection('TEST 1: Get All Tasks');

  const result = await makeRequest('/api/tasks?limit=10');

  if (result.success && result.data.success) {
    logSuccess(`Retrieved ${result.data.data.length} tasks`);
    logInfo(`Total tasks: ${result.data.pagination.total}`);
    logInfo(`Page: ${result.data.pagination.page}/${result.data.pagination.totalPages}`);

    if (result.data.data.length > 0) {
      const sample = result.data.data[0];
      console.log('\nSample Task:');
      console.log(`  ID: ${sample.id}`);
      console.log(`  Title: ${sample.title}`);
      console.log(`  Priority: ${sample.priority}`);
      console.log(`  Status: ${sample.status}`);
      console.log(`  Control ID: ${sample.control_id || 'N/A'}`);
    }

    return { success: true, tasks: result.data.data };
  } else {
    logError('Failed to retrieve tasks');
    console.log(result);
    return { success: false };
  }
}

async function test2_GetTaskStats() {
  logSection('TEST 2: Get Task Statistics');

  const result = await makeRequest('/api/tasks/stats');

  if (result.success && result.data.success) {
    const stats = result.data.data;
    logSuccess('Retrieved task statistics');
    console.log('\nStatistics:');
    console.log(`  Total Tasks: ${stats.total}`);
    console.log('\n  By Status:');
    console.log(`    - Pending: ${stats.byStatus.pending}`);
    console.log(`    - In Progress: ${stats.byStatus.in_progress}`);
    console.log(`    - Completed: ${stats.byStatus.completed}`);
    console.log(`    - Cancelled: ${stats.byStatus.cancelled}`);
    console.log(`    - Blocked: ${stats.byStatus.blocked}`);
    console.log('\n  By Priority:');
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      console.log(`    - ${priority}: ${count}`);
    });
    console.log('\n  By Framework:');
    const topFrameworks = Object.entries(stats.byFramework)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    topFrameworks.forEach(([framework, count]) => {
      console.log(`    - ${framework}: ${count}`);
    });
    console.log(`\n  Completion Rate: ${stats.completionRate}%`);

    return { success: true, stats };
  } else {
    logError('Failed to retrieve statistics');
    console.log(result);
    return { success: false };
  }
}

async function test3_FilterByFramework() {
  logSection('TEST 3: Filter Tasks by Framework (NCA ECC)');

  const result = await makeRequest('/api/tasks?framework=NCA ECC&limit=5');

  if (result.success && result.data.success) {
    logSuccess(`Found ${result.data.data.length} NCA ECC tasks`);

    result.data.data.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title}`);
      console.log(`   Control: ${task.control_id}`);
      console.log(`   Priority: ${task.priority} | Status: ${task.status}`);
    });

    return { success: true, tasks: result.data.data };
  } else {
    logError('Failed to filter by framework');
    console.log(result);
    return { success: false };
  }
}

async function test4_FilterByPriority() {
  logSection('TEST 4: Filter Tasks by Priority (Critical)');

  const result = await makeRequest('/api/tasks?priority=critical&limit=5');

  if (result.success && result.data.success) {
    logSuccess(`Found ${result.data.data.length} critical priority tasks`);

    result.data.data.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title}`);
      console.log(`   Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}`);
      console.log(`   Assigned: ${task.assigned_to_name || 'Unassigned'}`);
    });

    return { success: true, tasks: result.data.data };
  } else {
    logError('Failed to filter by priority');
    console.log(result);
    return { success: false };
  }
}

async function test5_SearchTasks() {
  logSection('TEST 5: Search Tasks (Risk Management)');

  const result = await makeRequest('/api/tasks?search=Risk Management&limit=5');

  if (result.success && result.data.success) {
    logSuccess(`Found ${result.data.data.length} tasks matching "Risk Management"`);

    result.data.data.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title}`);
    });

    return { success: true, tasks: result.data.data };
  } else {
    logError('Failed to search tasks');
    console.log(result);
    return { success: false };
  }
}

async function test6_GetTaskById(taskId) {
  logSection('TEST 6: Get Task by ID');

  const result = await makeRequest(`/api/tasks/${taskId}`);

  if (result.success && result.data.success) {
    const task = result.data.data;
    logSuccess('Retrieved task details');
    console.log('\nTask Details:');
    console.log(`  ID: ${task.id}`);
    console.log(`  Title: ${task.title}`);
    console.log(`  Title (AR): ${task.title_ar || 'N/A'}`);
    console.log(`  Description: ${task.description?.substring(0, 100)}...`);
    console.log(`  Control ID: ${task.control_id}`);
    console.log(`  Priority: ${task.priority}`);
    console.log(`  Status: ${task.status}`);
    console.log(`  Progress: ${task.progress_percentage}%`);
    console.log(`  Assigned To: ${task.assigned_to_name || 'Unassigned'}`);
    console.log(`  Due Date: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}`);

    return { success: true, task };
  } else {
    logError('Failed to retrieve task');
    console.log(result);
    return { success: false };
  }
}

async function test7_AssignTask(taskId) {
  logSection('TEST 7: Assign Task to User');

  const assignmentData = {
    assigned_to: 'user_123',
    assigned_to_email: 'test.user@example.com',
    assigned_to_name: 'Test User'
  };

  const result = await makeRequest(`/api/tasks/${taskId}/assign`, 'POST', assignmentData);

  if (result.success && result.data.success) {
    logSuccess('Task assigned successfully');
    console.log(`\nAssigned to: ${result.data.data.assigned_to_name}`);
    console.log(`Status: ${result.data.data.status}`);

    return { success: true, task: result.data.data };
  } else {
    logError('Failed to assign task');
    console.log(result);
    return { success: false };
  }
}

async function test8_UpdateTaskStatus(taskId) {
  logSection('TEST 8: Update Task Status to In Progress');

  const statusData = {
    status: 'in_progress'
  };

  const result = await makeRequest(`/api/tasks/${taskId}/status`, 'PATCH', statusData);

  if (result.success && result.data.success) {
    logSuccess('Task status updated');
    console.log(`\nNew Status: ${result.data.data.status}`);
    console.log(`Progress: ${result.data.data.progress_percentage}%`);

    return { success: true, task: result.data.data };
  } else {
    logError('Failed to update task status');
    console.log(result);
    return { success: false };
  }
}

async function test9_CompleteTask(taskId) {
  logSection('TEST 9: Mark Task as Completed');

  const completionData = {
    status: 'completed',
    completion_notes: 'Task completed successfully. All requirements met.',
    completion_evidence: 'Evidence document: DOC-2025-001'
  };

  const result = await makeRequest(`/api/tasks/${taskId}/status`, 'PATCH', completionData);

  if (result.success && result.data.success) {
    logSuccess('Task marked as completed');
    console.log(`\nStatus: ${result.data.data.status}`);
    console.log(`Progress: ${result.data.data.progress_percentage}%`);
    console.log(`Completed: ${new Date(result.data.data.completed_date).toLocaleString()}`);

    return { success: true, task: result.data.data };
  } else {
    logError('Failed to complete task');
    console.log(result);
    return { success: false };
  }
}

async function test10_CreateNewTask() {
  logSection('TEST 10: Create New Task');

  const newTask = {
    tenant_id: TENANT_ID,
    task_type: 'assessment',
    title: '[TEST] Security Assessment - Network Segmentation',
    title_ar: '[اختبار] تقييم الأمن - تقسيم الشبكة',
    description: 'Assess network segmentation controls and verify implementation against security standards.',
    description_ar: 'تقييم ضوابط تقسيم الشبكة والتحقق من التنفيذ وفقًا لمعايير الأمان.',
    control_id: 'TEST-NS-001',
    priority: 'high',
    status: 'pending',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    metadata: {
      section: 'Network Security',
      frameworks: ['NCA ECC v2.0', 'ISO 27001'],
      domain: 'Infrastructure Security',
      evidence_types: ['Configuration/Capture', 'Report/Review'],
      rice_score: 85,
      wsjf_score: 12
    }
  };

  const result = await makeRequest('/api/tasks', 'POST', newTask);

  if (result.success && result.data.success) {
    logSuccess('New task created');
    console.log(`\nTask ID: ${result.data.data.id}`);
    console.log(`Title: ${result.data.data.title}`);
    console.log(`Priority: ${result.data.data.priority}`);
    console.log(`Due Date: ${new Date(result.data.data.due_date).toLocaleDateString()}`);

    return { success: true, task: result.data.data };
  } else {
    logError('Failed to create task');
    console.log(result);
    return { success: false };
  }
}

async function test11_UpdateTask(taskId) {
  logSection('TEST 11: Update Task Details');

  const updates = {
    priority: 'critical',
    description: 'URGENT: Assess network segmentation controls immediately. Security audit required.',
    progress_percentage: 25
  };

  const result = await makeRequest(`/api/tasks/${taskId}`, 'PUT', updates);

  if (result.success && result.data.success) {
    logSuccess('Task updated successfully');
    console.log(`\nNew Priority: ${result.data.data.priority}`);
    console.log(`Progress: ${result.data.data.progress_percentage}%`);

    return { success: true, task: result.data.data };
  } else {
    logError('Failed to update task');
    console.log(result);
    return { success: false };
  }
}

async function test12_GetMyTasks() {
  logSection('TEST 12: Get My Assigned Tasks');

  const result = await makeRequest('/api/tasks/my-tasks?user_id=user_123');

  if (result.success && result.data.success) {
    logSuccess(`Found ${result.data.data.length} tasks assigned to user_123`);

    result.data.data.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title}`);
      console.log(`   Status: ${task.status} | Priority: ${task.priority}`);
    });

    return { success: true, tasks: result.data.data };
  } else {
    logError('Failed to get my tasks');
    console.log(result);
    return { success: false };
  }
}

async function test13_DeleteTask(taskId) {
  logSection('TEST 13: Delete Task');

  const result = await makeRequest(`/api/tasks/${taskId}`, 'DELETE');

  if (result.success && result.data.success) {
    logSuccess('Task deleted successfully');

    return { success: true };
  } else {
    logError('Failed to delete task');
    console.log(result);
    return { success: false };
  }
}

// Main test runner
async function runAllTests() {
  console.clear();
  log('\n🚀 GRC WORKFLOW TEST SUITE', 'blue');
  log('Testing Task Management APIs\n', 'blue');
  log(`BFF URL: ${BASE_URL}`, 'yellow');
  log(`Tenant ID: ${TENANT_ID}\n`, 'yellow');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  try {
    // Test 1: Get all tasks
    const test1 = await test1_GetAllTasks();
    results.tests.push({ name: 'Get All Tasks', success: test1.success });
    if (test1.success) results.passed++; else results.failed++;

    // Test 2: Get stats
    const test2 = await test2_GetTaskStats();
    results.tests.push({ name: 'Get Task Statistics', success: test2.success });
    if (test2.success) results.passed++; else results.failed++;

    // Test 3: Filter by framework
    const test3 = await test3_FilterByFramework();
    results.tests.push({ name: 'Filter by Framework', success: test3.success });
    if (test3.success) results.passed++; else results.failed++;

    // Test 4: Filter by priority
    const test4 = await test4_FilterByPriority();
    results.tests.push({ name: 'Filter by Priority', success: test4.success });
    if (test4.success) results.passed++; else results.failed++;

    // Test 5: Search tasks
    const test5 = await test5_SearchTasks();
    results.tests.push({ name: 'Search Tasks', success: test5.success });
    if (test5.success) results.passed++; else results.failed++;

    // Get a task ID for subsequent tests
    let taskId = test1.tasks && test1.tasks.length > 0 ? test1.tasks[0].id : null;

    if (taskId) {
      // Test 6: Get task by ID
      const test6 = await test6_GetTaskById(taskId);
      results.tests.push({ name: 'Get Task by ID', success: test6.success });
      if (test6.success) results.passed++; else results.failed++;

      // Test 7: Assign task
      const test7 = await test7_AssignTask(taskId);
      results.tests.push({ name: 'Assign Task', success: test7.success });
      if (test7.success) results.passed++; else results.failed++;

      // Test 8: Update status to in_progress
      const test8 = await test8_UpdateTaskStatus(taskId);
      results.tests.push({ name: 'Update Task Status', success: test8.success });
      if (test8.success) results.passed++; else results.failed++;

      // Test 9: Complete task
      const test9 = await test9_CompleteTask(taskId);
      results.tests.push({ name: 'Complete Task', success: test9.success });
      if (test9.success) results.passed++; else results.failed++;
    }

    // Test 10: Create new task
    const test10 = await test10_CreateNewTask();
    results.tests.push({ name: 'Create New Task', success: test10.success });
    if (test10.success) results.passed++; else results.failed++;

    let newTaskId = test10.task ? test10.task.id : null;

    if (newTaskId) {
      // Test 11: Update task
      const test11 = await test11_UpdateTask(newTaskId);
      results.tests.push({ name: 'Update Task', success: test11.success });
      if (test11.success) results.passed++; else results.failed++;

      // Test 12: Get my tasks
      const test12 = await test12_GetMyTasks();
      results.tests.push({ name: 'Get My Tasks', success: test12.success });
      if (test12.success) results.passed++; else results.failed++;

      // Test 13: Delete task (cleanup)
      const test13 = await test13_DeleteTask(newTaskId);
      results.tests.push({ name: 'Delete Task', success: test13.success });
      if (test13.success) results.passed++; else results.failed++;
    }

  } catch (error) {
    logError(`Test suite error: ${error.message}`);
    console.error(error);
  }

  // Print summary
  logSection('TEST SUMMARY');
  console.log(`Total Tests: ${results.tests.length}`);
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
  console.log('\nDetailed Results:');
  results.tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    const color = test.success ? 'green' : 'red';
    log(`${status} ${index + 1}. ${test.name}`, color);
  });

  const successRate = ((results.passed / results.tests.length) * 100).toFixed(2);
  console.log(`\nSuccess Rate: ${successRate}%\n`);

  if (results.failed === 0) {
    log('🎉 All tests passed!', 'green');
  } else {
    log(`⚠️  ${results.failed} test(s) failed`, 'red');
  }
}

// Run tests
runAllTests().catch(console.error);
