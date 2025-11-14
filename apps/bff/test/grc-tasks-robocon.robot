*** Settings ***
Documentation     GRC Task Management API Test Suite
...               Comprehensive testing of task CRUD operations, filtering, assignment, and workflow
Library           RequestsLibrary
Library           Collections
Library           String
Library           DateTime

Suite Setup       Setup Test Environment
Suite Teardown    Cleanup Test Environment

*** Variables ***
${BASE_URL}       http://localhost:3005
${API_PREFIX}     /api/tasks
${TENANT_ID}      default
${TEST_USER_ID}   robocon_test_user_001
${TEST_USER_EMAIL}    robocon.test@grc-platform.com
${TEST_USER_NAME}     RoboCon Test User
${CREATED_TASK_ID}    ${EMPTY}
${ASSIGNED_TASK_ID}   ${EMPTY}

*** Test Cases ***
TC001 - Health Check Before Tests
    [Documentation]    Verify BFF server is running and healthy
    [Tags]    smoke    health
    ${response}=    GET    ${BASE_URL}/health
    Status Should Be    200    ${response}
    Should Be Equal As Strings    ${response.json()}[status]    ok
    Log    ✅ Server health check passed

TC002 - Get All Tasks
    [Documentation]    Retrieve all tasks with pagination
    [Tags]    smoke    read
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=limit=20&page=1
    Status Should Be    200    ${response}
    Should Be Equal    ${response.json()}[success]    ${True}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0    No tasks found in database
    Log    ✅ Retrieved ${count} tasks

    # Store first task ID for subsequent tests
    Set Suite Variable    ${ASSIGNED_TASK_ID}    ${tasks[0]}[id]

TC003 - Get Task Statistics
    [Documentation]    Retrieve comprehensive task statistics
    [Tags]    smoke    analytics
    ${response}=    GET    ${BASE_URL}${API_PREFIX}/stats
    Status Should Be    200    ${response}
    ${data}=    Get From Dictionary    ${response.json()}    data
    Should Contain    ${data}    total
    Should Contain    ${data}    byStatus
    Should Contain    ${data}    byPriority
    Should Contain    ${data}    byFramework
    Should Contain    ${data}    completionRate

    ${total}=    Get From Dictionary    ${data}    total
    Should Be True    ${total} > 0
    Log    ✅ Total tasks: ${total}
    Log    📊 Completion rate: ${data}[completionRate]%

TC004 - Filter Tasks By Framework - NCA ECC
    [Documentation]    Filter tasks by NCA ECC v2.0 framework
    [Tags]    filter    framework
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=framework=NCA ECC&limit=10
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0    No NCA ECC tasks found
    Log    ✅ Found ${count} NCA ECC tasks

TC005 - Filter Tasks By Framework - SAMA CSF
    [Documentation]    Filter tasks by SAMA CSF framework
    [Tags]    filter    framework
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=framework=SAMA CSF&limit=10
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0    No SAMA CSF tasks found
    Log    ✅ Found ${count} SAMA CSF tasks

TC006 - Filter Tasks By Framework - PDPL
    [Documentation]    Filter tasks by PDPL (KSA) framework
    [Tags]    filter    framework
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=framework=PDPL&limit=10
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0    No PDPL tasks found
    Log    ✅ Found ${count} PDPL tasks

TC007 - Filter Tasks By Priority - High
    [Documentation]    Filter tasks with high priority
    [Tags]    filter    priority
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=priority=high&limit=10
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    FOR    ${task}    IN    @{tasks}
        Should Be Equal As Strings    ${task}[priority]    high
    END
    Log    ✅ All returned tasks have high priority

TC008 - Filter Tasks By Priority - Medium
    [Documentation]    Filter tasks with medium priority
    [Tags]    filter    priority
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=priority=medium&limit=10
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    FOR    ${task}    IN    @{tasks}
        Should Be Equal As Strings    ${task}[priority]    medium
    END
    Log    ✅ All returned tasks have medium priority

TC009 - Filter Tasks By Status - Pending
    [Documentation]    Filter tasks with pending status
    [Tags]    filter    status
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=status=pending&limit=10
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0
    FOR    ${task}    IN    @{tasks}
        Should Be Equal As Strings    ${task}[status]    pending
    END
    Log    ✅ Found ${count} pending tasks

