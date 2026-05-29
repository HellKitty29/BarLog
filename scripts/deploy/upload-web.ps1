# 上传 dist/ 到 EC2（需已执行 build-web.ps1）
# 用法：
#   powershell -File scripts/deploy/upload-web.ps1
#   powershell -File scripts/deploy/upload-web.ps1 -KeyPath "D:\AWS\testkey.pem" -Host "ec2-user@54.251.141.226"

param(
    [string]$KeyPath = "D:\AWS\testkey.pem",
    [string]$RemoteHost = "ec2-user@54.251.141.226"
)

$ErrorActionPreference = "Stop"
$Root = Join-Path $PSScriptRoot "..\.."
$Dist = Join-Path $Root "dist"

if (-not (Test-Path (Join-Path $Dist "index.html"))) {
    throw "dist/ not found — run scripts/deploy/build-web.ps1 first"
}

Write-Host "== scp dist -> server /tmp/barlog-web/ =="
scp -i $KeyPath -r "$Dist\*" "${RemoteHost}:/tmp/barlog-web/"

Write-Host ""
Write-Host "Upload done. On the server run:"
Write-Host "  sudo mkdir -p /var/www/barlog-app-dev"
Write-Host "  sudo rsync -av --delete /tmp/barlog-web/ /var/www/barlog-app-dev/"
Write-Host "  sudo chown -R nginx:nginx /var/www/barlog-app-dev"
Write-Host "  sudo nginx -t && sudo systemctl reload nginx"
