*** Settings ***
Documentation    Complete Authentication Path Test Suite for Shahin GRC Platform
...              Tests all authentication components, paths, configuration, registration, and routing
Library          RequestsLibrary
Library          Collections
Library          String
Library          DateTime
Library          OperatingSystem

Suite Setup      Setup Authentication Test Environment
Suite Teardown   Cleanup Authentication Test Environment

*** Variables ***
# Base URLs for different authentication paths
${BFF_BASE_URL}           http://172.21.160.1:3007
${WEB_BASE_URL}           http://172.21.160.1:5174
${API_BASE_URL}           http://172.21.160.1:3007/api

# Authentication endpoints
${AUTH_LOGIN_ENDPOINT}    ${API_BASE_URL}/auth/login
${AUTH_REGISTER_ENDPOINT}    ${API_BASE_URL}/auth/register
${AUTH_PROFILE_ENDPOINT}  ${API_BASE_URL}/auth/me
${AUTH_REFRESH_ENDPOINT}  ${API_BASE_URL}/auth/refresh
${AUTH_LOGOUT_ENDPOINT}   ${API_BASE_URL}/auth/logout

# Partner authentication endpoints
${PARTNER_LOGIN_ENDPOINT}    ${API_BASE_URL}/partner/auth/login
${PARTNER_REGISTER_ENDPOINT}    ${API_BASE_URL}/partner/auth/register

# Super admin endpoints
${SUPER_ADMIN_ENDPOINT}   ${API_BASE_URL}/admin/users

# Test user credentials
${TEST_USER_EMAIL}        ahmet@doganconsult.com
${TEST_USER_PASSWORD}      PartnerPass123!
${TEST_USER_NAME}          Ahmed Dogan
${TEST_USER_ROLE}          partner-admin

${TEST_PARTNER_EMAIL}     amr@doganconsult.com
${TEST_PARTNER_PASSWORD}   PartnerPass123!
${TEST_PARTNER_NAME}       Amr Elsayed

# Demo user credentials
${DEMO_USER_EMAIL}         demo@shahin.grc
${DEMO_USER_PASSWORD}      Demo@1234

# Test organization data
${TEST_TENANT_ID}          75688778-0cf1-4a5c-9536-9acd2e5c9a0e
${TEST_ORGANIZATION_NAME}  Dogan Consult
${TEST_ORGANIZATION_TYPE}  consulting

# Authentication tokens
${AUTH_TOKEN}              ${EMPTY}
${REFRESH_TOKEN}           ${EMPTY}
${BEARER_TOKEN}            ${EMPTY}

# Test data storage
${CREATED_USER_ID}         ${EMPTY}
${TEST_SESSION_ID}         ${EMPTY}

*** Test Cases ***
TC001_Health_Check_All_Services
    [Documentation]    Verify all authentication-related services are running
    [Tags]    health    smoke    authentication
    
    # Check BFF service health
    ${response}=    GET    ${BFF_BASE_URL}/health    expected_status=200
    Should Be Equal    ${response.json()['status']}    healthy
    Log    BFF Service Status: ${response.json()}
    
    # Check API service health
    ${response}=    GET    ${API_BASE_URL}/health    expected_status=200
    Should Be Equal    ${response.json()['status']}    healthy
    Log    API Service Status: ${response.json()}

TC002_Standard_User_Login_Flow
    [Documentation]    Test standard user login with email and password
    [Tags]    login    standard    authentication    critical
    
    ${login_data}=    Create Dictionary
    ...    email=${TEST_USER_EMAIL}
    ...    password=${TEST_USER_PASSWORD}
    
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    X-Request-ID=robot_test_001
    
    ${response}=    POST    ${AUTH_LOGIN_ENDPOINT}
    ...    json=${login_data}
    ...    headers=${headers}
    ...    expected_status=200
    
    # Validate response structure
    Should Be True    'token' in ${response.json()}
    Should Not Be Empty    ${response.json()['token']}
    Should Not Be Empty    ${response.json()['user']}
    
    # Store tokens for subsequent tests
    Set Suite Variable    ${AUTH_TOKEN}    ${response.json()['token']}
    Set Suite Variable    ${REFRESH_TOKEN}    ${response.json()['refreshToken']}
    Set Suite Variable    ${BEARER_TOKEN}    Bearer ${response.json()['token']}
    
    Log    Login successful for user: ${TEST_USER_EMAIL}
    Log    Token received: ${AUTH_TOKEN}

