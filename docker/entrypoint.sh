#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

if [ ! -f .env ]; then
  cp .env.example .env
fi

composer install --no-interaction --prefer-dist --optimize-autoloader
npm ci
npm run build

if ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force
fi

php artisan migrate --force
php artisan optimize:clear
php artisan config:cache

chown -R www-data:www-data storage bootstrap/cache

exec "$@"
