#!/bin/sh

# Reemplazar la URL de la API en los archivos JS si se proporciona VITE_API_URL
if [ -n "$VITE_API_URL" ]; then
    echo "Configurando API URL: $VITE_API_URL"
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:8000|$VITE_API_URL|g" {} +
fi

# Ejecutar el comando original
exec "$@"