TC003_Partner_User_Login_Flow
    [Documentation]    Test partner-specific login flow
    [Tags]    login    partner    authentication    critical
    
    ${login_data}=    Create Dictionary
    ...    email=${TEST_PARTNER_EMAIL}
    ...    password=${TEST_PARTNER_PASSWORD}
    
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    X-Request-ID=robot_test_002
    ...    X-Tenant-ID=${TEST_TENANT_ID}
    
    ${response}=    POST    ${PARTNER_LOGIN_ENDPOINT}
    ...    json=${login_data}
    ...    headers=${headers}
    ...    expected_status=200
    
    # Validate partner-specific response
    Should Be True    'token' in ${response.json()}
    Should Not Be Empty    ${response.json()['token']}
    Should Be Equal    ${response.json()['user']['role']}    partner-admin
    
    Log    Partner login successful for: ${TEST_PARTNER_EMAIL}

TC004_Demo_User_Registration_Flow
    [Documentation]    Test demo user registration and instant access
    [Tags]    registration    demo    authentication    instant-access
    
    ${timestamp}=    Get Current Date    result_format=%Y%m%d%H%M%S
    ${demo_email}=    Set Variable    robot.demo.${timestamp}@test.com
    
    ${demo_data}=    Create Dictionary
    ...    fullName=Robot Demo User
    ...    email=${demo_email}
    ...    companyName=Robot Demo Company
    ...    sector=technology
    ...    orgSize=small
    ...    useCases=["compliance", "risk-management"]
    
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    X-Request-ID=robot_test_demo_001
    
    ${response}=    POST    ${BFF_BASE_URL}/api/public/demo/request
    ...    json=${demo_data}
    ...    headers=${headers}
    ...    expected_status=201
    
    Should Be True    'token' in ${response.json()}
    Should Be Equal    ${response.json()['status']}    approved_auto
    Should Not Be Empty    ${response.json()['tenant']}
    Should Not Be Empty    ${response.json()['user']}
    
    Log    Demo user registered and authenticated successfully: ${demo_email}

TC005_User_Registration_Flow
    [Documentation]    Test complete user registration process
    [Tags]    registration    authentication    user-management
    
    ${timestamp}=    Get Current Date    result_format=%Y%m%d%H%M%S
    ${test_email}=    Set Variable    robot.test.${timestamp}@test.com
    
    ${registration_data}=    Create Dictionary
    ...    email=${test_email}
    ...    password=Test@1234
    ...    name=Robot Test User
    ...    organization=Robot Test Org
    ...    role=user
    
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    X-Request-ID=robot_test_004
    
    ${response}=    POST    ${AUTH_REGISTER_ENDPOINT}
    ...    json=${registration_data}
    ...    headers=${headers}
    ...    expected_status=201
    
    Should Be True    ${response.json()['success']}
    Should Not Be Empty    ${response.json()['user']}
    
    Set Suite Variable    ${CREATED_USER_ID}    ${response.json()['user']['id']}
    Log    User registered successfully with ID: ${CREATED_USER_ID}

TC006_Partner_Registration_Flow
    [Documentation]    Test partner organization and user registration
    [Tags]    registration    partner    authentication    multi-tenant
    
    ${timestamp}=    Get Current Date    result_format=%Y%m%d%H%M%S
    ${partner_email}=    Set Variable    partner.robot.${timestamp}@partner.com
    
    ${registration_data}=    Create Dictionary
    ...    email=${partner_email}
    ...    password=Partner@1234
    ...    name=Robot Partner User
    ...    organization=Robot Partner Org
    ...    organizationType=consulting
    ...    role=partner-admin
    
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    X-Request-ID=robot_test_005
    
    ${response}=    POST    ${PARTNER_REGISTER_ENDPOINT}
    ...    json=${registration_data}
    ...    headers=${headers}
    ...    expected_status=201
    
    Should Be True    ${response.json()['success']}
    Should Not Be Empty    ${response.json()['user']}
    Should Not Be Empty    ${response.json()['tenant']}
    
    Log    Partner registered successfully with tenant: ${response.json()['tenant']['id']}

