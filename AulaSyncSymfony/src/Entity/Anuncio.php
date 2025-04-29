<?php

namespace App\Entity;

use App\Repository\AnuncioRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AnuncioRepository::class)]
class Anuncio
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $contenido = null;

    #[ORM\Column(length: 50)]
    private ?string $tipo = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $fechaCreacion = null;

    #[ORM\ManyToOne(inversedBy: 'anuncios')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Clase $clase = null;

    #[ORM\ManyToOne(targetEntity: Profesor::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Profesor $autor = null;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getTipo(): ?string
    {
        return $this->tipo;
    }

    public function setTipo(string $tipo): self
    {
        $this->tipo = $tipo;
        return $this;
    }

    public function getFechaCreacion(): ?\DateTimeInterface
    {
        return $this->fechaCreacion;
    }

    public function setFechaCreacion(\DateTimeInterface $fechaCreacion): self
    {
        $this->fechaCreacion = $fechaCreacion;
        return $this;
    }

    public function getClase(): ?Clase
    {
        return $this->clase;
    }

    public function setClase(?Clase $clase): self
    {
        $this->clase = $clase;
        return $this;
    }

    public function getAutor(): ?Profesor
    {
        return $this->autor;
    }

    public function setAutor(?Profesor $autor): self
    {
        $this->autor = $autor;
        return $this;
    }
}
