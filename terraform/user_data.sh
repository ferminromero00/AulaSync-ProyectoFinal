#!/bin/bash

# =========================
# Actualización del sistema
# =========================
sudo yum update -y

# =========================
# Instalación de Apache y PHP
# =========================
sudo yum install -y httpd php git

# =========================
# Configuración y arranque de SSH
# =========================
sudo systemctl restart sshd
sudo systemctl enable sshd

# =========================
# Clonar repositorio del proyecto
# =========================
sudo -u ec2-user git clone https://github.com/ferminromero00/AulaSync-ProyectoFinal.git /home/ec2-user/AulaSync-ProyectoFinal
sudo chown -R ec2-user:ec2-user /home/ec2-user/AulaSync-ProyectoFinal

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
echo "VITE_API_URL=https://aulasync.work.gd" > /tmp/env.production

# =========================
# Actualizar el registro DNS para apuntar al host aulasync.work.gd
# =========================
curl https://api.dnsexit.com/dns/ud/?apikey=I2pljh2r7G5J7ShzFLS9P3ieEVUyyC -d host=aulasync.work.gd


# =========================
# Configuración de Docker Network
# =========================
# Crear red personalizada para la comunicación entre contenedores
docker network create aulasync-net

# =========================
# Despliegue de Servicios
# =========================

# 1. Servidor LDAP
# ---------------
docker run -d --name aulasync-ldap --network aulasync-net \
    -p 389:389 -p 636:636 \
    ferminromero/aulasync-ldap:latest

# Esperar a que el servicio LDAP esté completamente iniciado
sleep 10

# 2. Backend (Symfony)
# -------------------
docker run -d --name aulasync-back --network aulasync-net \
    -p 8000:8000 \
    -e APP_ENV=prod \
    -e APP_DEBUG=1 \
    -e LDAP_HOST=aulasync-ldap \
    -e LDAP_PORT=389 \
    ferminromero/aulasync-back:latest

# 3. Frontend (React)
# -----------------
docker run -d --name aulasync-front --network aulasync-net \
    -p 80:80 -p 443:443 \
    --env-file /tmp/env.production \
    ferminromero/aulasync-front:latest

# Añadir configuración de red
iptables -A INPUT -p tcp --dport 8000 -j ACCEPT  # Backend
iptables -A INPUT -p tcp --dport 80 -j ACCEPT    # Frontend HTTP
iptables -A INPUT -p tcp --dport 443 -j ACCEPT   # Frontend HTTPS
iptables -A INPUT -p tcp --dport 389 -j ACCEPT   # LDAP
iptables -A INPUT -p tcp --dport 636 -j ACCEPT   # LDAPS

# =========================
# Configuración y carga de LDAP (Profesores)
# =========================

# Esperar a que el servicio LDAP esté completamente iniciado
sleep 10

# Copiar los archivos LDIF al contenedor LDAP
docker cp /home/ec2-user/AulaSync-ProyectoFinal/LDAP/ou_profesores.ldif aulasync-ldap:/ou_profesores.ldif
docker cp /home/ec2-user/AulaSync-ProyectoFinal/LDAP/add_profesor.ldif aulasync-ldap:/add_profesor.ldif

# Crear la OU y el profesor dentro del contenedor LDAP
docker exec aulasync-ldap ldapadd -x -D "cn=admin,dc=aulasync,dc=work,dc=gd" -w admin -f /ou_profesores.ldif
docker exec aulasync-ldap ldapadd -x -D "cn=admin,dc=aulasync,dc=work,dc=gd" -w admin -f /add_profesor.ldif