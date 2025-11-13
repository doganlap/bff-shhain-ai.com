*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${BASE_URL}    http://localhost:5173
${BROWSER}     Chrome

*** Keywords ***
Setup Browser
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window

Login
    [Documentation]    Logs into the application.
    Wait Until Page Contains Element    name=email    timeout=10s
    Input Text    name=email    demo@shahin-ai.com
    Input Text    name=password    Shahin@2025
    Click Button    type=submit
    Wait Until Page Does Not Contain Element    name=email    timeout=10s

Teardown Browser
    Run Keyword If Test Failed    Capture Page Screenshot
    Close Browser


Go To GRC Home Page
    Go To    ${BASE_URL}/

# Keywords for Implemented GRC Modules

Go To Workflows Page
    [Documentation]    Navigates to the Workflow Management page.
    Go To    ${BASE_URL}/workflows

Verify Workflows Page Loads Correctly
    [Documentation]    Verifies that the main content of the Workflow Management page is visible.
    Wait Until Page Contains Element    xpath=//h1[contains(text(),'Workflow Management')]    timeout=10s

Go To Assessments Page
    [Documentation]    Navigates to the Assessments page.
    Go To    ${BASE_URL}/assessments

Verify Assessments Page Loads Correctly
    [Documentation]    Verifies that the Advanced Assessment Manager is visible.
    Wait Until Page Contains Element    xpath=//h2[contains(text(),'Advanced Assessment Manager')]    timeout=10s

Go To Frameworks Page
    [Documentation]    Navigates to the Frameworks page.
    Go To    ${BASE_URL}/frameworks

Verify Frameworks Page Loads Correctly
    [Documentation]    Verifies that the Frameworks Management page is visible.
    Wait Until Page Contains Element    xpath=//h2[contains(text(),'Frameworks Management')]    timeout=10s

Go To Risk Management Page
    [Documentation]    Navigates to the Risk Management page.
    Go To    ${BASE_URL}/risks

Verify Risk Management Page Loads Correctly
    [Documentation]    Verifies that the Risk Management page and heatmap are visible.
    Wait Until Page Contains Element    xpath=//h2[contains(text(),'Risk Management')]    timeout=10s
    Wait Until Page Contains Element    class=heatmap    timeout=10s

Go To Organizations Page
    [Documentation]    Navigates to the Organizations page.
    Go To    ${BASE_URL}/organizations

Verify Organizations Page Loads Correctly
    [Documentation]    Verifies that the Organizations page is visible.
    Wait Until Page Contains Element    xpath=//h2[contains(text(),'Organizations')]    timeout=10s

Go To Documents Page
    [Documentation]    Navigates to the Documents library page.
    Go To    ${BASE_URL}/documents

Verify Documents Page Loads Correctly
    [Documentation]    Verifies that the Document Management page is visible.
    Wait Until Page Contains Element    xpath=//h2[contains(text(),'Document Management')]    timeout=10s

Go To Evidence Page
    [Documentation]    Navigates to the Evidence page.
    Go To    ${BASE_URL}/evidence

Verify Evidence Page Loads Correctly
    [Documentation]    Verifies that the Evidence page is visible.
    Wait Until Page Contains Element    xpath=//h2[contains(text(),'Evidence Management')]    timeout=10s

Go To Vendors Page
    [Documentation]    Navigates to the Vendors page.
    Go To    ${BASE_URL}/vendors

Verify Vendors Page Loads Correctly
    [Documentation]    Verifies that the Vendors page is visible.
    Wait Until Page Contains Element    xpath=//h2[contains(text(),'Vendor Management')]    timeout=10s

Go To AI Scheduler Page
    [Documentation]    Navigates to the AI Scheduler page.
    Go To    ${BASE_URL}/ai-scheduler

Verify AI Scheduler Page Loads Correctly
    [Documentation]    Verifies that the AI Scheduler page is visible.
    Wait Until Page Contains Element    xpath=//h1[contains(text(),'AI Scheduler Console')]    timeout=10s

Go To RAG Service Page
    [Documentation]    Navigates to the RAG Service page.
    Go To    ${BASE_URL}/rag

Verify RAG Service Page Loads Correctly
    [Documentation]    Verifies that the RAG Service Console page is visible.
    Wait Until Page Contains Element    xpath=//h1[contains(text(),'RAG Service Console')]    timeout=10s

# Keywords for Regulatory Intelligence

Go To Regulatory Intelligence Page
    [Documentation]    Navigates to the Regulatory Intelligence Center page.
    Go To    ${BASE_URL}/regulatory

Verify Regulatory Intelligence Page Loads Correctly
    [Documentation]    Verifies that the Regulatory Intelligence Center is visible.
    Wait Until Page Contains Element    xpath=//h1[contains(text(),'Regulatory Intelligence Center')]    timeout=10s
