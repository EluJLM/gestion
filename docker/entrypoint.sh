#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

if [ ! -f .env ]; then
  echo "[entrypoint] .env no existe, copiando .env.example"
  cp .env.example .env
fi

echo "[entrypoint] Instalando dependencias PHP"
composer install --no-interaction --prefer-dist --optimize-autoloader

echo "[entrypoint] Instalando dependencias Node"
npm ci

echo "[entrypoint] Compilando frontend"
npm run build

CURRENT_APP_KEY="$(grep '^APP_KEY=' .env 2>/dev/null | head -n1 | cut -d'=' -f2- || true)"

if [ -z "${CURRENT_APP_KEY}" ] || [ "${CURRENT_APP_KEY}" = "null" ]; then
  if [ -n "${APP_KEY:-}" ]; then
    echo "[entrypoint] APP_KEY detectada en variable de entorno, guardando en .env"
    if grep -q '^APP_KEY=' .env; then
      sed -i "s|^APP_KEY=.*|APP_KEY=${APP_KEY}|" .env
    else
      echo "APP_KEY=${APP_KEY}" >> .env
    fi
  else
    echo "[entrypoint] APP_KEY faltante, generando con artisan"
    php artisan key:generate --force
  fi
fi

echo "[entrypoint] Esperando conexión a base de datos..."
for i in {1..20}; do
  if php artisan migrate --force; then
    DB_OK=1
    break
  fi
  echo "[entrypoint] Intento ${i}/20: DB aún no disponible, reintentando en 3s"
  sleep 3
done

if [ "${DB_OK:-0}" -ne 1 ]; then
  echo "[entrypoint] ERROR: no fue posible ejecutar migraciones"
  exit 1
fi

echo "[entrypoint] Limpiando y regenerando cachés"
php artisan optimize:clear
php artisan config:cache

chown -R www-data:www-data storage bootstrap/cache

echo "[entrypoint] Inicio de servicio"
exec "$@"
