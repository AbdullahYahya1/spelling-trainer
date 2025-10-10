# Upload ALL files from publish folder
$ftpServer = "ftp://apiforspelling.somee.com"
$ftpUsername = "abvdsrf23"
$ftpPassword = "L123456n"
$localPath = "backend/SpellingTrainer.API/publish"
$remotePath = "/www.apiforspelling.somee.com"

Write-Host "Starting upload of ALL files from publish folder..."

# Get all files from the publish directory (including subdirectories)
$allFiles = Get-ChildItem -Path $localPath -Recurse -File

Write-Host "Found $($allFiles.Count) files to upload..."

foreach ($file in $allFiles) {
    # Calculate relative path from publish folder
    $relativePath = $file.FullName.Substring((Resolve-Path $localPath).Path.Length + 1)
    $remoteFilePath = "$remotePath/$relativePath".Replace('\', '/')
    
    try {
        Write-Host "Uploading: $relativePath"
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
        
        Write-Host "✓ Success: $relativePath"
    }
    catch {
        # Only show important failures, not duplicate file errors
        if ($relativePath -notlike "*\publish\*") {
            Write-Host "✗ Failed: $relativePath - $($_.Exception.Message)"
        }
    }
}

Write-Host "Upload completed! Uploaded $($allFiles.Count) files."
