$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Test-Path ".\src")) {
    throw "Run this script after extracting the package into the frontend folder."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".\.ui-backup-$stamp"
New-Item -ItemType Directory -Path $backup -Force | Out-Null

foreach ($file in @("App.css", "App.jsx", "FarmerDashboardV2.jsx", "FarmerDashboardV2.css")) {
    $path = ".\src\$file"
    if (Test-Path $path) {
        Copy-Item $path (Join-Path $backup $file) -Force
    }
}

New-Item -ItemType Directory -Path ".\public\images" -Force | Out-Null

$app = ".\src\App.jsx"
if (Test-Path $app) {
    $raw = Get-Content $app -Raw
    $raw = $raw -replace "from './FarmerDashboard\.jsx'", "from './FarmerDashboardV2.jsx'"
    $raw = $raw -replace 'from "./FarmerDashboard\.jsx"', 'from "./FarmerDashboardV2.jsx"'
    Set-Content $app $raw -Encoding UTF8
}

$appCss = ".\src\App.css"
$overrideFile = ".\ui-overrides.css"
$marker = "/* FARM AI PROFESSIONAL UI OVERRIDES */"

if ((Test-Path $appCss) -and (Test-Path $overrideFile)) {
    $cssRaw = Get-Content $appCss -Raw
    if ($cssRaw -notmatch [regex]::Escape($marker)) {
        $override = Get-Content $overrideFile -Raw
        Add-Content -Path $appCss -Value "`r`n`r`n$override" -Encoding UTF8
    }
}

Write-Host ""
Write-Host "Farm AI UI upgrade applied successfully." -ForegroundColor Green
Write-Host "Backup created at: $backup" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next commands:" -ForegroundColor Cyan
Write-Host "npm run build"
Write-Host "npm run dev -- --host 127.0.0.1 --force"
