# Replace YOUR_API_KEY with your actual TinyPNG API key
$apiKey = "9PkWPvd6vVCmjDmGCcWcvb65Lh9r9nfx"

# Function to optimize a single image
function Optimize-Image {
    param (
        [string]$imagePath
    )
    
    $base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("api:$apiKey"))
    
    # Upload file to TinyPNG
    $uploadResponse = Invoke-RestMethod -Uri "https://api.tinify.com/shrink" -Method Post -Headers @{Authorization=("Basic $base64AuthInfo")} -InFile $imagePath
    
    # Download optimized file
    $optimizedContent = Invoke-WebRequest -Uri $uploadResponse.output.url -OutFile $imagePath
    
    Write-Host "Optimized: $imagePath"
}

# Get all WebP files recursively
$webpFiles = Get-ChildItem -Path . -Filter *.webp -Recurse

# Process each file
foreach ($file in $webpFiles) {
    Optimize-Image -imagePath $file.FullName
}

Write-Host "Optimization complete!"