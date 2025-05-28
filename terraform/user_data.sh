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

# Instalar kubectl
sudo curl -LO "https://dl.k8s.io/release/v1.31.1/bin/linux/amd64/kubectl"
sudo chmod +x ./kubectl
sudo mkdir -p $HOME/bin && cp ./kubectl $HOME/bin/kubectl && export PATH=$PATH:$HOME/bin

# Instalar eksctl
sudo curl -Lo eksctl_Linux_amd64.tar.gz https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz
sudo tar -xzf eksctl_Linux_amd64.tar.gz -C /tmp && rm eksctl_Linux_amd64.tar.gz
sudo sudo mv /tmp/eksctl /usr/local/bin

# =========================
# Descargar imágenes de backend y frontend
# =========================
docker pull ferminromero/aulasync-back:latest
docker pull ferminromero/aulasync-front:latest

# =========================
# Obtener IP pública de la instancia
# =========================
EC2_IP=$(curl -s https://api.ipify.org)

# =========================
# Configurar variables de entorno
# =========================
echo "VITE_API_URL=http://${EC2_IP}:8000" > /tmp/env.production

# =========================
# Lanzar contenedores con la configuración correcta
# =========================
docker run -d --name aulasync-front -p 80:80 \
    --env-file /tmp/env.production \
    ferminromero/aulasync-front:latest

docker run -d --name aulasync-back -p 8000:8000 \
    -e APP_ENV=prod \
    -e APP_DEBUG=0 \
    -e CORS_ALLOW_ORIGIN="*" \
    ferminromero/aulasync-back:latest

# Limpiar archivo temporal
rm /tmp/env.production

# Añadir configuración de red
iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