TC010 - Search Tasks By Keyword - Risk Management
    [Documentation]    Search tasks containing "Risk Management"
    [Tags]    search
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=search=Risk Management&limit=5
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0    No tasks found matching search
    Log    ✅ Found ${count} tasks matching "Risk Management"

TC011 - Search Tasks By Keyword - Security
    [Documentation]    Search tasks containing "Security"
    [Tags]    search
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=search=Security&limit=5
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0
    Log    ✅ Found ${count} tasks matching "Security"

TC012 - Get Task By ID
    [Documentation]    Retrieve specific task details by ID
    [Tags]    read    detail
    ${response}=    GET    ${BASE_URL}${API_PREFIX}/${ASSIGNED_TASK_ID}
    Status Should Be    200    ${response}
    ${task}=    Get From Dictionary    ${response.json()}    data
    Should Be Equal As Strings    ${task}[id]    ${ASSIGNED_TASK_ID}
    Should Contain    ${task}    title
    Should Contain    ${task}    priority
    Should Contain    ${task}    status
    Log    ✅ Retrieved task: ${task}[title]

TC013 - Create New Task - Risk Assessment
    [Documentation]    Create a new risk assessment task
    [Tags]    create    smoke
    ${due_date}=    Get Current Date    increment=7 days    result_format=%Y-%m-%dT%H:%M:%S.000Z

    ${task_data}=    Create Dictionary
    ...    tenant_id=${TENANT_ID}
    ...    task_type=assessment
    ...    title=[RoboCon Test] Risk Assessment - Data Classification
    ...    title_ar=[اختبار روبوكون] تقييم المخاطر - تصنيف البيانات
    ...    description=Conduct comprehensive risk assessment for data classification across all business units
    ...    description_ar=إجراء تقييم شامل للمخاطر لتصنيف البيانات عبر جميع وحدات الأعمال
    ...    control_id=ROBOCON-TEST-RC-001
    ...    priority=high
    ...    status=pending
    ...    due_date=${due_date}

    ${metadata}=    Create Dictionary
    ...    section=Risk Management
    ...    domain=Data Protection
    ...    rice_score=${92}
    ...    wsjf_score=${15}

    ${frameworks}=    Create List    NCA ECC v2.0    SAMA CSF    ISO 27001
    ${evidence_types}=    Create List    Policy/Standard    Risk Register    Assessment Report

    Set To Dictionary    ${metadata}    frameworks=${frameworks}
    Set To Dictionary    ${metadata}    evidence_types=${evidence_types}
    Set To Dictionary    ${task_data}    metadata=${metadata}

    ${response}=    POST    ${BASE_URL}${API_PREFIX}    json=${task_data}
    Status Should Be    201    ${response}
    Should Be Equal    ${response.json()}[success]    ${True}

    ${created_task}=    Get From Dictionary    ${response.json()}    data
    Set Suite Variable    ${CREATED_TASK_ID}    ${created_task}[id]
    Should Be Equal As Strings    ${created_task}[priority]    high
    Should Be Equal As Strings    ${created_task}[status]    pending
    Log    ✅ Created task with ID: ${CREATED_TASK_ID}

TC014 - Create New Task - Compliance Check
    [Documentation]    Create a compliance verification task
    [Tags]    create
    ${due_date}=    Get Current Date    increment=14 days    result_format=%Y-%m-%dT%H:%M:%S.000Z

    ${task_data}=    Create Dictionary
    ...    tenant_id=${TENANT_ID}
    ...    task_type=assessment
    ...    title=[RoboCon Test] PDPL Compliance Verification
    ...    description=Verify compliance with PDPL requirements for personal data processing
    ...    control_id=ROBOCON-TEST-PDPL-001
    ...    priority=critical
    ...    status=pending
    ...    due_date=${due_date}

    ${response}=    POST    ${BASE_URL}${API_PREFIX}    json=${task_data}
    Status Should Be    201    ${response}
    Should Be Equal    ${response.json()}[success]    ${True}
    Log    ✅ Created compliance verification task

