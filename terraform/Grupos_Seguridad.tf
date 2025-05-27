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
  # Regla de entrada para SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso SSH desde cualquier origen"
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso HTTPS desde cualquier origen"
  }

  # Regla de entrada para NFS (EFS)
  ingress {
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso a EFS desde cualquier origen"
  }

  # Comunicación entre nodos
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "-1"
    self        = true
    description = "Comunicación entre nodos"
  }

  # Acceso a la API de Kubernetes (puerto 6443)
  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Acceso API Kubernetes"
  }

  # Metrics Server (puerto 4443)
  ingress {
    from_port   = 4443
    to_port     = 4443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Metrics Server"
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
    "kubernetes.io/cluster/my-cluster" = "owned"
  }
}
