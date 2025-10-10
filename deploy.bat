@echo off
echo ========================================
echo   BACKEND DEPLOYMENT SCRIPT
echo ========================================
echo.

echo Step 1: Building backend...
cd backend\SpellingTrainer.API
dotnet publish --configuration Release --output ./publish
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo ✓ Build completed successfully
echo.

echo Step 2: Uploading files to FTP...
cd ..\..
powershell -ExecutionPolicy Bypass -File upload.ps1
if %errorlevel% neq 0 (
    echo ERROR: Upload failed!
    pause
    exit /b 1
)
echo ✓ Upload completed successfully
echo.

echo ========================================
echo   DEPLOYMENT COMPLETED SUCCESSFULLY!
echo   API URL: https://apiforspelling.somee.com
echo ========================================
pause
