#!/bin/bash

# =========================
# Actualización del sistema
# =========================
sudo yum update -y

# =========================
# Instalación de Apache y PHP
# =========================
sudo yum install -y httpd php

# =========================
# Configuración y arranque de SSH
# =========================
sudo systemctl restart sshd
sudo systemctl enable sshd

# =========================
# (No arrancar Apache para liberar el puerto 80)
# =========================
# sudo systemctl enable httpd
# sudo systemctl start httpd

# =========================
# Limpiar el directorio web
# =========================
sudo rm -rf /var/www/html/*

# =========================
# Instalación de Docker
# =========================
sudo yum install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

# =========================
# Descargar imágenes de backend y frontend
# =========================
docker pull ferminromero/aulasync-back:latest
docker pull ferminromero/aulasync-front:latest

# =========================
# Lanzar contenedores
# =========================
docker run -d --name aulasync-front -p 80:80 ferminromero/aulasync-front:latest
docker run -d --name aulasync-back -p 8000:8000 \
    -e APP_ENV=prod \
    -e APP_DEBUG=0 \
    -e DATABASE_URL="mysql://AulaSync2_finalfolks:f5547bd5ffe59fdcbc00329d618e71adbf376135@yuwvf.h.filess.io:61002/AulaSync2_finalfolks" \
    -e CORS_ALLOW_ORIGIN='*' \
    ferminromero/aulasync-back:latest