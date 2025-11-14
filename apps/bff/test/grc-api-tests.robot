*** Settings ***
Documentation     GRC Task Management API Test Suite - Comprehensive REST API Testing
Library           RequestsLibrary
Library           Collections
Library           String
Library           DateTime
Library           OperatingSystem

Suite Setup       Setup Test Environment
Suite Teardown    Cleanup Test Environment

*** Variables ***
${BASE_URL}              http://localhost:3005
${API_ENDPOINT}          ${BASE_URL}/api/tasks
${TENANT_ID}             default
${TEST_USER_ID}          robocon_test_user_001
${TEST_USER_EMAIL}       robocon.test@grc-platform.com
${TEST_USER_NAME}        RoboCon Test User
${CREATED_TASK_ID}       ${EMPTY}
${ASSIGNED_TASK_ID}      ${EMPTY}

*** Test Cases ***
TC001_Health_Check
    [Documentation]    Verify BFF server is running
    [Tags]    smoke
    ${response}=    GET    ${BASE_URL}/health    expected_status=200
    Log    Server Status: ${response.json()}

TC002_Get_All_Tasks
    [Documentation]    Retrieve all tasks with pagination
    [Tags]    smoke    crud
    ${params}=    Create Dictionary    limit=20    page=1
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    Should Be True    ${json['success']}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0
    Log    Retrieved ${count} tasks

    ${first_task_id}=    Set Variable    ${tasks[0]['id']}
    Set Suite Variable    ${ASSIGNED_TASK_ID}    ${first_task_id}
    Log    First task ID: ${ASSIGNED_TASK_ID}

TC003_Get_Task_Statistics
    [Documentation]    Retrieve task analytics and statistics
    [Tags]    analytics
    ${response}=    GET    ${API_ENDPOINT}/stats    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${data}=    Set Variable    ${json['data']}

    Dictionary Should Contain Key    ${data}    total
    Dictionary Should Contain Key    ${data}    byStatus
    Dictionary Should Contain Key    ${data}    byPriority
    Dictionary Should Contain Key    ${data}    completionRate

    Log    Total tasks: ${data['total']}
    Log    Completion rate: ${data['completionRate']}%

TC004_Filter_By_Framework_NCA_ECC
    [Documentation]    Filter tasks by NCA ECC framework
    [Tags]    filter
    ${params}=    Create Dictionary    framework=NCA ECC    limit=10
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Log    Found ${count} NCA ECC tasks

TC005_Filter_By_Framework_SAMA_CSF
    [Documentation]    Filter tasks by SAMA CSF framework
    [Tags]    filter
    ${params}=    Create Dictionary    framework=SAMA CSF    limit=10
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Log    Found ${count} SAMA CSF tasks

TC006_Filter_By_Priority_High
    [Documentation]    Filter tasks with high priority
    [Tags]    filter
    ${params}=    Create Dictionary    priority=high    limit=10
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Log    Found ${count} high priority tasks

TC007_Filter_By_Priority_Medium
    [Documentation]    Filter tasks with medium priority
    [Tags]    filter
    ${params}=    Create Dictionary    priority=medium    limit=10
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0

    FOR    ${task}    IN    @{tasks}
        Should Be Equal As Strings    ${task['priority']}    medium
    END

TC008_Filter_By_Status_Pending
    [Documentation]    Filter tasks with pending status
    [Tags]    filter
    ${params}=    Create Dictionary    status=pending    limit=10
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0

    FOR    ${task}    IN    @{tasks}
        Should Be Equal As Strings    ${task['status']}    pending
    END

TC009_Search_Tasks_Risk_Management
    [Documentation]    Search tasks containing Risk Management
    [Tags]    search
    ${params}=    Create Dictionary    search=Risk Management    limit=5
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Log    Found ${count} tasks matching Risk Management

TC010_Search_Tasks_Security
    [Documentation]    Search tasks containing Security
    [Tags]    search
    ${params}=    Create Dictionary    search=Security    limit=5
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Log    Found ${count} tasks matching Security

