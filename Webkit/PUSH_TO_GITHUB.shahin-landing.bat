@echo off
title Shahin GRC - Push to GitHub (doganlap/shahin-landing)
color 0A
echo.
echo ========================================
echo   Push to GitHub Repository
echo   Repository: doganlap/shahin-landing
echo ========================================
echo.

echo ⚠️  Authentication Required
echo.
echo You need to authenticate with GitHub account: doganlap
echo.
echo Options:
echo.
echo [Option 1] Use GitHub CLI (Recommended)
echo   1. Run: gh auth login
echo   2. Select: GitHub.com
echo   3. Select: HTTPS
echo   4. Authenticate: Yes
echo   5. Select: Login with a web browser
echo   6. Copy the code shown
echo   7. Press Enter and authorize in browser
echo   8. Then run this script again
echo.
echo [Option 2] Use Personal Access Token
echo   1. Go to: https://github.com/settings/tokens
echo   2. Generate new token (classic)
echo   3. Select scopes: repo (all)
echo   4. Copy the token
echo   5. Use it as password when pushing
echo.
echo [Option 3] Use SSH (If SSH key is configured)
echo   1. Update remote: git remote set-url origin git@github.com:doganlap/shahin-landing.git
echo   2. Then push: git push -u origin master
echo.
echo ========================================
echo.

set /p AUTH_METHOD="Choose method (1=CLI, 2=Token, 3=SSH, 4=Cancel): "

if "%AUTH_METHOD%"=="1" (
    echo.
    echo Starting GitHub CLI authentication...
    gh auth login
    echo.
    echo Authentication complete. Pushing to GitHub...
    git push -u origin master
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo.
        echo Repository: https://github.com/doganlap/shahin-landing
        echo.
    ) else (
        echo.
        echo ❌ Push failed. Please check the error above.
        echo.
    )
) else if "%AUTH_METHOD%"=="2" (
    echo.
    echo Using Personal Access Token...
    echo.
    echo When prompted for password, paste your GitHub Personal Access Token
    echo (Username: doganlap)
    echo.
    git push -u origin master
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo.
        echo Repository: https://github.com/doganlap/shahin-landing
        echo.
    ) else (
        echo.
        echo ❌ Push failed. Please check the error above.
        echo.
    )
) else if "%AUTH_METHOD%"=="3" (
    echo.
    echo Switching to SSH...
    git remote set-url origin git@github.com:doganlap/shahin-landing.git
    echo.
    echo Remote updated to SSH. Pushing...
    git push -u origin master
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo.
        echo Repository: https://github.com/doganlap/shahin-landing
        echo.
    ) else (
        echo.
        echo ❌ Push failed. Please check SSH key configuration.
        echo.
    )
) else (
    echo.
    echo Push cancelled.
    echo.
)

pause

