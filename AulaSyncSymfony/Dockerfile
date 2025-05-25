FROM php:8.2-fpm-alpine

# Instalar dependencias mínimas
RUN apk add --no-cache \
    bash \
    git \
    zip \
    unzip \
    libzip-dev

# Instalar extensiones PHP necesarias
RUN docker-php-ext-install pdo pdo_mysql zip

# Instalar Composer
COPY --from=composer:2.5 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install

# Generar clave JWT si no existe
RUN mkdir -p config/jwt
RUN if [ ! -f config/jwt/private.pem ]; then \
    echo "Generando claves JWT..."; \
    php bin/console lexik:jwt:generate-keypair --no-interaction; \
    fi

# Ajustar permisos
RUN chown -R www-data:www-data /var/www
RUN chmod -R 777 /var/www/var

EXPOSE 8000

# Usar el servidor PHP incorporado apuntando a public/index.php
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
