*** Settings ***
Library           SeleniumLibrary    screenshot_root_directory=screenshots
Library           OperatingSystem
Library           DateTime
Library           String

Suite Setup       Setup Test Environment
Suite Teardown    Teardown Test Environment

*** Variables ***
${BASE_URL}              http://localhost:5175
${BROWSER}               chrome
${SCREENSHOT_DIR}        ${CURDIR}/../../test-results/screenshots
${DELAY}                 3s
${LONG_DELAY}            6s

*** Test Cases ***
Test 001 - Landing Page Complete Capture
    [Documentation]    Capture complete landing page with all sections
    [Tags]    landing    public
    
    Log    Testing Landing Page    console=True
    Go To    ${BASE_URL}
    Sleep    ${LONG_DELAY}
    Maximize Browser Window
    
    # Initial full page
    Capture Page Screenshot    001-landing-initial.png
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    2s
    Capture Page Screenshot    001-landing-top.png
    
    # Scroll through page
    ${height}=    Execute Javascript    return document.body.scrollHeight
    ${scroll_step}=    Evaluate    ${height} / 4
    
    Execute Javascript    window.scrollTo(0, ${scroll_step})
    Sleep    2s
    Capture Page Screenshot    001-landing-section-1.png
    
    Execute Javascript    window.scrollTo(0, ${scroll_step} * 2)
    Sleep    2s
    Capture Page Screenshot    001-landing-section-2.png
    
    Execute Javascript    window.scrollTo(0, ${scroll_step} * 3)
    Sleep    2s
    Capture Page Screenshot    001-landing-section-3.png
    
    Execute Javascript    window.scrollTo(0, ${height})
    Sleep    2s
    Capture Page Screenshot    001-landing-bottom.png
    
    Log    Landing page captured successfully    console=True

Test 002 - Login Page
    [Documentation]    Capture login page
    [Tags]    auth    public
    
    Log    Testing Login Page    console=True
    Go To    ${BASE_URL}/login
    Sleep    ${DELAY}
    Capture Page Screenshot    002-login-page.png
    Log    Login page captured    console=True

Test 003 - Register Page
    [Documentation]    Capture register page
    [Tags]    auth    public
    
    Log    Testing Register Page    console=True
    Go To    ${BASE_URL}/register
    Sleep    ${DELAY}
    Capture Page Screenshot    003-register-page.png
    Log    Register page captured    console=True

Test 004 - Main Dashboard Direct Access
    [Documentation]    Try to access main dashboard
    [Tags]    dashboard
    
    Log    Testing Main Dashboard    console=True
    Go To    ${BASE_URL}/dashboard
    Sleep    ${LONG_DELAY}
    
    Capture Page Screenshot    004-dashboard-main.png
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    2s
    Capture Page Screenshot    004-dashboard-top.png
    
    ${height}=    Execute Javascript    return document.body.scrollHeight
    Execute Javascript    window.scrollTo(0, ${height}/2)
    Sleep    2s
    Capture Page Screenshot    004-dashboard-middle.png
    
    Execute Javascript    window.scrollTo(0, ${height})
    Sleep    2s
    Capture Page Screenshot    004-dashboard-bottom.png
    
    Log    Dashboard captured    console=True

Test 005 - Assessments Page
    [Documentation]    Capture assessments module
    [Tags]    module
    
    Log    Testing Assessments    console=True
    Go To    ${BASE_URL}/assessments
    Sleep    ${LONG_DELAY}
    
    Capture Page Screenshot    005-assessments-main.png
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    2s
    Capture Page Screenshot    005-assessments-top.png
    
    ${height}=    Execute Javascript    return document.body.scrollHeight
    Execute Javascript    window.scrollTo(0, ${height})
    Sleep    2s
    Capture Page Screenshot    005-assessments-full.png
    
    Log    Assessments captured    console=True

Test 006 - Frameworks Page
    [Documentation]    Capture frameworks module
    [Tags]    module
    
    Log    Testing Frameworks    console=True
    Go To    ${BASE_URL}/frameworks
    Sleep    ${LONG_DELAY}
    
    Capture Page Screenshot    006-frameworks-main.png
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    2s
    Capture Page Screenshot    006-frameworks-top.png
    
    ${height}=    Execute Javascript    return document.body.scrollHeight
    Execute Javascript    window.scrollTo(0, ${height})
    Sleep    2s
    Capture Page Screenshot    006-frameworks-full.png
    
    Log    Frameworks captured    console=True

Test 007 - Risk Management Page
    [Documentation]    Capture risk management
    [Tags]    module
    
    Log    Testing Risk Management    console=True
    Go To    ${BASE_URL}/risks
    Sleep    ${LONG_DELAY}
    
    Capture Page Screenshot    007-risks-main.png
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    2s
    Capture Page Screenshot    007-risks-top.png
    
    ${height}=    Execute Javascript    return document.body.scrollHeight
    Execute Javascript    window.scrollTo(0, ${height}/2)
    Sleep    2s
    Capture Page Screenshot    007-risks-middle.png
    
    Execute Javascript    window.scrollTo(0, ${height})
    Sleep    2s
    Capture Page Screenshot    007-risks-bottom.png
    
    Log    Risk Management captured    console=True

