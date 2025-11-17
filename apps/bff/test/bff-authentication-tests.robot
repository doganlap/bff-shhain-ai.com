*** Settings ***
Documentation     Full-path authentication and public-access tests for BFF
Library           RequestsLibrary
Library           Collections
# Library           JSONLibrary

Suite Setup       Create BFF Session
Suite Teardown    Delete All Sessions


*** Variables ***
${BASE_URL}               http://172.21.160.1:3007
${DEFAULT_TIMEOUT}        10

# Demo user (seeded / known test user)
${USER_EMAIL}             webuser@example.com
${USER_PASSWORD}          DemoPassword123!

# Partner test credentials (using the users we created)
${PARTNER_EMAIL}          ahmet@doganconsult.com
${PARTNER_PASSWORD}       Shahin@2025

# Demo / POC payload defaults
${DEMO_FULL_NAME}         Web User
${DEMO_COMPANY}           Web Corp
${POC_FULL_NAME}          POC User
${POC_COMPANY}            POC Corp


*** Keywords ***
Create BFF Session
    Create Session    bff    ${BASE_URL}    timeout=${DEFAULT_TIMEOUT}

Login And Return Tokens
    [Arguments]    ${email}    ${password}
    ${payload}=    Create Dictionary    email=${email}    password=${password}
    ${resp}=       POST On Session    bff    /api/auth/login    json=${payload}
    Should Be Equal As Integers    ${resp.status_code}    200
    ${data}=       Set Variable    ${resp.json()}
    Dictionary Should Contain Key    ${data}    accessToken
    Dictionary Should Contain Key    ${data}    refreshToken
    RETURN    ${data}

Call Auth Me
    [Arguments]    ${access_token}
    ${headers}=    Create Dictionary    Authorization=Bearer ${access_token}
    ${resp}=       GET On Session    bff    /api/auth/me    headers=${headers}
    RETURN    ${resp}

Call Auth Permissions
    [Arguments]    ${access_token}
    ${headers}=    Create Dictionary    Authorization=Bearer ${access_token}
    ${resp}=       GET On Session    bff    /api/auth/permissions    headers=${headers}
    RETURN    ${resp}

Refresh Token
    [Arguments]    ${refresh_token}
    ${payload}=    Create Dictionary    refreshToken=${refresh_token}
    ${resp}=       POST On Session    bff    /api/auth/refresh    json=${payload}
    RETURN    ${resp}

Logout
    [Arguments]    ${access_token}
    ${headers}=    Create Dictionary    Authorization=Bearer ${access_token}
    ${resp}=       POST On Session    bff    /api/auth/logout    headers=${headers}
    RETURN    ${resp}


*** Test Cases ***
Standard User Login Uses /api/auth/login
    [Tags]    auth    smoke
    ${tokens}=    Login And Return Tokens    ${USER_EMAIL}    ${USER_PASSWORD}
    Dictionary Should Contain Key    ${tokens}    accessToken
    Dictionary Should Contain Key    ${tokens}    refreshToken

Token Refresh Uses /api/auth/refresh
    [Tags]    auth
    ${tokens}=        Login And Return Tokens    ${USER_EMAIL}    ${USER_PASSWORD}
    ${refresh}=       Refresh Token    ${tokens["refreshToken"]}
    Should Be Equal As Integers    ${refresh.status_code}    200
    ${data}=          Set Variable    ${refresh.json()}
    Dictionary Should Contain Key    ${data}    accessToken

Profile Endpoint Uses /api/auth/me
    [Tags]    auth
    ${tokens}=    Login And Return Tokens    ${USER_EMAIL}    ${USER_PASSWORD}
    ${access}=    Set Variable    ${tokens["accessToken"]}
    ${resp}=      Call Auth Me    ${access}
    Should Be Equal As Integers    ${resp.status_code}    200
    ${data}=      Set Variable    ${resp.json()}
    Dictionary Should Contain Key    ${data}    email
    Should Be Equal    ${data["email"]}    ${USER_EMAIL}

Permissions Endpoint Uses /api/auth/permissions
    [Tags]    auth
    ${tokens}=    Login And Return Tokens    ${USER_EMAIL}    ${USER_PASSWORD}
    ${access}=    Set Variable    ${tokens["accessToken"]}
    ${resp}=      Call Auth Permissions    ${access}
    Should Be Equal As Integers    ${resp.status_code}    200
    ${data}=      Set Variable    ${resp.json()}
    Should Be True    len(${data}) > 0

Logout Uses /api/auth/logout
    [Tags]    auth
    ${tokens}=    Login And Return Tokens    ${USER_EMAIL}    ${USER_PASSWORD}
    ${access}=    Set Variable    ${tokens["accessToken"]}
    ${resp}=      Logout    ${access}
    Should Be True    ${resp.status_code} == 200 or ${resp.status_code} == 204

Partner Login Uses /api/partner/auth/login
    [Tags]    partner    auth
    ${payload}=    Create Dictionary
    ...            email=${PARTNER_EMAIL}
    ...            password=${PARTNER_PASSWORD}
    ${resp}=       POST On Session    bff    /api/partner/auth/login    json=${payload}
    Should Be Equal As Integers    ${resp.status_code}    200
    ${data}=       Set Variable    ${resp.json()}
    Dictionary Should Contain Key    ${data}    accessToken



POC Request Uses /api/public/poc/request
    [Tags]    public    poc
    ${payload}=    Create Dictionary
    ...            fullName=${POC_FULL_NAME}
    ...            email=${USER_EMAIL}
    ...            companyName=${POC_COMPANY}
    ${resp}=       POST On Session    bff    /api/public/poc/request    json=${payload}
    Should Be Equal As Integers    ${resp.status_code}    200
    ${data}=       To Json    ${resp.content}
    Dictionary Should Contain Key    ${data}    requestId
    Dictionary Should Contain Key    ${data}    status