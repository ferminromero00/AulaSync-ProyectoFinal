<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\EntregaTareaRepository;

#[ORM\Entity(repositoryClass: EntregaTareaRepository::class)]
class EntregaTarea
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: \App\Entity\Alumno::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\Alumno $alumno = null;

    #[ORM\ManyToOne(targetEntity: \App\Entity\Anuncio::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\Anuncio $tarea = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $archivoUrl = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $comentario = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $fechaEntrega = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $nota = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $comentarioCorreccion = null;

    public function getId(): ?int { return $this->id; }
    public function getAlumno(): ?\App\Entity\Alumno { return $this->alumno; }
    public function setAlumno(?\App\Entity\Alumno $alumno): self { $this->alumno = $alumno; return $this; }
    public function getTarea(): ?\App\Entity\Anuncio { return $this->tarea; }
    public function setTarea(?\App\Entity\Anuncio $tarea): self { $this->tarea = $tarea; return $this; }
    public function getArchivoUrl(): ?string { return $this->archivoUrl; }
    public function setArchivoUrl(?string $archivoUrl): self { $this->archivoUrl = $archivoUrl; return $this; }
    public function getComentario(): ?string { return $this->comentario; }
    public function setComentario(?string $comentario): self { $this->comentario = $comentario; return $this; }
    public function getFechaEntrega(): ?\DateTimeInterface { return $this->fechaEntrega; }
    public function setFechaEntrega(\DateTimeInterface $fechaEntrega): self { $this->fechaEntrega = $fechaEntrega; return $this; }

    public function getNota(): ?float { return $this->nota; }
    public function setNota(?float $nota): self { $this->nota = $nota; return $this; }

    public function getComentarioCorreccion(): ?string { return $this->comentarioCorreccion; }
    public function setComentarioCorreccion(?string $comentarioCorreccion): self { $this->comentarioCorreccion = $comentarioCorreccion; return $this; }
}
