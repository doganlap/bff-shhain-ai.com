*** Settings ***
Library           SeleniumLibrary    screenshot_root_directory=screenshots    timeout=30
Library           OperatingSystem
Library           DateTime

Suite Setup       Setup Test Environment
Suite Teardown    Teardown Test Environment
Test Setup        Start Screen Recording
Test Teardown     Stop Screen Recording And Capture Screenshot

*** Variables ***
${BASE_URL}              http://localhost:5173
${BROWSER}               chrome
${SCREENSHOT_DIR}        ${CURDIR}/../../test-results/screenshots
${VIDEO_DIR}             ${CURDIR}/../../test-results/videos
${DELAY}                 3s
${LONG_DELAY}            5s
${PAGE_LOAD_TIMEOUT}     30s

*** Test Cases ***
Test 01 - Landing Page Load And Visual Check
    [Documentation]    Test landing page loads correctly with all visual elements
    [Tags]    landing    visual    critical
    
    Go To    ${BASE_URL}
    Sleep    ${LONG_DELAY}
    Capture Page Screenshot    01-landing-page-initial.png
    
    # Wait for page to fully load
    Wait Until Page Contains Element    css:body    timeout=${PAGE_LOAD_TIMEOUT}
    Sleep    ${DELAY}
    Capture Page Screenshot    01-landing-page-full.png
    
    # Capture main sections (flexible)
    Run Keyword And Ignore Error    Execute Javascript    window.scrollTo(0, 0)
    Sleep    1s
    Capture Page Screenshot    01-landing-top-section.png
    
    # Scroll and capture middle
    Execute Javascript    window.scrollTo(0, document.body.scrollHeight/2)
    Sleep    ${DELAY}
    Capture Page Screenshot    01-landing-middle-section.png
    
    # Scroll and capture bottom
    Execute Javascript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    ${DELAY}
    Capture Page Screenshot    01-landing-bottom-section.png
    
    Log    Landing page visual test completed    level=INFO

Test 02 - Login Page And Authentication
    [Documentation]    Test login page and authentication flow
    [Tags]    auth    visual    critical
    
    Go To    ${BASE_URL}/login
    Wait Until Page Contains Element    css:form    timeout=10s
    Capture Page Screenshot    02-login-page.png
    
    # Check login form elements
    Page Should Contain Element    css:input[type="email"]
    Page Should Contain Element    css:input[type="password"]
    Page Should Contain Button    css:button[type="submit"]
    
    Sleep    ${DELAY}
    Capture Page Screenshot    02-login-form-elements.png
    
    Log    Login page visual test completed    level=INFO

Test 03 - Dashboard Page Visual Check
    [Documentation]    Test main dashboard visualization
    [Tags]    dashboard    visual    high-priority
    
    # Navigate to dashboard (assuming demo mode)
    Go To    ${BASE_URL}/demo/app/dashboard
    Sleep    ${LONG_DELAY}
    Capture Page Screenshot    03-dashboard-loading.png
    
    # Wait and capture
    Run Keyword And Ignore Error    Wait Until Page Contains Element    css:body    timeout=${PAGE_LOAD_TIMEOUT}
    Sleep    ${DELAY}
    Capture Page Screenshot    03-dashboard-full-view.png
    
    # Capture top section
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    ${DELAY}
    Capture Page Screenshot    03-dashboard-top.png
    
    # Capture middle
    Execute Javascript    window.scrollTo(0, document.body.scrollHeight/2)
    Sleep    ${DELAY}
    Capture Page Screenshot    03-dashboard-middle.png
    
    # Capture bottom
    Execute Javascript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    ${DELAY}
    Capture Page Screenshot    03-dashboard-bottom.png
    
    Log    Dashboard visual test completed    level=INFO

Test 04 - Assessments Module Visual Test
    [Documentation]    Test assessments module UI and interactions
    [Tags]    assessments    visual    module
    
    Go To    ${BASE_URL}/demo/app/assessments
    Sleep    ${LONG_DELAY}
    Capture Page Screenshot    04-assessments-loading.png
    
    Wait Until Page Contains Element    css:body    timeout=${PAGE_LOAD_TIMEOUT}
    Sleep    ${DELAY}
    Capture Page Screenshot    04-assessments-main-view.png
    
    # Capture full page
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    1s
    Capture Page Screenshot    04-assessments-top.png
    
    Execute Javascript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    ${DELAY}
    Capture Page Screenshot    04-assessments-full-page.png
    
    Log    Assessments module visual test completed    level=INFO

Test 05 - Frameworks Module Visual Test
    [Documentation]    Test frameworks module UI
    [Tags]    frameworks    visual    module
    
    Go To    ${BASE_URL}/demo/app/frameworks
    Sleep    ${LONG_DELAY}
    Capture Page Screenshot    05-frameworks-loading.png
    
    Wait Until Page Contains Element    css:body    timeout=${PAGE_LOAD_TIMEOUT}
    Sleep    ${DELAY}
    Capture Page Screenshot    05-frameworks-main-view.png
    
    # Full page capture
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    1s
    Capture Page Screenshot    05-frameworks-top.png
    
    Execute Javascript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    ${DELAY}
    Capture Page Screenshot    05-frameworks-full.png
    
    Log    Frameworks module visual test completed    level=INFO

