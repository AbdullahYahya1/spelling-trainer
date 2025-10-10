# Legacy uploader - Use deploy-api.ps1 instead
Write-Host "This is the legacy uploader. Please use deploy-api.ps1 for better functionality." -ForegroundColor Yellow
Write-Host ""
Write-Host "Usage: .\deploy-api.ps1" -ForegroundColor Green
Write-Host "For help: .\deploy-api.ps1 -Help" -ForegroundColor Green
Write-Host ""
Write-Host "This script will now run the new deployer..." -ForegroundColor Cyan

# Run the new deployer
& ".\deploy-api.ps1"
