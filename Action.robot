*** Settings ***
Resource          newfile.resource
Test Setup        Setup Browser
Test Teardown     Teardown Browser

*** Test Cases ***
Verify Workflow Management Page
    [Documentation]    Checks if the Workflow Management page loads correctly.
    [Tags]    Workflows    Smoke
    Go To Workflows Page
    Verify Workflows Page Loads Correctly

Verify Assessments Page
    [Documentation]    Checks if the Assessments page loads correctly.
    [Tags]    Assessments    Smoke
    Go To Assessments Page
    Verify Assessments Page Loads Correctly

Verify Frameworks Page
    [Documentation]    Checks if the Frameworks page loads correctly.
    [Tags]    Frameworks    Smoke
    Go To Frameworks Page
    Verify Frameworks Page Loads Correctly

Verify Risk Management Page
    [Documentation]    Checks if the Risk Management page loads correctly.
    [Tags]    Risks    Smoke
    Go To Risk Management Page
    Verify Risk Management Page Loads Correctly

Verify Organizations Page
    [Documentation]    Checks if the Organizations page loads correctly.
    [Tags]    Organizations    Smoke
    Go To Organizations Page
    Verify Organizations Page Loads Correctly

Verify Documents Page
    [Documentation]    Checks if the Documents page loads correctly.
    [Tags]    Documents    Smoke
    Go To Documents Page
    Verify Documents Page Loads Correctly

Verify Evidence Page
    [Documentation]    Checks if the Evidence page loads correctly.
    [Tags]    Evidence    Smoke
    Go To Evidence Page
    Verify Evidence Page Loads Correctly

Verify Vendors Page
    [Documentation]    Checks if the Vendors page loads correctly.
    [Tags]    Vendors    Smoke
    Go To Vendors Page
    Verify Vendors Page Loads Correctly

Verify AI Scheduler Page
    [Documentation]    Checks if the AI Scheduler Console page loads correctly.
    [Tags]    AI    Smoke
    Go To AI Scheduler Page
    Verify AI Scheduler Page Loads Correctly

Verify RAG Service Page
    [Documentation]    Checks if the RAG Service Console page loads correctly.
    [Tags]    AI    Smoke
    Go To RAG Service Page
    Verify RAG Service Page Loads Correctly

Verify Regulatory Intelligence Page
    [Documentation]    Checks if the Regulatory Intelligence Center page loads correctly.
    [Tags]    Regulatory    Smoke
    Go To Regulatory Intelligence Page
    Verify Regulatory Intelligence Page Loads Correctly
