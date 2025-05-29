FROM php:8.2-fpm-alpine

# Instalar dependencias necesarias + stunnel y openssl
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    stunnel \
    openssl \
    ca-certificates \
  && docker-php-ext-install pdo pdo_mysql zip

# ...existing code...

# Crear directorios para stunnel y certificados
RUN mkdir -p /etc/stunnel/certs \
    && mkdir -p /etc/pki/tls/certs \
    && mkdir -p /etc/pki/tls/private

# Configuración mejorada de stunnel
RUN printf '\
[https]\n\
accept  = 443\n\
connect = 127.0.0.1:8000\n\
cert    = /etc/stunnel/certs/certificate.crt\n\
key     = /etc/stunnel/certs/private.key\n\
CAfile  = /etc/stunnel/certs/ca_bundle.crt\n\
verify  = 2\n\
TIMEOUTclose = 0\n\
options = NO_SSLv2\n\
options = NO_SSLv3\n\
' > /etc/stunnel/stunnel.conf

# Script de entrada mejorado
RUN printf '#!/bin/sh\n\
# Verificar certificados\n\
if [ ! -f /etc/stunnel/certs/certificate.crt ] || \n\
   [ ! -f /etc/stunnel/certs/private.key ] || \n\
   [ ! -f /etc/stunnel/certs/ca_bundle.crt ]; then\n\
    echo "Error: Faltan certificados SSL"\n\
    exit 1\n\
fi\n\
\n\
# Lanzar stunnel en background\n\
stunnel /etc/stunnel/stunnel.conf &\n\
# Esperar a que stunnel esté listo\n\
sleep 2\n\
# Lanzar el servidor PHP en el puerto 8000\n\
php -S 0.0.0.0:8000 -t public\n' \
> /entrypoint.sh \
&& chmod +x /entrypoint.sh

# ...existing code...