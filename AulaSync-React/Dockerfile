# Etapa 1: Construcción de la aplicación con Node.js
FROM node:18-alpine AS builder

WORKDIR /app

# Copia los archivos de dependencias
COPY AulaSync-React/package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY AulaSync-React/. .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Etapa 2: Configuración del servidor Nginx
FROM nginx:alpine

# Crear directorios para certificados
RUN mkdir -p /etc/pki/tls/certs \
    && mkdir -p /etc/pki/tls/private

# Copiar los certificados SSL
COPY SSL/aulasync.work.gd.cer /etc/pki/tls/certs/certificate.crt
COPY SSL/aulasync.work.gd.key /etc/pki/tls/private/private.key
COPY SSL/ca.cer /etc/pki/tls/certs/ca_bundle.crt

# Ajustar permisos de los certificados
RUN chmod 644 /etc/pki/tls/certs/*.crt \
    && chmod 600 /etc/pki/tls/private/*.key

# Copia los archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia el script de entrada personalizado
COPY AulaSync-React/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Configura Nginx para redirigir HTTP a HTTPS y servir la aplicación
RUN cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen 80;
    server_name aulasync.work.gd;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name aulasync.work.gd;
    ssl_certificate /etc/pki/tls/certs/certificate.crt;
    ssl_certificate_key /etc/pki/tls/private/private.key;
    ssl_trusted_certificate /etc/pki/tls/certs/ca_bundle.crt;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    root /usr/share/nginx/html;
    index index.html index.htm;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Expone los puertos necesarios
EXPOSE 80 443

# Define el punto de entrada y el comando por defecto
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
