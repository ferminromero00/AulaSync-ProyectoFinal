#!/bin/bash
# Actualizar el sistema
sudo yum update -y

# Instalar Apache y PHP
sudo yum install -y httpd php

# Habilitar y arrancar Apache
sudo systemctl enable httpd
sudo systemctl start httpd

# Limpiar el directorio web
sudo rm -rf /var/www/html/*

# Clonar y configurar la aplicación web
cd /var/www/html
sudo dnf install -y git
sudo git clone https://github.com/ferminromero00/EC2-S3-TAREA.git
sudo mv EC2-S3-TAREA/php/* .
sudo rm -r EC2-S3-TAREA/

# Configurar permisos
sudo chown -R apache:apache /var/www/html
sudo chmod -R 755 /var/www/html

#Directorio en el que se ubica la página, cambiarlo
sudo mv Herramientas/* ../

# Cambiar el DocumentRoot a /var/www
sudo sed -i 's|DocumentRoot "/var/www/html"|DocumentRoot "/var/www"|' /etc/httpd/conf/httpd.conf
# Cambiar la sección <Directory> a /var/www
sudo sed -i 's|<Directory "/var/www/html">|<Directory "/var/www">|' /etc/httpd/conf/httpd.conf

# Cambiar el puerto en el que escucha Apache (por ejemplo, al puerto 8080)
sudo sed -i 's|Listen 80|Listen 8080|' /etc/httpd/conf/httpd.conf

#Activamos el redireccionamiento
sudo sed -i 's|AllowOverride None|AllowOverride All|' /etc/httpd/conf/httpd.conf

#Creamos un .htmlaccess y lo rellenamos para que si no encuentra el index.html te redireccione
echo -e "RewriteEngine On\n\
RewriteCond %{REQUEST_URI} ^/$\n\
RewriteCond %{DOCUMENT_ROOT}/index.html !-f\n\
RewriteRule ^$ /temporal.html [R=302,L]" | sudo tee /var/www/.htaccess

# Configurar páginas de error personalizadas
echo -e "ErrorDocument 404 /404.html\n\
ErrorDocument 500 /500.html" | sudo tee -a /var/www/.htaccess


#Hacemos la documentacion de php a traves de docker
cd /var/www/html/php
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

sudo mkdir docs
sudo docker run --rm -v "$(pwd)":/app -w /app phpdoc/phpdoc -d . -t ./docs

# Crear el directorio para el nuevo sitio virtual y agregar un archivo index.html básico

sudo mkdir -p /var/www/prueba321321.com/public && echo "<html><head><title>Bienvenido</title></head><body><h1>Bienvenido a mi sitio virtual</h1></body></html>" | sudo tee /var/www/prueba321321.com/public/index.html
sudo chown -R apache:apache /var/www/prueba321321.com
sudo chmod -R 755 /var/www/prueba321321.com

# Crear un archivo de configuración para el VirtualHost de Apache
echo -e "<VirtualHost *:80>\n\
    ServerName prueba321321.com\n\
    ServerAlias www.prueba321321.com\n\
    DocumentRoot /var/www/prueba321321.com/public\n\
    <Directory /var/www/prueba321321.com/public>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    ErrorLog /var/log/httpd/prueba321321-error.log\n\
    CustomLog /var/log/httpd/prueba321321-access.log combined\n\
</VirtualHost>" | sudo tee /etc/httpd/conf.d/mi-sitio.conf

#Se tendria que cambiar automaticamente pero no encuentro como
# Agregar la IP del servidor al archivo hosts para resolver el dominio localmente
echo "3.83.232.45  prueba321321.com www.prueba321321.com" | sudo tee -a /etc/hosts
# Hacer que sitio virtual escuche por el puerto 80
echo -e "Listen 80" | sudo tee -a /etc/httpd/conf/httpd.conf > /dev/null


# Crear una configuración para habilitar directorios de usuarios
sudo echo -e "<IfModule mod_userdir.c>\n\
    UserDir /var/www/php/*/public_html\n\
    <Directory /var/www/php/*/public_html>\n\
        AllowOverride FileInfo AuthConfig Limit\n\
        Options MultiViews Indexes SymLinksIfOwnerMatch IncludesNoExec\n\
        Require all granted\n\
    </Directory>\n\
</IfModule>" | sudo tee /etc/httpd/conf.d/userdir.conf > /dev/null

# Crear un espacio de usuario para el usuario 'ec2-user'
sudo mkdir -p /var/www/php/ec2-user/public_html

# Cambiar la propiedad del directorio al usuario 'ec2-user', Le damos sus permisos
sudo chown -R ec2-user:ec2-user /var/www/php/ec2-user/public_html

# Establecer permisos para el directorio público del usuario
sudo chmod -R 755 /var/www/php/ec2-user/public_html

#Creacion del html del index del usuario
echo "<html><body><h1>¡Hola desde el espacio de usuario de ec2-user en /var/www/php</h1></body></html>" > /var/www/php/ec2-user/public_html/index.html

#Autentificacion de usuarios

# Habilitar el módulo de autenticación básica de Apache
sudo echo "LoadModule auth_basic_module modules/mod_auth_basic.so" | sudo tee -a /etc/httpd/conf/httpd.conf > /dev/null

# Cambiar la propiedad y permisos del directorio base de usuarios
sudo chown -R apache:apache /var/www/php
sudo chmod -R 755 /var/www/php

# Crear un archivo de contraseñas y agregar el usuario 'ec2-user'
echo "ejemplo1234" | sudo htpasswd -ci /etc/httpd/.htpasswd ec2-user
sudo chmod 644 /etc/httpd/.htpasswd
sudo chown root:root /etc/httpd/.htpasswd

#Creacion del html
echo "<html><body><h1>Página Protegida</h1><p>Si puedes ver esto, te has autenticado correctamente.</p></body></html>" | sudo tee /var/www/php/ec2-user/public_html/index.html

# Crear un archivo .htaccess para proteger el directorio público del usuario con autenticación básica
echo -e "AuthType Basic\nAuthName \"Área Restringida\"\nAuthUserFile /etc/httpd/.htpasswd\nRequire valid-user" | sudo tee /var/www/php/ec2-user/public_html/.htaccess


# Configurar Apache para PHP
echo "AddType application/x-httpd-php .php" | sudo tee /var/www/html/.htaccess
echo "DirectoryIndex index.php index.html" | sudo tee -a /var/www/html/.htaccess

# Reiniciar Apache
sudo systemctl restart httpd