Test 06 - Risk Management Module Visual Test
    [Documentation]    Test risk management module and heatmap
    [Tags]    risks    visual    module
    
    Go To    ${BASE_URL}/demo/app/risks
    Sleep    ${LONG_DELAY}
    Capture Page Screenshot    06-risks-loading.png
    
    Wait Until Page Contains Element    css:body    timeout=${PAGE_LOAD_TIMEOUT}
    Sleep    ${DELAY}
    Capture Page Screenshot    06-risks-main-view.png
    
    # Comprehensive capture
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    1s
    Capture Page Screenshot    06-risks-top.png
    
    Execute Javascript    window.scrollTo(0, document.body.scrollHeight/2)
    Sleep    ${DELAY}
    Capture Page Screenshot    06-risks-middle.png
    
    Execute Javascript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    ${DELAY}
    Capture Page Screenshot    06-risks-full.png
    
    Log    Risk management visual test completed    level=INFO

Test 07 - Evidence Module Visual Test
    [Documentation]    Test evidence module UI
    [Tags]    evidence    visual    module
    
    Go To    ${BASE_URL}/demo/app/evidence
    Sleep    ${LONG_DELAY}
    Capture Page Screenshot    07-evidence-loading.png
    
    Wait Until Page Contains Element    css:body    timeout=${PAGE_LOAD_TIMEOUT}
    Sleep    ${DELAY}
    Capture Page Screenshot    07-evidence-main-view.png
    
    # Full page captures
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    1s
    Capture Page Screenshot    07-evidence-top.png
    
    Execute Javascript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    ${DELAY}
    Capture Page Screenshot    07-evidence-full.png
    
    Log    Evidence module visual test completed    level=INFO

Test 08 - Responsive Design Check Mobile View
    [Documentation]    Test mobile responsiveness
    [Tags]    responsive    visual    mobile
    
    # Set mobile viewport
    Set Window Size    375    667
    Sleep    1s
    
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    css:body    timeout=10s
    Sleep    ${DELAY}
    Capture Page Screenshot    08-mobile-landing.png
    
    # Check mobile menu
    Run Keyword And Ignore Error    Click Element    css:.mobile-menu-button
    Sleep    1s
    Capture Page Screenshot    08-mobile-menu-open.png
    
    Log    Mobile responsive test completed    level=INFO

Test 09 - Responsive Design Check Tablet View
    [Documentation]    Test tablet responsiveness
    [Tags]    responsive    visual    tablet
    
    # Set tablet viewport
    Set Window Size    768    1024
    Sleep    1s
    
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    css:body    timeout=10s
    Sleep    ${DELAY}
    Capture Page Screenshot    09-tablet-landing.png
    
    Log    Tablet responsive test completed    level=INFO

Test 10 - Dark Mode Toggle Visual Test
    [Documentation]    Test dark mode switching
    [Tags]    theme    visual    darkmode
    
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    css:body    timeout=10s
    
    # Capture light mode
    Sleep    1s
    Capture Page Screenshot    10-light-mode.png
    
    # Toggle dark mode
    Run Keyword And Ignore Error    Click Element    css:.theme-toggle
    Sleep    ${DELAY}
    Capture Page Screenshot    10-dark-mode.png
    
    Log    Dark mode visual test completed    level=INFO

Test 11 - Bilingual UI Test Arabic
    [Documentation]    Test Arabic RTL layout
    [Tags]    i18n    visual    arabic
    
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    css:body    timeout=10s
    
    # Switch to Arabic
    Run Keyword And Ignore Error    Click Element    css:.language-selector
    Run Keyword And Ignore Error    Click Element    css:button:contains("العربية")
    Sleep    ${DELAY}
    
    Capture Page Screenshot    11-arabic-layout.png
    
    # Check RTL direction
    ${dir}=    Get Element Attribute    css:html    dir
    Should Be Equal    ${dir}    rtl
    
    Log    Arabic UI visual test completed    level=INFO

Test 12 - Navigation Flow Test
    [Documentation]    Test navigation between main pages
    [Tags]    navigation    visual    flow
    
    Go To    ${BASE_URL}/demo/app/dashboard
    Wait Until Page Contains Element    css:.dashboard    timeout=15s
    Capture Page Screenshot    12-nav-dashboard.png
    
    # Navigate to assessments
    Click Element    css:a[href*="assessments"]
    Wait Until Page Contains Element    css:.assessment-manager    timeout=10s
    Sleep    1s
    Capture Page Screenshot    12-nav-assessments.png
    
    # Navigate to frameworks
    Click Element    css:a[href*="frameworks"]
    Wait Until Page Contains Element    css:.framework-manager    timeout=10s
    Sleep    1s
    Capture Page Screenshot    12-nav-frameworks.png
    
    Log    Navigation flow test completed    level=INFO

*** Keywords ***
Setup Test Environment
    [Documentation]    Initialize test environment and directories
    Log    Setting up test environment    level=INFO
    
    # Create directories
    Create Directory    ${SCREENSHOT_DIR}
    Create Directory    ${VIDEO_DIR}
    
    # Open browser
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.5s
    
    Log    Test environment setup completed    level=INFO

Teardown Test Environment
    [Documentation]    Clean up after all tests
    Log    Tearing down test environment    level=INFO
    Close All Browsers
    Log    Test environment teardown completed    level=INFO

Start Screen Recording
    [Documentation]    Start recording screen for current test
    ${test_name}=    Get Variable Value    ${TEST_NAME}    default_test
    Log    Starting screen recording for: ${test_name}    level=INFO
    # Note: Actual screen recording requires external tools or FFmpeg

Stop Screen Recording And Capture Screenshot
    [Documentation]    Stop recording and capture final screenshot
    ${test_name}=    Get Variable Value    ${TEST_NAME}    default_test
    ${timestamp}=    Get Time    epoch
    
    # Capture final screenshot
    Run Keyword And Ignore Error    Capture Page Screenshot    final-${test_name}-${timestamp}.png
    
    Log    Screen recording stopped for: ${test_name}    level=INFO