TC011_Get_Task_By_ID
    [Documentation]    Retrieve specific task by ID
    [Tags]    crud
    ${response}=    GET    ${API_ENDPOINT}/${ASSIGNED_TASK_ID}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${task}=    Set Variable    ${json['data']}
    Should Be Equal As Strings    ${task['id']}    ${ASSIGNED_TASK_ID}
    Log    Task title: ${task['title']}

TC012_Create_New_Task
    [Documentation]    Create a new GRC assessment task
    [Tags]    crud    create
    ${due_date}=    Get Current Date    increment=7 days    result_format=%Y-%m-%dT%H:%M:%S.000Z

    ${metadata}=    Create Dictionary
    ...    section=Risk Management
    ...    domain=Data Protection
    ...    frameworks=["NCA ECC v2.0", "SAMA CSF"]
    ...    evidence_types=["Policy/Standard", "Risk Register"]
    ...    rice_score=${92}
    ...    wsjf_score=${15}

    ${task_body}=    Create Dictionary
    ...    tenant_id=${TENANT_ID}
    ...    task_type=assessment
    ...    title=[RoboCon Test] Risk Assessment - Data Classification
    ...    title_ar=[اختبار روبوكون] تقييم المخاطر
    ...    description=Comprehensive risk assessment for data classification
    ...    control_id=ROBOCON-RC-001
    ...    priority=high
    ...    status=pending
    ...    due_date=${due_date}

    ${response}=    POST    ${API_ENDPOINT}    json=${task_body}    expected_status=201

    ${json}=    Set Variable    ${response.json()}
    Should Be True    ${json['success']}
    ${task}=    Set Variable    ${json['data']}
    Set Suite Variable    ${CREATED_TASK_ID}    ${task['id']}
    Log    Created task ID: ${CREATED_TASK_ID}

TC013_Update_Task_Details
    [Documentation]    Update task priority and description
    [Tags]    crud    update
    ${update_body}=    Create Dictionary
    ...    priority=critical
    ...    progress_percentage=${25}
    ...    description=URGENT: High priority risk assessment

    ${response}=    PUT    ${API_ENDPOINT}/${CREATED_TASK_ID}    json=${update_body}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${task}=    Set Variable    ${json['data']}
    Should Be Equal As Strings    ${task['priority']}    critical
    Should Be Equal As Numbers    ${task['progress_percentage']}    25

TC014_Assign_Task_To_User
    [Documentation]    Assign task to test user
    [Tags]    workflow    assign
    ${assign_body}=    Create Dictionary
    ...    assigned_to=${TEST_USER_ID}
    ...    assigned_to_email=${TEST_USER_EMAIL}
    ...    assigned_to_name=${TEST_USER_NAME}

    ${response}=    POST    ${API_ENDPOINT}/${CREATED_TASK_ID}/assign    json=${assign_body}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${task}=    Set Variable    ${json['data']}
    Should Be Equal As Strings    ${task['assigned_to']}    ${TEST_USER_ID}
    Should Be Equal As Strings    ${task['status']}    in_progress

TC015_Claim_Task_By_User
    [Documentation]    User claims a task (self-assignment)
    [Tags]    workflow    assign
    ${claim_body}=    Create Dictionary
    ...    user_id=${TEST_USER_ID}
    ...    user_email=${TEST_USER_EMAIL}
    ...    user_name=${TEST_USER_NAME}

    ${response}=    POST    ${API_ENDPOINT}/${ASSIGNED_TASK_ID}/claim    json=${claim_body}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${task}=    Set Variable    ${json['data']}
    Should Be Equal As Strings    ${task['assigned_to']}    ${TEST_USER_ID}

