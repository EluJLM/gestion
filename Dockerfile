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

# Copia TODO primero (para que exista artisan)
COPY . .

# Instala dependencias (ahora sí puede correr package:discover)
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader


# ---------- 3) Imagen final ----------
FROM php:8.3-cli-alpine
WORKDIR /var/www

RUN apk add --no-cache \
    bash git unzip libzip-dev icu-dev oniguruma-dev mariadb-client \
 && docker-php-ext-install pdo_mysql mbstring zip intl

COPY . /var/www

# vendors + build ya listos
COPY --from=composer_build /app/vendor /var/www/vendor
COPY --from=node_build /app/public/build /var/www/public/build

RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]