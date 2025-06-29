FROM php:8.2-fpm-alpine

# Instalar dependencias necesarias + stunnel y openssl
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    stunnel \
    openssl \
    ca-certificates \
    openldap-dev \
  && docker-php-ext-install pdo pdo_mysql zip ldap

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copiar composer.json y composer.lock primero
COPY AulaSyncSymfony/composer.json AulaSyncSymfony/composer.lock ./

# Instalar dependencias sin scripts ni dev
RUN composer install --no-scripts --optimize-autoloader

# Copiar el resto de archivos
COPY AulaSyncSymfony/. .

# Copiar la documentación generada a la carpeta pública
RUN cp -r /var/www/docs /var/www/public/

# Generar claves JWT
RUN mkdir -p config/jwt && \
    openssl genrsa -aes256 -passout pass:d2fc5260fad6e9ae752cd8666c237d78b2f970a4befe84df28120cd1a21803a9 -out config/jwt/private.pem 4096 && \
    openssl rsa -pubout -in config/jwt/private.pem -passin pass:d2fc5260fad6e9ae752cd8666c237d78b2f970a4befe84df28120cd1a21803a9 -out config/jwt/public.pem

# Configurar el entorno y permisos
ENV APP_ENV=prod
ENV APP_DEBUG=0
RUN mkdir -p var && chown -R www-data:www-data var

# Generar caché para producción
RUN composer dump-env prod \
 && php bin/console cache:warmup --env=prod

# -------------------------------------------------------------------
# NUEVAS SECCIONES PARA HTTPS via stunnel con mejoras de seguridad
# -------------------------------------------------------------------

# Crear directorios para stunnel y certificados
RUN mkdir -p /etc/stunnel/certs

# Copiar los certificados SSL
COPY SSL/aulasync.work.gd.cer /etc/stunnel/certs/certificate.crt
COPY SSL/aulasync.work.gd.key /etc/stunnel/certs/private.key
COPY SSL/ca.cer /etc/stunnel/certs/ca_bundle.crt

# Ajustar permisos de los certificados
RUN chmod 644 /etc/stunnel/certs/*.crt \
    && chmod 600 /etc/stunnel/certs/*.key


# Inyectar configuración mejorada de stunnel
RUN printf '\
[https]\n\
accept  = 443\n\
connect = 127.0.0.1:8000\n\
cert    = /etc/stunnel/certs/certificate.crt\n\
key     = /etc/stunnel/certs/private.key\n\
CAfile  = /etc/stunnel/certs/ca_bundle.crt\n\
verify  = 0\n\
TIMEOUTclose = 0\n\
options = NO_SSLv2\n\
options = NO_SSLv3\n\
socket  = l:TCP_NODELAY=1\n\
socket  = r:TCP_NODELAY=1\n\
debug   = 7\n' \
> /etc/stunnel/stunnel.conf

# Entrypoint mejorado con verificaciones
RUN printf '#!/bin/sh\n\
\n\
# Verificar la existencia de certificados\n\
if [ ! -f /etc/stunnel/certs/certificate.crt ] || \n\
   [ ! -f /etc/stunnel/certs/private.key ] || \n\
   [ ! -f /etc/stunnel/certs/ca_bundle.crt ]; then\n\
    echo "Error: Certificados SSL no encontrados"\n\
    echo "Por favor, monte los certificados SSL:"\n\
    echo "- /etc/stunnel/certs/certificate.crt"\n\
    echo "- /etc/stunnel/certs/private.key"\n\
    echo "- /etc/stunnel/certs/ca_bundle.crt"\n\
    exit 1\n\
fi\n\
\n\
# Verificar permisos de certificados\n\
chmod 600 /etc/stunnel/certs/*.key\n\
chmod 644 /etc/stunnel/certs/*.crt\n\
\n\
# Iniciar stunnel en background\n\
echo "Iniciando stunnel..."\n\
stunnel /etc/stunnel/stunnel.conf &\n\
\n\
# Esperar a que stunnel esté completamente iniciado\n\
sleep 2\n\
\n\
# Verificar que stunnel está ejecutándose\n\
if ! pgrep stunnel > /dev/null; then\n\
    echo "Error: stunnel no se pudo iniciar"\n\
    exit 1\n\
fi\n\
\n\
echo "Iniciando servidor PHP..."\n\
# Lanzar el servidor PHP en el puerto 8000\n\
php -S 0.0.0.0:8000 -t public\n' \
> /entrypoint.sh \
&& chmod +x /entrypoint.sh

# Exponer puertos necesarios
EXPOSE 8000 443

# Usar nuestro entrypoint mejorado
ENTRYPOINT ["/entrypoint.sh"]