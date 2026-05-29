# 本机构建 Expo Web 静态包
# 用法：powershell -File scripts/deploy/build-web.ps1

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..\..")

if (-not (Test-Path ".env.production")) {
    if (Test-Path ".env.production.example") {
        Copy-Item ".env.production.example" ".env.production"
        Write-Host "Created .env.production from .env.production.example"
    } else {
        throw "Missing .env.production — set EXPO_PUBLIC_API_BASE_URL first."
    }
}

Write-Host "== npm install =="
npm install

Write-Host "== expo export web (loads .env.production automatically) =="
$env:NODE_ENV = "production"
npx expo export --platform web

if (-not (Test-Path "dist\index.html")) {
    throw "Build failed: dist/index.html not found"
}

Write-Host "OK: dist/ ready for upload"
