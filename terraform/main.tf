# Configuración del proveedor AWS
provider "aws" {
  region = var.region
}

# VPC Principal
resource "aws_vpc" "principal" {
  cidr_block = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "VPCPrincipal"
  }
}

# Subred Pública
resource "aws_subnet" "subred_publica" {
  vpc_id                  = aws_vpc.principal.id
  cidr_block              = var.public_subnet_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.region}a"
  tags = {
    Name = "SubredPublica"
  }
}

# Subred Pública 2 (en otra zona de disponibilidad)
resource "aws_subnet" "subred_publica2" {
  vpc_id                  = aws_vpc.principal.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.region}b"
  tags = {
    Name = "SubredPublica2"
  }
}

# Puerta de Enlace a Internet
resource "aws_internet_gateway" "pei" {
  vpc_id = aws_vpc.principal.id
  tags = {
    Name = "PuertaEnlaceInternet"
  }
}

# Tabla de Rutas para la Subred Pública
resource "aws_route_table" "tabla_rutas_publica" {
  vpc_id = aws_vpc.principal.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.pei.id
  }
  tags = {
    Name = "TablaRutasPublica"
  }
}

# Asociación de la Tabla de Rutas con la Subred Publica.
resource "aws_route_table_association" "asociacion_publica" {
  subnet_id      = aws_subnet.subred_publica.id
  route_table_id = aws_route_table.tabla_rutas_publica.id
}

# Asociación de la Tabla de Rutas con la Subred Pública 2
resource "aws_route_table_association" "asociacion_publica2" {
  subnet_id      = aws_subnet.subred_publica2.id
  route_table_id = aws_route_table.tabla_rutas_publica.id
}

# Par de Claves SSH para acceso al servidor
resource "aws_key_pair" "ssh_servidor_apache" {
  key_name   = "apache-server"
  public_key = file("apache-server.key.pub") # Update this path if needed
  tags       = { Name = "apache-server" }
}

# Instancia EC2 para el Servidor Web
resource "aws_instance" "servidor_web" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.subred_publica.id
  key_name               = aws_key_pair.ssh_servidor_apache.key_name
  vpc_security_group_ids = [aws_security_group.grupo_seguridad_servidor.id]

  user_data = file("user_data.sh")

  tags = {
    Name = "ServidorWeb"
  }
}