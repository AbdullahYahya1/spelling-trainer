# Production API Deployer
# This script builds and uploads the Spelling Trainer API to the FTP server

param(
    [switch]$BuildOnly,
    [switch]$UploadOnly,
    [switch]$Help
)

if ($Help) {
    Write-Host "Spelling Trainer API Deployer" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\deploy-api.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -BuildOnly    Only build the project, don't upload"
    Write-Host "  -UploadOnly   Only upload existing build, don't rebuild"
    Write-Host "  -Help         Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy-api.ps1              # Build and upload"
    Write-Host "  .\deploy-api.ps1 -BuildOnly   # Only build"
    Write-Host "  .\deploy-api.ps1 -UploadOnly  # Only upload"
    exit 0
}

# Configuration
$ftpServer = "ftp://apiforspelling.somee.com"
$ftpUsername = "abvdsrf23"
$ftpPassword = "L123456n"
$localPath = "backend/SpellingTrainer.API/publish"
$remotePath = "/www.apiforspelling.somee.com"
$projectPath = "backend/SpellingTrainer.API"

Write-Host "=== SPELLING TRAINER API DEPLOYER ===" -ForegroundColor Green
Write-Host ""

# Step 1: Build the project (unless UploadOnly is specified)
if (-not $UploadOnly) {
    Write-Host "Step 1: Building the project..." -ForegroundColor Yellow
    
    # Clean previous build
    if (Test-Path $localPath) {
        Write-Host "Cleaning previous build..." -ForegroundColor Gray
        Remove-Item -Path $localPath -Recurse -Force
    }
    
    # Build and publish
    Write-Host "Building and publishing..." -ForegroundColor Gray
    Set-Location $projectPath
    dotnet publish -c Release -o publish --self-contained false
    Set-Location ..
    Set-Location ..
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host ""
}

# Check if build exists
if (-not (Test-Path $localPath)) {
    Write-Host "Build folder not found! Run without -UploadOnly first." -ForegroundColor Red
    exit 1
}

# Step 2: Upload files (unless BuildOnly is specified)
if (-not $BuildOnly) {
    Write-Host "Step 2: Uploading files..." -ForegroundColor Yellow
    
    # Get all files from the publish directory
    $allFiles = Get-ChildItem -Path $localPath -Recurse -File
    
    # Filter out nested publish folders
    $filteredFiles = @()
    foreach ($file in $allFiles) {
        $relativePath = $file.FullName.Substring((Resolve-Path $localPath).Path.Length + 1)
        
        # Skip files in nested publish folders
        if ($relativePath -like "*\publish\*") {
            Write-Host "Skipping nested file: $relativePath" -ForegroundColor Yellow
            continue
        }
        
        $filteredFiles += $file
    }
    
    Write-Host "Found $($filteredFiles.Count) files to upload" -ForegroundColor Cyan
    Write-Host ""
    
    $successCount = 0
    $failCount = 0
    
    foreach ($file in $filteredFiles) {
        $relativePath = $file.FullName.Substring((Resolve-Path $localPath).Path.Length + 1)
        $remoteFilePath = "$remotePath/$relativePath".Replace('\', '/')
        
        try {
            Write-Host "Uploading: $relativePath" -ForegroundColor White
            $ftpRequest = [System.Net.FtpWebRequest]::Create("$ftpServer$remoteFilePath")
            $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
            $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $ftpRequest.UseBinary = $true
            
            $fileContent = [System.IO.File]::ReadAllBytes($file.FullName)
            $ftpRequest.ContentLength = $fileContent.Length
            
            $requestStream = $ftpRequest.GetRequestStream()
            $requestStream.Write($fileContent, 0, $fileContent.Length)
            $requestStream.Close()
            
            $response = $ftpRequest.GetResponse()
            $response.Close()
            
            Write-Host "SUCCESS: $relativePath" -ForegroundColor Green
            $successCount++
        }
        catch {
            Write-Host "FAILED: $relativePath - $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
        }
    }
    
    Write-Host ""
    Write-Host "=== UPLOAD SUMMARY ===" -ForegroundColor Green
    Write-Host "Total files processed: $($filteredFiles.Count)"
    Write-Host "Successful uploads: $successCount" -ForegroundColor Green
    Write-Host "Failed uploads: $failCount" -ForegroundColor Red
    
    if ($failCount -eq 0) {
        Write-Host ""
        Write-Host "API deployed successfully!" -ForegroundColor Green
        Write-Host "API URL: https://apiforspelling.somee.com" -ForegroundColor Cyan
        Write-Host "Swagger UI: https://apiforspelling.somee.com/swagger" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "Deployment completed!" -ForegroundColor Green
