#!/bin/sh

# Verificar la existencia de certificados
if [ ! -f /etc/pki/tls/certs/certificate.crt ] || \
   [ ! -f /etc/pki/tls/private/private.key ] || \
   [ ! -f /etc/pki/tls/certs/ca_bundle.crt ]; then
    echo "Error: Certificados SSL no encontrados"
    echo "Por favor, verifique que los certificados estén montados correctamente:"
    echo "- /etc/pki/tls/certs/certificate.crt"
    echo "- /etc/pki/tls/private/private.key"
    echo "- /etc/pki/tls/certs/ca_bundle.crt"
    exit 1
fi

# Verificar permisos de certificados
chmod 644 /etc/pki/tls/certs/*.crt
chmod 600 /etc/pki/tls/private/*.key

# Reemplazar la URL de la API en los archivos JS si se proporciona VITE_API_URL
if [ -n "$VITE_API_URL" ]; then
    echo "Configurando API URL: $VITE_API_URL"
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:8000|$VITE_API_URL|g" {} +
fi

# Ejecutar el comando original (nginx)
exec "$@"