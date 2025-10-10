@echo off
echo ========================================
echo   Spelling Trainer API Deployer
echo ========================================
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: PowerShell is not available
    pause
    exit /b 1
)

REM Run the PowerShell deployer
echo Starting deployment...
powershell -ExecutionPolicy Bypass -File "deploy-api.ps1"

echo.
echo Deployment completed!
pause