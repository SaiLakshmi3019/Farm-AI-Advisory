$ErrorActionPreference = "Stop"

Set-Location "C:\Users\SAI LAKSHMI\Desktop\Farm-AI-Advisory\frontend"

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".\ui-backup-$stamp"

New-Item -ItemType Directory -Path $backup -Force | Out-Null

foreach ($file in @(
    "App.jsx",
    "App.css",
    "FarmerDashboard.jsx",
    "FarmerDashboardV2.jsx",
    "FarmerDashboardV2.css",
    "Chatbot.jsx",
    "Chatbot.css"
)) {
    $source = ".\src\$file"

    if (Test-Path $source) {
        Copy-Item $source (Join-Path $backup $file) -Force
    }
}

$app = ".\src\App.jsx"

if (-not (Test-Path $app)) {
    throw "App.jsx not found."
}

$raw = Get-Content $app -Raw

$raw = $raw -replace "from './FarmerDashboard\.jsx'", "from './FarmerDashboardV2.jsx'"
$raw = $raw -replace 'from "./FarmerDashboard\.jsx"', 'from "./FarmerDashboardV2.jsx"'

Set-Content $app $raw -Encoding UTF8

$appCss = ".\src\App.css"
$override = ".\ui-overrides.css"

if ((Test-Path $appCss) -and (Test-Path $override)) {

    $css = Get-Content $appCss -Raw
    $extra = Get-Content $override -Raw

    if ($css -notmatch "FINAL FARM AI AUTH IMAGE") {
        Add-Content -Path $appCss -Value "`r`n`r`n$extra" -Encoding UTF8
    }
}

Write-Host ""
Write-Host "FINAL FARM AI UI APPLIED SUCCESSFULLY" -ForegroundColor Green
Write-Host "Backup created: $backup" -ForegroundColor Yellow
Write-Host ""
