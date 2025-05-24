#!/bin/bash
# Actualizar el sistema
sudo yum update -y

# Instalar Apache y PHP
sudo yum install -y httpd php

# Configurar y reiniciar SSH
sudo systemctl restart sshd
sudo systemctl enable sshd

# Habilitar y arrancar Apache
sudo systemctl enable httpd
sudo systemctl start httpd

# Limpiar el directorio web
sudo rm -rf /var/www/html/*