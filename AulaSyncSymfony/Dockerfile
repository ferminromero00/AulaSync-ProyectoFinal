FROM php:8.2-fpm-alpine

# Instalar dependencias
RUN apk add --no-cache \
    git \
    zip \
    unzip \
    nodejs \
    npm

# Instalar extensiones PHP necesarias
RUN docker-php-ext-install pdo pdo_mysql

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Establecer entorno de producción
ENV APP_ENV=prod
ENV APP_DEBUG=0

# Copiar todo el proyecto
COPY . .

# Instalar todas las dependencias
RUN composer install \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

# Generar caché de producción
RUN composer dump-env prod
RUN composer run-script post-install-cmd

# Configurar permisos
RUN chown -R www-data:www-data .

EXPOSE 9000

CMD ["php-fpm"]
