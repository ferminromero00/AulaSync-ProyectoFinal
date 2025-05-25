FROM php:8.2-fpm-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copiar composer.json y composer.lock primero
COPY composer.json composer.lock ./

# Instalar dependencias sin scripts ni dev
RUN composer install --no-scripts --no-dev --optimize-autoloader

# Copiar el resto de archivos
COPY . .

# Configurar el entorno y permisos
ENV APP_ENV=prod
ENV APP_DEBUG=0
RUN chown -R www-data:www-data var

# Generar caché para producción
RUN composer dump-env prod
RUN php bin/console cache:warmup --env=prod

EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
