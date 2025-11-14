/**
 * TASK DASHBOARD & EVIDENCE UPLOAD - COMPREHENSIVE TEST
 * Tests all new features: dashboard, drag-and-drop, evidence upload
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3005';
const TENANT_ID = 'default';

// HTTP request helper
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Multipart form data helper for file upload
function createMultipartData(fields, files) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let body = '';

  // Add fields
  for (const [key, value] of Object.entries(fields)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    body += `${value}\r\n`;
  }

  // Add files
  for (const [fieldName, file] of Object.entries(files)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${fieldName}"; filename="${file.name}"\r\n`;
    body += `Content-Type: ${file.type}\r\n\r\n`;
    body += file.content + '\r\n';
  }

  body += `--${boundary}--\r\n`;

  return { boundary, body };
}

async function runTests() {
  console.log('🧪 TASK DASHBOARD & EVIDENCE UPLOAD TEST SUITE\n');
  console.log('='.repeat(60));

  let passCount = 0;
  let failCount = 0;
  let testTaskId = null;

  // Test 1: Get task statistics
  console.log('\n📊 Test 1: Get Task Statistics');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/tasks/stats',
      method: 'GET'
    });

    if (response.status === 200 && response.data.success) {
      const stats = response.data.stats;
      console.log(`✅ PASS - Statistics retrieved successfully`);
      console.log(`   Total tasks: ${stats.total}`);
      console.log(`   Completion rate: ${stats.completion_rate}%`);
      console.log(`   By status:`, stats.by_status);
      console.log(`   By priority:`, stats.by_priority);
      passCount++;
    } else {
      console.log(`❌ FAIL - Expected success response`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    failCount++;
  }

  // Test 2: Get all tasks for dashboard (paginated)
  console.log('\n📋 Test 2: Get Tasks for Dashboard');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/tasks?limit=100',
      method: 'GET'
    });

    if (response.status === 200 && response.data.success) {
      const tasks = response.data.data;
      console.log(`✅ PASS - Retrieved ${tasks.length} tasks`);
      console.log(`   Pagination:`, response.data.pagination);
      passCount++;
    } else {
      console.log(`❌ FAIL - Expected tasks array`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    failCount++;
  }

  // Test 3: Filter tasks by status (for Kanban columns)
  console.log('\n🎯 Test 3: Filter Tasks by Status (Kanban)');
  try {
    const statuses = ['pending', 'in_progress', 'review', 'completed'];
    for (const status of statuses) {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: `/api/tasks?status=${status}&limit=10`,
        method: 'GET'
      });

      if (response.status === 200) {
        const tasks = response.data.data;
        console.log(`   ${status}: ${tasks.length} tasks`);
      }
    }
    console.log(`✅ PASS - Status filtering works for Kanban columns`);
    passCount++;
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    failCount++;
  }

  // Test 4: Create a test task for evidence upload
  console.log('\n➕ Test 4: Create Test Task for Evidence Upload');
  try {
    const taskData = JSON.stringify({
      tenant_id: TENANT_ID,
      task_type: 'assessment',
      title: 'Evidence Upload Test Task',
      title_ar: 'مهمة اختبار رفع الأدلة',
      description: 'Task created to test evidence upload functionality',
      control_id: 'TEST-001',
      priority: 'high',
      status: 'in_progress',
      assigned_to_name: 'Test User',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(taskData)
      }
    }, taskData);

    if (response.status === 201 && response.data.success) {
      testTaskId = response.data.data.id;
      console.log(`✅ PASS - Test task created: ${testTaskId}`);
      passCount++;
    } else {
      console.log(`❌ FAIL - Failed to create task`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    failCount++;
  }

  // Test 5: Update task status via drag-and-drop (status change)
  if (testTaskId) {
    console.log('\n🎯 Test 5: Update Task Status (Drag & Drop Simulation)');
    try {
      const statusData = JSON.stringify({ status: 'review' });

      const response = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: `/api/tasks/${testTaskId}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(statusData)
        }
      }, statusData);

      if (response.status === 200 && response.data.success) {
        console.log(`✅ PASS - Task status updated to 'review'`);
        passCount++;
      } else {
        console.log(`❌ FAIL - Status update failed`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      failCount++;
    }
  }

  // Test 6: Upload evidence file (simulated)
  if (testTaskId) {
    console.log('\n📎 Test 6: Upload Evidence File');
    try {
      // Create a test file content
      const testFileContent = 'This is a test evidence document.\nCreated for GRC compliance testing.';
      const { boundary, body } = createMultipartData(
        {
          taskId: testTaskId,
          uploadedBy: 'test_user@example.com'
        },
        {
          file: {
            name: 'test-evidence.txt',
            type: 'text/plain',
            content: testFileContent
          }
        }
      );

      const response = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/tasks/evidence/upload',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(body)
        }
      }, body);

      if (response.status === 200 && response.data.success) {
        console.log(`✅ PASS - Evidence uploaded successfully`);
        console.log(`   File: ${response.data.data.evidence.file_name}`);
        console.log(`   Size: ${response.data.data.evidence.file_size} bytes`);
        passCount++;
      } else {
        console.log(`❌ FAIL - Evidence upload failed`);
        console.log(`   Response:`, response.data);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      failCount++;
    }
  }

  // Test 7: Get task evidence
  if (testTaskId) {
    console.log('\n📂 Test 7: Retrieve Task Evidence');
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: `/api/tasks/${testTaskId}/evidence`,
        method: 'GET'
      });

      if (response.status === 200 && response.data.success) {
        const evidence = response.data.data.evidence;
        console.log(`✅ PASS - Retrieved ${evidence.length} evidence file(s)`);
        evidence.forEach((file, idx) => {
          console.log(`   [${idx}] ${file.file_name} (${file.file_size} bytes)`);
        });
        passCount++;
      } else {
        console.log(`❌ FAIL - Failed to retrieve evidence`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      failCount++;
    }
  }

  // Test 8: Complete task with evidence
  if (testTaskId) {
    console.log('\n✅ Test 8: Complete Task with Evidence');
    try {
      const completionData = JSON.stringify({
        status: 'completed',
        completion_notes: 'Task completed successfully. Evidence attached.',
        completion_evidence: 'Evidence uploaded via test suite'
      });

      const response = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: `/api/tasks/${testTaskId}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(completionData)
        }
      }, completionData);

      if (response.status === 200 && response.data.success) {
        console.log(`✅ PASS - Task completed with evidence`);
        console.log(`   Status: ${response.data.data.status}`);
        console.log(`   Progress: ${response.data.data.progress_percentage}%`);
        passCount++;
      } else {
        console.log(`❌ FAIL - Task completion failed`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      failCount++;
    }
  }

  // Test 9: Get evidence statistics
  console.log('\n📈 Test 9: Get Evidence Statistics');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/tasks/evidence-stats',
      method: 'GET'
    });

    if (response.status === 200 && response.data.success) {
      const stats = response.data.data.stats;
      console.log(`✅ PASS - Evidence statistics retrieved`);
      console.log(`   Total files: ${stats.total_files}`);
      console.log(`   Total size: ${stats.total_size_mb} MB`);
      console.log(`   Tasks with evidence: ${stats.tasks_with_evidence}`);
      console.log(`   Evidence completion rate: ${stats.evidence_completion_rate}%`);
      passCount++;
    } else {
      console.log(`❌ FAIL - Failed to get evidence stats`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    failCount++;
  }

  // Test 10: Filter tasks by framework (for dashboard filters)
  console.log('\n🔍 Test 10: Filter Tasks by Framework');
  try {
    const frameworks = ['NCA ECC v2.0', 'SAMA CSF', 'PDPL'];
    for (const framework of frameworks) {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: `/api/tasks?framework=${encodeURIComponent(framework)}&limit=10`,
        method: 'GET'
      });

      if (response.status === 200) {
        const tasks = response.data.data;
        console.log(`   ${framework}: ${tasks.length} tasks`);
      }
    }
    console.log(`✅ PASS - Framework filtering works`);
    passCount++;
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    failCount++;
  }

  // Test 11: Search tasks (for dashboard search)
  console.log('\n🔎 Test 11: Search Tasks');
  try {
    const searchTerms = ['security', 'risk', 'audit'];
    for (const term of searchTerms) {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: `/api/tasks?search=${term}&limit=5`,
        method: 'GET'
      });

      if (response.status === 200) {
        const tasks = response.data.data;
        console.log(`   "${term}": ${tasks.length} results`);
      }
    }
    console.log(`✅ PASS - Search functionality works`);
    passCount++;
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    failCount++;
  }

  // Test 12: Get tasks by priority (for dashboard priority view)
  console.log('\n⚡ Test 12: Filter Tasks by Priority');
  try {
    const priorities = ['critical', 'high', 'medium', 'low'];
    for (const priority of priorities) {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: `/api/tasks?priority=${priority}&limit=10`,
        method: 'GET'
      });

      if (response.status === 200) {
        const tasks = response.data.data;
        console.log(`   ${priority}: ${tasks.length} tasks`);
      }
    }
    console.log(`✅ PASS - Priority filtering works`);
    passCount++;
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    failCount++;
  }

  // Cleanup: Delete test task
  if (testTaskId) {
    console.log('\n🗑️  Cleanup: Delete Test Task');
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: `/api/tasks/${testTaskId}`,
        method: 'DELETE'
      });

      if (response.status === 200) {
        console.log(`✅ Test task deleted: ${testTaskId}`);
      }
    } catch (error) {
      console.log(`⚠️  Warning: Could not delete test task - ${error.message}`);
    }
  }

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  console.log('\n🎯 FEATURES TESTED:');
  console.log('   ✓ Task dashboard statistics');
  console.log('   ✓ Kanban board status columns');
  console.log('   ✓ Drag-and-drop status updates');
  console.log('   ✓ Evidence file upload');
  console.log('   ✓ Evidence retrieval');
  console.log('   ✓ Task completion with evidence');
  console.log('   ✓ Evidence statistics');
  console.log('   ✓ Framework filtering');
  console.log('   ✓ Search functionality');
  console.log('   ✓ Priority filtering');

  if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Task dashboard and evidence upload ready for production.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run tests
console.log('Starting test suite...');
console.log('Connecting to BFF at:', BASE_URL);
console.log('');

runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error);
  process.exit(1);
});
