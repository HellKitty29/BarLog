#!/usr/bin/env bash
# EC2 one-time: install Nginx static site
# Usage: sudo bash /tmp/server-install-web.sh /tmp/nginx-app-dev.conf

set -euo pipefail

APP_ROOT="/var/www/barlog-app-dev"
CONF_SRC="${1:-/tmp/nginx-app-dev.conf}"
CONF_DST="/etc/nginx/conf.d/barlog-app-dev.conf"

echo "== install nginx if missing =="
if ! command -v nginx >/dev/null 2>&1; then
  sudo dnf install -y nginx || sudo yum install -y nginx || sudo apt-get install -y nginx
fi

echo "== create web root =="
sudo mkdir -p "$APP_ROOT"
sudo chown -R nginx:nginx "$APP_ROOT" 2>/dev/null || sudo chown -R www-data:www-data "$APP_ROOT"

if [[ -f "$CONF_SRC" ]]; then
  echo "== install nginx config =="
  sudo cp "$CONF_SRC" "$CONF_DST"
else
  echo "WARN: $CONF_SRC not found"
fi

sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx 2>/dev/null || true
sudo systemctl reload nginx

echo "OK: Nginx ready. Deploy files to $APP_ROOT"
