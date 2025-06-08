<?php

namespace App\Entity;

use App\Repository\AnuncioRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Entidad Anuncio.
 * Representa un anuncio o tarea publicado en una clase.
 */
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

    /**
     * Constructor: inicializa la colección de entregas.
     */
    public function __construct()
    {
        $this->entregas = new ArrayCollection();
    }

    /**
     * Obtiene el ID del anuncio.
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene el contenido del anuncio.
     * @return string|null
     */
    public function getContenido(): ?string
    {
        return $this->contenido;
    }

    /**
     * Establece el contenido del anuncio.
     * @param string $contenido
     * @return self
     */
    public function setContenido(string $contenido): self
    {
        $this->contenido = $contenido;
        return $this;
    }

    /**
     * Obtiene el tipo del anuncio.
     * @return string|null
     */
    public function getTipo(): ?string
    {
        return $this->tipo;
    }

    /**
     * Establece el tipo del anuncio.
     * @param string $tipo
     * @return self
     */
    public function setTipo(string $tipo): self
    {
        $this->tipo = $tipo;
        return $this;
    }

    /**
     * Obtiene el título del anuncio.
     * @return string|null
     */
    public function getTitulo(): ?string
    {
        return $this->titulo;
    }

    /**
     * Establece el título del anuncio.
     * @param string|null $titulo
     * @return self
     */
    public function setTitulo(?string $titulo): self
    {
        $this->titulo = $titulo;
        return $this;
    }

    /**
     * Obtiene la fecha de entrega (si es tarea).
     * @return \DateTimeInterface|null
     */
    public function getFechaEntrega(): ?\DateTimeInterface
    {
        return $this->fechaEntrega;
    }

    /**
     * Establece la fecha de entrega (si es tarea).
     * @param \DateTimeInterface|null $fechaEntrega
     * @return self
     */
    public function setFechaEntrega(?\DateTimeInterface $fechaEntrega): self
    {
        $this->fechaEntrega = $fechaEntrega;
        return $this;
    }

    /**
     * Obtiene la URL del archivo adjunto.
     * @return string|null
     */
    public function getArchivoUrl(): ?string
    {
        return $this->archivoUrl;
    }

    /**
     * Establece la URL del archivo adjunto.
     * @param string|null $archivoUrl
     * @return self
     */
    public function setArchivoUrl(?string $archivoUrl): self
    {
        $this->archivoUrl = $archivoUrl;
        return $this;
    }

    /**
     * Obtiene la fecha de creación del anuncio.
     * @return \DateTimeInterface|null
     */
    public function getFechaCreacion(): ?\DateTimeInterface
    {
        return $this->fechaCreacion;
    }

    /**
     * Establece la fecha de creación del anuncio.
     * @param \DateTimeInterface $fechaCreacion
     * @return self
     */
    public function setFechaCreacion(\DateTimeInterface $fechaCreacion): self
    {
        $this->fechaCreacion = $fechaCreacion;
        return $this;
    }

    /**
     * Obtiene la clase asociada al anuncio.
     * @return Clase|null
     */
    public function getClase(): ?Clase
    {
        return $this->clase;
    }

    /**
     * Establece la clase asociada al anuncio.
     * @param Clase|null $clase
     * @return self
     */
    public function setClase(?Clase $clase): self
    {
        $this->clase = $clase;
        return $this;
    }

    /**
     * Obtiene el autor del anuncio.
     * @return Profesor|null
     */
    public function getAutor(): ?Profesor
    {
        return $this->autor;
    }

    /**
     * Establece el autor del anuncio.
     * @param Profesor|null $autor
     * @return self
     */
    public function setAutor(?Profesor $autor): self
    {
        $this->autor = $autor;
        return $this;
    }

    /**
     * Obtiene la colección de entregas asociadas al anuncio.
     * @return Collection<int, EntregaTarea>
     */
    public function getEntregas(): Collection
    {
        return $this->entregas;
    }

    /**
     * Añade una entrega al anuncio.
     * @param EntregaTarea $entrega
     * @return self
     */
    public function addEntrega(EntregaTarea $entrega): self
    {
        if (!$this->entregas->contains($entrega)) {
            $this->entregas->add($entrega);
            $entrega->setTarea($this);
        }
        return $this;
    }

    /**
     * Elimina una entrega del anuncio.
     * @param EntregaTarea $entrega
     * @return self
     */
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
