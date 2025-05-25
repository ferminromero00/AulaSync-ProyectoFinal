FROM php:8.2-fpm-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    nginx \
    supervisor \
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

# Copiar todo el proyecto
COPY . .

# Copiar configuración personalizada de Nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copiar configuración de supervisord
COPY docker/supervisord.conf /etc/supervisord.conf

# Establecer entorno de producción
ENV APP_ENV=prod
ENV APP_DEBUG=0

# Instalar dependencias PHP
RUN composer install \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

# Generar caché de producción
RUN composer dump-env prod
RUN composer run-script post-install-cmd

# Configurar permisos
RUN chown -R www-data:www-data .

EXPOSE 8000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
