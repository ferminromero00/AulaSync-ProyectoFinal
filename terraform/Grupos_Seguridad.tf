resource "aws_security_group" "grupo_seguridad_servidor" {
  vpc_id      = aws_vpc.principal.id
  name        = "grupo-seguridad-servidor"
  description = "Grupo de seguridad para servidor web"

  # Regla de entrada para HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso HTTP desde cualquier origen"
  }

 # Regla de entrada para HTTP en puerto 8080
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso HTTP desde cualquier origen en puerto 8080"
  }

  # Regla de entrada para SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso SSH desde cualquier origen"
  }

  # Regla de entrada para HTTP en puerto 8000 (Symfony API)
  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso API Symfony"
  }

  # Regla de salida para todo el trafico
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Permite todo el trafico de salida"
  }

  tags = {
    Name = "GrupoSeguridadServidor"
  }
}

resource "aws_security_group" "grupo_seguridad_eks" {
  vpc_id      = aws_vpc.principal.id
  name        = "grupo-seguridad-eks"
  description = "Grupo de seguridad para EKS"

  # Permitir todo el tráfico entre nodos del cluster
  # Regla de entrada para HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso HTTP desde cualquier origen"
  }

 # Regla de entrada para HTTP en puerto 8080
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso HTTP desde cualquier origen en puerto 8080"
  }

  # Regla de entrada para SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso SSH desde cualquier origen"
  }

  # Regla de entrada para HTTP en puerto 8000 (Symfony API)
  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso API Symfony"
  }

  # Regla de salida para todo el trafico
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Permite todo el trafico de salida"
  }

  tags = {
    Name = "GrupoSeguridadEKS"
  }
}