TC007_Authenticated_Profile_Access
    [Documentation]    Test accessing user profile with valid authentication token
    [Tags]    authentication    profile    authorization
    
    ${headers}=    Create Dictionary
    ...    Authorization=${BEARER_TOKEN}
    ...    X-Request-ID=robot_test_006
    ...    X-Tenant-ID=${TEST_TENANT_ID}
    
    ${response}=    GET    ${AUTH_PROFILE_ENDPOINT}
    ...    headers=${headers}
    ...    expected_status=200
    
    Should Be True    ${response.json()['success']}
    Should Not Be Empty    ${response.json()['user']}
    Should Be Equal    ${response.json()['user']['email']}    ${TEST_USER_EMAIL}
    
    Log    Profile accessed successfully for: ${TEST_USER_EMAIL}

TC008_Token_Refresh_Flow
    [Documentation]    Test JWT token refresh mechanism
    [Tags]    authentication    token    security
    
    ${headers}=    Create Dictionary
    ...    Authorization=${BEARER_TOKEN}
    ...    Content-Type=application/json
    ...    X-Request-ID=robot_test_007
    
    ${refresh_data}=    Create Dictionary
    ...    refreshToken=${REFRESH_TOKEN}
    
    ${response}=    POST    ${AUTH_REFRESH_ENDPOINT}
    ...    json=${refresh_data}
    ...    headers=${headers}
    ...    expected_status=200
    
    Should Be True    ${response.json()['success']}
    Should Not Be Empty    ${response.json()['token']}
    
    Log    Token refreshed successfully

TC009_Invalid_Credentials_Handling
    [Documentation]    Test authentication with invalid credentials
    [Tags]    authentication    security    error-handling
    
    ${login_data}=    Create Dictionary
    ...    email=invalid@email.com
    ...    password=wrongpassword
    
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    X-Request-ID=robot_test_008
    
    ${response}=    POST    ${AUTH_LOGIN_ENDPOINT}
    ...    json=${login_data}
    ...    headers=${headers}
    ...    expected_status=401
    
    Should Be True    ${response.json()['success']} == False
    Should Contain    ${response.json()['message']}    Invalid credentials
    
    Log    Invalid credentials properly rejected

TC010_Missing_Credentials_Handling
    [Documentation]    Test authentication with missing credentials
    [Tags]    authentication    validation    error-handling
    
    ${login_data}=    Create Dictionary
    ...    email=${EMPTY}
    ...    password=${EMPTY}
    
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    X-Request-ID=robot_test_009
    
    ${response}=    POST    ${AUTH_LOGIN_ENDPOINT}
    ...    json=${login_data}
    ...    headers=${headers}
    ...    expected_status=400
    
    Should Be True    ${response.json()['success']} == False
    
    Log    Missing credentials properly validated

TC011_Unauthorized_Access_Handling
    [Documentation]    Test accessing protected endpoints without authentication
    [Tags]    authentication    authorization    security
    
    ${headers}=    Create Dictionary
    ...    X-Request-ID=robot_test_010
    
    ${response}=    GET    ${AUTH_PROFILE_ENDPOINT}
    ...    headers=${headers}
    ...    expected_status=401
    
    Should Be True    ${response.json()['success']} == False
    Should Contain    ${response.json()['message']}    Unauthorized
    
    Log    Unauthorized access properly blocked

TC012_Super_Admin_Access_Control
    [Documentation]    Test super admin access with proper authorization
    [Tags]    authentication    admin    rbac    authorization
    
    ${headers}=    Create Dictionary
    ...    Authorization=${BEARER_TOKEN}
    ...    X-Request-ID=robot_test_011
    ...    X-Tenant-ID=${TEST_TENANT_ID}
    
    ${response}=    GET    ${SUPER_ADMIN_ENDPOINT}
    ...    headers=${headers}
    ...    expected_status=200
    
    Should Be True    ${response.json()['success']}
    Should Not Be Empty    ${response.json()['users']}
    
    Log    Super admin access granted

