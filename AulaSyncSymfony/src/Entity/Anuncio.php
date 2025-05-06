<?php

namespace App\Entity;

use App\Repository\AnuncioRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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

    #[ORM\Column(length: 255)]
    private ?string $tipo = 'mensaje';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $titulo = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $fechaEntrega = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $archivoUrl = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $fechaCreacion = null;

    #[ORM\ManyToOne(inversedBy: 'anuncios')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Clase $clase = null;

    #[ORM\ManyToOne(targetEntity: Profesor::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Profesor $autor = null;

    #[ORM\OneToMany(mappedBy: 'tarea', targetEntity: EntregaTarea::class, orphanRemoval: true)]
    private Collection $entregas;

    public function __construct()
    {
        $this->entregas = new ArrayCollection();
    }

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

    public function getTitulo(): ?string
    {
        return $this->titulo;
    }

    public function setTitulo(?string $titulo): self
    {
        $this->titulo = $titulo;
        return $this;
    }

    public function getFechaEntrega(): ?\DateTimeInterface
    {
        return $this->fechaEntrega;
    }

    public function setFechaEntrega(?\DateTimeInterface $fechaEntrega): self
    {
        $this->fechaEntrega = $fechaEntrega;
        return $this;
    }

    public function getArchivoUrl(): ?string
    {
        return $this->archivoUrl;
    }

    public function setArchivoUrl(?string $archivoUrl): self
    {
        $this->archivoUrl = $archivoUrl;
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

    public function getEntregas(): Collection
    {
        return $this->entregas;
    }

    public function addEntrega(EntregaTarea $entrega): self
    {
        if (!$this->entregas->contains($entrega)) {
            $this->entregas->add($entrega);
            $entrega->setTarea($this);
        }
        return $this;
    }

    public function removeEntrega(EntregaTarea $entrega): self
    {
        if ($this->entregas->removeElement($entrega)) {
            if ($entrega->getTarea() === $this) {
                $entrega->setTarea(null);
            }
        }
        return $this;
    }
}
