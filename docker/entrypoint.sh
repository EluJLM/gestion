#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

if [ ! -f .env ]; then
  cp .env.example .env
fi

composer install --no-interaction --prefer-dist --optimize-autoloader
npm ci
npm run build

CURRENT_APP_KEY="$(grep '^APP_KEY=' .env 2>/dev/null | head -n1 | cut -d'=' -f2- || true)"

if [ -z "${CURRENT_APP_KEY}" ] || [ "${CURRENT_APP_KEY}" = "null" ]; then
  if [ -n "${APP_KEY:-}" ]; then
    if grep -q '^APP_KEY=' .env; then
      sed -i "s|^APP_KEY=.*|APP_KEY=${APP_KEY}|" .env
    else
      echo "APP_KEY=${APP_KEY}" >> .env
    fi
  else
    php artisan key:generate --force
  fi
fi

php artisan migrate --force
php artisan optimize:clear
php artisan config:cache

chown -R www-data:www-data storage bootstrap/cache

exec "$@"
