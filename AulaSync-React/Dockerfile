# Etapa 1: Construcción de la aplicación con Node.js
FROM node:18-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Define la variable de entorno para la URL de la API
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construye la aplicación para producción
RUN npm run build

# Etapa 2: Configuración del servidor Nginx
FROM nginx:alpine

# Crea el directorio para los certificados SSL
RUN mkdir -p /etc/nginx/certs

# Copia los archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia el script de entrada personalizado
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Configura Nginx para redirigir HTTP a HTTPS y servir la aplicación
RUN echo '\
server {\n\
    listen 80;\n\
    server_name aulasync.work.gd;\n\
    return 301 https://$host$request_uri;\n\
}\n\
\n\
server {\n\
    listen 443 ssl;\n\
    server_name aulasync.work.gd;\n\
    ssl_certificate /etc/pki/tls/certs/certificate.crt;\n\
    ssl_certificate_key /etc/pki/tls/private/private.key;\n\
    ssl_trusted_certificate /etc/pki/tls/certs/ca_bundle.crt;\n\
    ssl_protocols TLSv1.2 TLSv1.3;\n\
    ssl_ciphers HIGH:!aNULL:!MD5;\n\
    root /usr/share/nginx/html;\n\
    index index.html index.htm;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n\
' > /etc/nginx/conf.d/default.conf

# Expone los puertos necesarios
EXPOSE 80 443

# Define el punto de entrada y el comando por defecto
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