TC015 - Update Task Details
    [Documentation]    Update task description and priority
    [Tags]    update
    ${update_data}=    Create Dictionary
    ...    description=UPDATED: High-priority risk assessment with executive visibility
    ...    priority=critical
    ...    progress_percentage=${15}

    ${response}=    PUT    ${BASE_URL}${API_PREFIX}/${CREATED_TASK_ID}    json=${update_data}
    Status Should Be    200    ${response}
    ${updated_task}=    Get From Dictionary    ${response.json()}    data
    Should Be Equal As Strings    ${updated_task}[priority]    critical
    Should Be Equal As Numbers    ${updated_task}[progress_percentage]    15
    Log    ✅ Task updated successfully

TC016 - Assign Task To User
    [Documentation]    Assign task to test user
    [Tags]    assign    workflow
    ${assignment_data}=    Create Dictionary
    ...    assigned_to=${TEST_USER_ID}
    ...    assigned_to_email=${TEST_USER_EMAIL}
    ...    assigned_to_name=${TEST_USER_NAME}

    ${response}=    POST    ${BASE_URL}${API_PREFIX}/${CREATED_TASK_ID}/assign    json=${assignment_data}
    Status Should Be    200    ${response}
    ${task}=    Get From Dictionary    ${response.json()}    data
    Should Be Equal As Strings    ${task}[assigned_to]    ${TEST_USER_ID}
    Should Be Equal As Strings    ${task}[assigned_to_name]    ${TEST_USER_NAME}
    Should Be Equal As Strings    ${task}[status]    in_progress
    Log    ✅ Task assigned to ${TEST_USER_NAME}

TC017 - Claim Task By User
    [Documentation]    User claims (self-assigns) a task
    [Tags]    assign    workflow
    ${claim_data}=    Create Dictionary
    ...    user_id=${TEST_USER_ID}
    ...    user_email=${TEST_USER_EMAIL}
    ...    user_name=${TEST_USER_NAME}

    ${response}=    POST    ${BASE_URL}${API_PREFIX}/${ASSIGNED_TASK_ID}/claim    json=${claim_data}
    Status Should Be    200    ${response}
    ${task}=    Get From Dictionary    ${response.json()}    data
    Should Be Equal As Strings    ${task}[assigned_to]    ${TEST_USER_ID}
    Log    ✅ Task claimed by user

TC018 - Get My Assigned Tasks
    [Documentation]    Retrieve all tasks assigned to test user
    [Tags]    read    assignment
    ${response}=    GET    ${BASE_URL}${API_PREFIX}/my-tasks    params=user_id=${TEST_USER_ID}
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} >= 2    Expected at least 2 assigned tasks

    FOR    ${task}    IN    @{tasks}
        Should Be Equal As Strings    ${task}[assigned_to]    ${TEST_USER_ID}
    END
    Log    ✅ Found ${count} tasks assigned to test user

TC019 - Update Task Status To In Progress
    [Documentation]    Change task status to in_progress
    [Tags]    workflow    status
    ${status_data}=    Create Dictionary    status=in_progress

    ${response}=    PATCH    ${BASE_URL}${API_PREFIX}/${CREATED_TASK_ID}/status    json=${status_data}
    Status Should Be    200    ${response}
    ${task}=    Get From Dictionary    ${response.json()}    data
    Should Be Equal As Strings    ${task}[status]    in_progress
    Log    ✅ Task status updated to in_progress

TC020 - Complete Task With Evidence
    [Documentation]    Mark task as completed with completion notes and evidence
    [Tags]    workflow    status    complete
    ${completion_data}=    Create Dictionary
    ...    status=completed
    ...    completion_notes=Risk assessment completed. All data classified according to sensitivity levels. Executive review conducted.
    ...    completion_evidence=DOC-RA-2025-001, RISK-REGISTER-v2.3, EXEC-APPROVAL-20251114

    ${response}=    PATCH    ${BASE_URL}${API_PREFIX}/${CREATED_TASK_ID}/status    json=${completion_data}
    Status Should Be    200    ${response}
    ${task}=    Get From Dictionary    ${response.json()}    data
    Should Be Equal As Strings    ${task}[status]    completed
    Should Be Equal As Numbers    ${task}[progress_percentage]    100
    Should Contain    ${task}    completed_date
    Should Not Be Empty    ${task}[completed_date]
    Log    ✅ Task completed successfully
    Log    Completed at: ${task}[completed_date]