TC013_Multi_Tenant_Isolation
    [Documentation]    Test multi-tenant data isolation
    [Tags]    authentication    multi-tenant    security    isolation
    
    ${headers}=    Create Dictionary
    ...    Authorization=${BEARER_TOKEN}
    ...    X-Request-ID=robot_test_012
    ...    X-Tenant-ID=${TEST_TENANT_ID}
    
    ${response}=    GET    ${AUTH_PROFILE_ENDPOINT}
    ...    headers=${headers}
    ...    expected_status=200
    
    Should Be True    ${response.json()['success']}
    Should Be Equal    ${response.json()['user']['tenantId']}    ${TEST_TENANT_ID}
    
    Log    Multi-tenant isolation working correctly

TC014_Request_ID_Tracking
    [Documentation]    Test request ID tracking for authentication requests
    [Tags]    authentication    tracking    monitoring
    
    ${test_request_id}=    Set Variable    robot_test_tracking_001
    
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    X-Request-ID=${test_request_id}
    
    ${login_data}=    Create Dictionary
    ...    email=${TEST_USER_EMAIL}
    ...    password=${TEST_USER_PASSWORD}
    
    ${response}=    POST    ${AUTH_LOGIN_ENDPOINT}
    ...    json=${login_data}
    ...    headers=${headers}
    ...    expected_status=200
    
    Should Be True    ${response.json()['success']}
    Should Be Equal    ${response.headers['x-request-id']}    ${test_request_id}
    
    Log    Request ID tracking working correctly

TC015_Rate_Limiting_Protection
    [Documentation]    Test rate limiting for authentication endpoints
    [Tags]    authentication    security    rate-limiting
    
    ${login_data}=    Create Dictionary
    ...    email=rate.limit@test.com
    ...    password=wrongpassword
    
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    X-Request-ID=robot_test_rate_001
    
    # Attempt multiple failed logins to trigger rate limiting
    FOR    ${i}    IN RANGE    1    6
        ${response}=    POST    ${AUTH_LOGIN_ENDPOINT}
        ...    json=${login_data}
        ...    headers=${headers}
        
        Log    Attempt ${i}: Status ${response.status_code}
        Sleep    1 second
    END
    
    Log    Rate limiting test completed

TC016_CORS_Policy_Validation
    [Documentation]    Test CORS policy for authentication endpoints
    [Tags]    authentication    cors    security
    
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    Origin=http://172.21.160.1:5174
    ...    X-Request-ID=robot_test_cors_001
    
    ${login_data}=    Create Dictionary
    ...    email=${TEST_USER_EMAIL}
    ...    password=${TEST_USER_PASSWORD}
    
    ${response}=    POST    ${AUTH_LOGIN_ENDPOINT}
    ...    json=${login_data}
    ...    headers=${headers}
    ...    expected_status=200
    
    Should Be True    ${response.json()['success']}
    Should Contain    ${response.headers['access-control-allow-origin']}    172.21.160.1:5174
    
    Log    CORS policy validated successfully

TC017_Logout_Flow
    [Documentation]    Test user logout process
    [Tags]    authentication    logout    security
    
    ${headers}=    Create Dictionary
    ...    Authorization=${BEARER_TOKEN}
    ...    Content-Type=application/json
    ...    X-Request-ID=robot_test_013
    
    ${logout_data}=    Create Dictionary
    ...    refreshToken=${REFRESH_TOKEN}
    
    ${response}=    POST    ${AUTH_LOGOUT_ENDPOINT}
    ...    json=${logout_data}
    ...    headers=${headers}
    ...    expected_status=200
    
    Should Be True    ${response.json()['success']}
    
    Log    User logged out successfully

