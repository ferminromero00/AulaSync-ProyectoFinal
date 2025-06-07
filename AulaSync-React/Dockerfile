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

# Construir la aplicación
RUN npm run build

# Etapa 2: Configuración del servidor Nginx
FROM nginx:alpine

# Crear directorios para certificados y configurar ZeroSSL
RUN mkdir -p /etc/pki/tls/certs \
    && mkdir -p /etc/pki/tls/private \
    && mkdir -p /etc/pki/ca-trust/source/anchors/ \
    && curl -o /etc/pki/ca-trust/source/anchors/zerossl.crt https://crt.sh/?d=2099991459 \
    && update-ca-certificates

# Copiar los certificados SSL
COPY SSL/aulasync.work.gd.cer /etc/pki/tls/certs/certificate.crt
COPY SSL/aulasync.work.gd.key /etc/pki/tls/private/private.key
COPY SSL/ca.cer /etc/pki/tls/certs/ca_bundle.crt

# Ajustar permisos de los certificados
RUN chmod 644 /etc/pki/tls/certs/*.crt \
    && chmod 600 /etc/pki/tls/private/*.key

# Copia el build de la app principal (React) a la raíz
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia la documentación estática generada (NO el build de la app) a /docs
COPY AulaSync-React/docs /usr/share/nginx/html/docs

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
    
    # Servir la documentación en /docs
    location /docs/ {
        alias /usr/share/nginx/html/docs/;
        try_files \$uri \$uri/ /docs/index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # Servir la app principal en la raíz
    location / {
        root /usr/share/nginx/html;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    location /uploads/ {
        proxy_pass http://aulasync-back:8000/uploads/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        proxy_cache_valid 200 24h;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    location /api/ {
        proxy_pass http://aulasync-back:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Expone los puertos necesarios
EXPOSE 80 443

# Define el punto de entrada y el comando por defecto
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]