TC016_Get_My_Assigned_Tasks
    [Documentation]    Retrieve all tasks assigned to user
    [Tags]    workflow
    ${params}=    Create Dictionary    user_id=${TEST_USER_ID}
    ${response}=    GET    ${API_ENDPOINT}/my-tasks    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} >= 2
    Log    User has ${count} assigned tasks

TC017_Update_Task_Status_To_In_Progress
    [Documentation]    Change task status to in_progress
    [Tags]    workflow
    ${status_body}=    Create Dictionary    status=in_progress

    ${response}=    PATCH    ${API_ENDPOINT}/${CREATED_TASK_ID}/status    json=${status_body}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${task}=    Set Variable    ${json['data']}
    Should Be Equal As Strings    ${task['status']}    in_progress

TC018_Complete_Task_With_Evidence
    [Documentation]    Mark task as completed with notes and evidence
    [Tags]    workflow    complete
    ${completion_body}=    Create Dictionary
    ...    status=completed
    ...    completion_notes=Risk assessment completed successfully
    ...    completion_evidence=DOC-RA-2025-001, RISK-REGISTER-v2.3

    ${response}=    PATCH    ${API_ENDPOINT}/${CREATED_TASK_ID}/status    json=${completion_body}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${task}=    Set Variable    ${json['data']}
    Should Be Equal As Strings    ${task['status']}    completed
    Should Be Equal As Numbers    ${task['progress_percentage']}    100
    Should Not Be Empty    ${task['completed_date']}

TC019_Filter_Completed_Tasks
    [Documentation]    Retrieve only completed tasks
    [Tags]    filter
    ${params}=    Create Dictionary    status=completed    limit=10
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Should Be True    ${count} > 0

TC020_Pagination_Page_1
    [Documentation]    Test pagination - first page
    [Tags]    pagination
    ${params}=    Create Dictionary    page=1    limit=50
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${pagination}=    Set Variable    ${json['pagination']}
    Should Be Equal As Numbers    ${pagination['page']}    1
    Should Be Equal As Numbers    ${pagination['limit']}    50

TC021_Pagination_Page_2
    [Documentation]    Test pagination - second page
    [Tags]    pagination
    ${params}=    Create Dictionary    page=2    limit=50
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${pagination}=    Set Variable    ${json['pagination']}
    Should Be Equal As Numbers    ${pagination['page']}    2

TC022_Sort_By_Due_Date
    [Documentation]    Sort tasks by due date ascending
    [Tags]    sort
    ${params}=    Create Dictionary    sortBy=due_date    sortOrder=asc    limit=10
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Log    Retrieved ${count} sorted tasks

TC023_Combined_Filter
    [Documentation]    Apply multiple filters simultaneously
    [Tags]    filter    complex
    ${params}=    Create Dictionary    framework=NCA ECC    priority=medium    limit=5
    ${response}=    GET    ${API_ENDPOINT}    params=${params}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    ${tasks}=    Set Variable    ${json['data']}
    ${count}=    Get Length    ${tasks}
    Log    Combined filter returned ${count} tasks

TC024_Delete_Test_Task
    [Documentation]    Clean up by deleting test task
    [Tags]    crud    cleanup
    ${response}=    DELETE    ${API_ENDPOINT}/${CREATED_TASK_ID}    expected_status=200

    ${json}=    Set Variable    ${response.json()}
    Should Be True    ${json['success']}

TC025_Verify_Task_Deleted
    [Documentation]    Confirm deleted task returns 404
    [Tags]    validation
    ${response}=    GET    ${API_ENDPOINT}/${CREATED_TASK_ID}    expected_status=404
    Log    Task correctly returns 404 after deletion

*** Keywords ***
Setup Test Environment
    [Documentation]    Initialize test environment
    Create Session    grc_bff    ${BASE_URL}    verify=False
    Log    GRC RoboCon Test Suite Started
    Log    Base URL: ${BASE_URL}

Cleanup Test Environment
    [Documentation]    Clean up after tests
    Delete All Sessions
    Log    GRC RoboCon Test Suite Completed