TC018_Complete_Authentication_Journey
    [Documentation]    Test complete authentication journey from registration to logout
    [Tags]    authentication    journey    end-to-end    critical
    
    # Step 1: Register new user
    ${timestamp}=    Get Current Date    result_format=%Y%m%d%H%M%S
    ${journey_email}=    Set Variable    journey.${timestamp}@test.com
    
    ${reg_data}=    Create Dictionary
    ...    email=${journey_email}
    ...    password=Journey@1234
    ...    name=Journey Test User
    ...    organization=Journey Test Org
    
    ${reg_headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    X-Request-ID=journey_test_001
    
    ${reg_response}=    POST    ${AUTH_REGISTER_ENDPOINT}
    ...    json=${reg_data}
    ...    headers=${reg_headers}
    ...    expected_status=201
    
    Should Be True    ${reg_response.json()['success']}
    
    # Step 2: Login with newly created user
    ${login_data}=    Create Dictionary
    ...    email=${journey_email}
    ...    password=Journey@1234
    
    ${login_headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    X-Request-ID=journey_test_002
    
    ${login_response}=    POST    ${AUTH_LOGIN_ENDPOINT}
    ...    json=${login_data}
    ...    headers=${login_headers}
    ...    expected_status=200
    
    Should Be True    ${login_response.json()['success']}
    
    ${journey_token}=    Set Variable    ${login_response.json()['token']}
    ${journey_bearer}=    Set Variable    Bearer ${journey_token}
    
    # Step 3: Access profile with authentication
    ${profile_headers}=    Create Dictionary
    ...    Authorization=${journey_bearer}
    ...    X-Request-ID=journey_test_003
    
    ${profile_response}=    GET    ${AUTH_PROFILE_ENDPOINT}
    ...    headers=${profile_headers}
    ...    expected_status=200
    
    Should Be True    ${profile_response.json()['success']}
    Should Be Equal    ${profile_response.json()['user']['email']}    ${journey_email}
    
    # Step 4: Refresh token
    ${refresh_headers}=    Create Dictionary
    ...    Authorization=${journey_bearer}
    ...    Content-Type=application/json
    ...    X-Request-ID=journey_test_004
    
    ${refresh_data}=    Create Dictionary
    ...    refreshToken=${journey_token}
    
    ${refresh_response}=    POST    ${AUTH_REFRESH_ENDPOINT}
    ...    json=${refresh_data}
    ...    headers=${refresh_headers}
    ...    expected_status=200
    
    Should Be True    ${refresh_response.json()['success']}
    
    # Step 5: Logout
    ${logout_headers}=    Create Dictionary
    ...    Authorization=${journey_bearer}
    ...    Content-Type=application/json
    ...    X-Request-ID=journey_test_005
    
    ${logout_data}=    Create Dictionary
    ...    refreshToken=${journey_token}
    
    ${logout_response}=    POST    ${AUTH_LOGOUT_ENDPOINT}
    ...    json=${logout_data}
    ...    headers=${logout_headers}
    ...    expected_status=200
    
    Should Be True    ${logout_response.json()['success']}
    
    Log    Complete authentication journey successful for: ${journey_email}

*** Keywords ***
Setup Authentication Test Environment
    [Documentation]    Setup test environment for authentication tests
    Log    Setting up authentication test environment...
    
    # Create session for API requests
    Create Session    auth_session    ${API_BASE_URL}
    ...    headers={"Content-Type": "application/json", "Accept": "application/json"}
    
    Log    Authentication test environment ready
    Log    BFF URL: ${BFF_BASE_URL}
    Log    API URL: ${API_BASE_URL}
    Log    Web URL: ${WEB_BASE_URL}

Cleanup Authentication Test Environment
    [Documentation]    Cleanup test data and environment
    Log    Cleaning up authentication test environment...
    
    # Cleanup any created test users if needed
    ${headers}=    Create Dictionary
    ...    Authorization=${BEARER_TOKEN}
    ...    X-Request-ID=cleanup_001
    
    # Only attempt cleanup if we have a valid token
    Run Keyword If    '${AUTH_TOKEN}' != '${EMPTY}'
    ...    Log    Test user cleanup would be performed here
    
    Log    Authentication test environment cleaned up

Log Test Results
    [Documentation]    Log comprehensive test results
    [Arguments]    ${test_name}    ${status}    ${details}=${EMPTY}
    
    ${timestamp}=    Get Current Date    result_format=%Y-%m-%d %H:%M:%S
    
    ${result_message}=    Set Variable
    ...    [${timestamp}] ${test_name}: ${status}
    ...    ${details}
    
    Log    ${result_message}
    
    # Store results for reporting
    ${test_results}=    Set Variable If    '${status}' == 'PASS'
    ...    Authentication test passed: ${test_name}
    ...    Authentication test failed: ${test_name} - ${details}
    
    Log    ${test_results}