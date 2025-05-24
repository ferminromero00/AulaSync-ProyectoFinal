# Configuración del proveedor AWS
provider "aws" {
  region = var.region
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
  subnet_id              = data.aws_subnet.default.id
  key_name               = aws_key_pair.ssh_servidor_apache.key_name
  vpc_security_group_ids = [aws_security_group.grupo_seguridad_servidor.id]

  user_data = file("user_data.sh")

  tags = {
    Name = "ServidorWeb"
  }
}

data "aws_subnet" "default" {
  default_for_az = true
  availability_zone = "${var.region}a"
}