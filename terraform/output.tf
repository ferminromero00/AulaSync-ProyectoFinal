output "vpc_id" {
  description = "ID de la VPC creada"
  value       = aws_vpc.principal.id
}

output "public_subnet_id" {
  description = "ID de la subred pública"
  value       = aws_subnet.subred_publica.id
}

output "instance_public_ip" {
  description = "IP pública de la instancia EC2"
  value       = aws_instance.servidor_web.public_ip
}

output "security_group_id" {
  description = "ID del grupo de seguridad"
  value       = aws_security_group.grupo_seguridad_servidor.id
}