FROM php:8.2-fpm-alpine

# Instalar solo pdo para MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Instalar Composer con latest
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . .
RUN composer install

EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