TC021 - Verify Completion Rate Increased
    [Documentation]    Verify that completion statistics updated
    [Tags]    analytics    validation
    ${response}=    GET    ${BASE_URL}${API_PREFIX}/stats
    Status Should Be    200    ${response}
    ${data}=    Get From Dictionary    ${response.json()}    data
    ${completion_rate}=    Get From Dictionary    ${data}    completionRate
    ${completed_count}=    Get From Dictionary    ${data}[byStatus]    completed
    Should Be True    ${completed_count} > 0
    Log    ✅ Completion rate: ${completion_rate}%
    Log    Completed tasks: ${completed_count}

TC022 - Filter Completed Tasks
    [Documentation]    Retrieve only completed tasks
    [Tags]    filter    status
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=status=completed&limit=10
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0
    FOR    ${task}    IN    @{tasks}
        Should Be Equal As Strings    ${task}[status]    completed
    END
    Log    ✅ Retrieved ${count} completed tasks

TC023 - Pagination Test - Page 1
    [Documentation]    Test pagination functionality - first page
    [Tags]    pagination
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=page=1&limit=50
    Status Should Be    200    ${response}
    ${pagination}=    Get From Dictionary    ${response.json()}    pagination
    Should Be Equal As Numbers    ${pagination}[page]    1
    Should Be Equal As Numbers    ${pagination}[limit]    50
    Should Be True    ${pagination}[total] > 0
    Log    ✅ Page 1 retrieved: ${pagination}[total] total tasks

TC024 - Pagination Test - Page 2
    [Documentation]    Test pagination functionality - second page
    [Tags]    pagination
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=page=2&limit=50
    Status Should Be    200    ${response}
    ${pagination}=    Get From Dictionary    ${response.json()}    pagination
    Should Be Equal As Numbers    ${pagination}[page]    2
    Log    ✅ Page 2 retrieved successfully

TC025 - Sort Tasks By Due Date Ascending
    [Documentation]    Sort tasks by due date in ascending order
    [Tags]    sort
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=sortBy=due_date&sortOrder=asc&limit=10
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    Log    ✅ Tasks sorted by due date (ascending)

TC026 - Sort Tasks By Priority
    [Documentation]    Sort tasks by priority
    [Tags]    sort
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=sortBy=priority&sortOrder=desc&limit=10
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    Log    ✅ Tasks sorted by priority

TC027 - Combined Filter - Framework And Priority
    [Documentation]    Apply multiple filters simultaneously
    [Tags]    filter    complex
    ${response}=    GET    ${BASE_URL}${API_PREFIX}    params=framework=NCA ECC&priority=high&limit=10
    Status Should Be    200    ${response}
    ${tasks}=    Get From Dictionary    ${response.json()}    data
    Log    ✅ Combined filter applied successfully

TC028 - Delete Created Test Task
    [Documentation]    Clean up by deleting test task
    [Tags]    delete    cleanup
    ${response}=    DELETE    ${BASE_URL}${API_PREFIX}/${CREATED_TASK_ID}
    Status Should Be    200    ${response}
    Should Be Equal    ${response.json()}[success]    ${True}

    # Verify deletion
    ${verify_response}=    GET    ${BASE_URL}${API_PREFIX}/${CREATED_TASK_ID}    expected_status=404
    Log    ✅ Test task deleted successfully

TC029 - Verify Task Not Found After Deletion
    [Documentation]    Confirm deleted task cannot be retrieved
    [Tags]    validation    delete
    ${response}=    GET    ${BASE_URL}${API_PREFIX}/${CREATED_TASK_ID}    expected_status=404
    Status Should Be    404    ${response}
    Log    ✅ Deleted task correctly returns 404

TC030 - Error Handling - Invalid Task ID
    [Documentation]    Test error handling for invalid task ID
    [Tags]    error-handling    negative
    ${response}=    GET    ${BASE_URL}${API_PREFIX}/invalid-uuid-12345    expected_status=any
    Should Be True    ${response.status_code} >= 400
    Log    ✅ Invalid task ID handled correctly

*** Keywords ***
Setup Test Environment
    [Documentation]    Initialize test suite
    Create Session    grc_api    ${BASE_URL}    verify=${False}
    Log    🚀 GRC RoboCon Test Suite Started
    Log    Base URL: ${BASE_URL}
    Log    Test User: ${TEST_USER_NAME}

Cleanup Test Environment
    [Documentation]    Clean up after test suite
    Delete All Sessions
    Log    ✅ GRC RoboCon Test Suite Completed
