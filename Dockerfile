# ---------- 1) Build frontend ----------
FROM node:20-alpine AS node_build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------- 2) Composer ----------
FROM composer:2 AS composer_build
WORKDIR /app

COPY composer.json composer.lock* ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader

COPY . .
RUN composer dump-autoload --optimize


# ---------- 3) Imagen final ----------
FROM php:8.3-cli-alpine

WORKDIR /var/www

# Extensiones necesarias
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    mariadb-client \
 && docker-php-ext-install pdo_mysql mbstring zip intl

# Copiamos proyecto
COPY . /var/www

# Copiamos vendor
COPY --from=composer_build /app/vendor /var/www/vendor

# Copiamos build de Vite
COPY --from=node_build /app/public/build /var/www/public/build

# Permisos
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]