Test 008 - Evidence Page
    [Documentation]    Capture evidence module
    [Tags]    module
    
    Log    Testing Evidence    console=True
    Go To    ${BASE_URL}/evidence
    Sleep    ${LONG_DELAY}
    
    Capture Page Screenshot    008-evidence-main.png
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    2s
    Capture Page Screenshot    008-evidence-top.png
    
    ${height}=    Execute Javascript    return document.body.scrollHeight
    Execute Javascript    window.scrollTo(0, ${height})
    Sleep    2s
    Capture Page Screenshot    008-evidence-full.png
    
    Log    Evidence captured    console=True

Test 009 - Organizations Page
    [Documentation]    Capture organizations module
    [Tags]    module
    
    Log    Testing Organizations    console=True
    Go To    ${BASE_URL}/organizations
    Sleep    ${LONG_DELAY}
    
    Capture Page Screenshot    009-organizations-main.png
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    2s
    Capture Page Screenshot    009-organizations-top.png
    
    ${height}=    Execute Javascript    return document.body.scrollHeight
    Execute Javascript    window.scrollTo(0, ${height})
    Sleep    2s
    Capture Page Screenshot    009-organizations-full.png
    
    Log    Organizations captured    console=True

Test 010 - Settings Page
    [Documentation]    Capture settings page
    [Tags]    system
    
    Log    Testing Settings    console=True
    Go To    ${BASE_URL}/settings
    Sleep    ${LONG_DELAY}
    
    Capture Page Screenshot    010-settings-main.png
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    2s
    Capture Page Screenshot    010-settings-top.png
    
    ${height}=    Execute Javascript    return document.body.scrollHeight
    Execute Javascript    window.scrollTo(0, ${height})
    Sleep    2s
    Capture Page Screenshot    010-settings-full.png
    
    Log    Settings captured    console=True

Test 011 - Documents Page
    [Documentation]    Capture documents module
    [Tags]    module
    
    Log    Testing Documents    console=True
    Go To    ${BASE_URL}/documents
    Sleep    ${LONG_DELAY}
    
    Capture Page Screenshot    011-documents-main.png
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    2s
    Capture Page Screenshot    011-documents-top.png
    
    ${height}=    Execute Javascript    return document.body.scrollHeight
    Execute Javascript    window.scrollTo(0, ${height})
    Sleep    2s
    Capture Page Screenshot    011-documents-full.png
    
    Log    Documents captured    console=True

Test 012 - Mobile View Landing
    [Documentation]    Test mobile responsiveness
    [Tags]    mobile
    
    Log    Testing Mobile View    console=True
    Set Window Size    375    667
    Go To    ${BASE_URL}
    Sleep    ${DELAY}
    
    Capture Page Screenshot    012-mobile-landing.png
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    1s
    Capture Page Screenshot    012-mobile-top.png
    
    ${height}=    Execute Javascript    return document.body.scrollHeight
    Execute Javascript    window.scrollTo(0, ${height})
    Sleep    2s
    Capture Page Screenshot    012-mobile-bottom.png
    
    Log    Mobile view captured    console=True

Test 013 - Tablet View Landing
    [Documentation]    Test tablet responsiveness
    [Tags]    tablet
    
    Log    Testing Tablet View    console=True
    Set Window Size    768    1024
    Go To    ${BASE_URL}
    Sleep    ${DELAY}
    
    Capture Page Screenshot    013-tablet-landing.png
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    1s
    Capture Page Screenshot    013-tablet-top.png
    
    ${height}=    Execute Javascript    return document.body.scrollHeight
    Execute Javascript    window.scrollTo(0, ${height})
    Sleep    2s
    Capture Page Screenshot    013-tablet-bottom.png
    
    Log    Tablet view captured    console=True

*** Keywords ***
Setup Test Environment
    [Documentation]    Initialize test environment
    Log    ========================================    console=True
    Log    Setting up Shahin-AI UI Test Environment    console=True
    Log    ========================================    console=True
    
    Create Directory    ${SCREENSHOT_DIR}
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.5s
    Set Selenium Timeout    30s
    
    Log    Browser opened successfully    console=True

Teardown Test Environment
    [Documentation]    Clean up after tests
    Log    ========================================    console=True
    Log    Test Environment Cleanup    console=True
    Log    ========================================    console=True
    
    ${screenshot_count}=    Count Files In Directory    ${SCREENSHOT_DIR}    *.png
    Log    Total screenshots captured: ${screenshot_count}    console=True
    Log    Screenshots saved to: ${SCREENSHOT_DIR}    console=True
    
    Close All Browsers
    Log    Teardown completed    console=True
