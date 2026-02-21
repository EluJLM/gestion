# ---------- 3) Imagen final ----------
FROM php:8.3-fpm-alpine
WORKDIR /var/www

RUN apk add --no-cache \
    bash git unzip libzip-dev icu-dev oniguruma-dev mariadb-client \
 && docker-php-ext-install pdo_mysql mbstring zip intl

COPY . /var/www

# vendors + build ya listos
COPY --from=composer_build /app/vendor /var/www/vendor
COPY --from=node_build /app/public/build /var/www/public/build

RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm", "-F"]