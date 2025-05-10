<?php

namespace App\Entity;

use App\Repository\NotificacionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificacionRepository::class)]
class Notificacion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Alumno $alumno = null;

    #[ORM\Column(length: 255)]
    private ?string $tipo = null;

    #[ORM\Column(length: 255)]
    private ?string $contenido = null;

    #[ORM\Column]
    private ?bool $leida = false;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?int $referenciaId = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->leida = false;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAlumno(): ?Alumno
    {
        return $this->alumno;
    }

    public function setAlumno(?Alumno $alumno): self
    {
        $this->alumno = $alumno;
        return $this;
    }

    public function getTipo(): ?string
    {
        return $this->tipo;
    }

    public function setTipo(string $tipo): self
    {
        $this->tipo = $tipo;
        return $this;
    }

    public function getContenido(): ?string
    {
        return $this->contenido;
    }

    public function setContenido(string $contenido): self
    {
        $this->contenido = $contenido;
        return $this;
    }

    public function isLeida(): ?bool
    {
        return $this->leida;
    }

    public function setLeida(bool $leida): self
    {
        $this->leida = $leida;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getReferenciaId(): ?int
    {
        return $this->referenciaId;
    }

    public function setReferenciaId(?int $referenciaId): self
    {
        $this->referenciaId = $referenciaId;
        return $this;
    }
}
