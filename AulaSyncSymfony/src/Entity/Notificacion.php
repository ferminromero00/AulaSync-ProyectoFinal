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

    #[ORM\ManyToOne(targetEntity: Alumno::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Alumno $alumno = null;

    #[ORM\Column(length: 255)]
    private ?string $tipo = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $contenido = null;

    #[ORM\Column(nullable: true)]
    private ?int $referenciaId = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $datos = null;

    #[ORM\Column(type: 'text')]
    private ?string $mensaje = null;

    /**
     * Constructor: inicializa la fecha de creación de la notificación.
     */
    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    /**
     * Obtiene el ID de la notificación.
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene el alumno destinatario de la notificación.
     * @return Alumno|null
     */
    public function getAlumno(): ?Alumno
    {
        return $this->alumno;
    }

    /**
     * Establece el alumno destinatario de la notificación.
     * @param Alumno|null $alumno
     * @return self
     */
    public function setAlumno(?Alumno $alumno): self
    {
        $this->alumno = $alumno;
        return $this;
    }

    /**
     * Obtiene el tipo de la notificación.
     * @return string|null
     */
    public function getTipo(): ?string
    {
        return $this->tipo;
    }

    /**
     * Establece el tipo de la notificación.
     * @param string $tipo
     * @return self
     */
    public function setTipo(string $tipo): self
    {
        $this->tipo = $tipo;
        return $this;
    }

    /**
     * Obtiene el contenido de la notificación.
     * @return string|null
     */
    public function getContenido(): ?string
    {
        return $this->contenido;
    }

    /**
     * Establece el contenido de la notificación.
     * @param string|null $contenido
     * @return self
     */
    public function setContenido(?string $contenido): self
    {
        $this->contenido = $contenido;
        return $this;
    }

    /**
     * Obtiene el ID de referencia relacionado.
     * @return int|null
     */
    public function getReferenciaId(): ?int
    {
        return $this->referenciaId;
    }

    /**
     * Establece el ID de referencia relacionado.
     * @param int|null $referenciaId
     * @return self
     */
    public function setReferenciaId(?int $referenciaId): self
    {
        $this->referenciaId = $referenciaId;
        return $this;
    }

    /**
     * Obtiene la fecha de creación de la notificación.
     * @return \DateTimeInterface|null
     */
    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    /**
     * Establece la fecha de creación de la notificación.
     * @param \DateTimeInterface $createdAt
     * @return self
     */
    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    /**
     * Obtiene los datos adicionales de la notificación.
     * @return array|null
     */
    public function getDatos(): ?array
    {
        return $this->datos;
    }

    /**
     * Establece los datos adicionales de la notificación.
     * @param array|null $datos
     * @return self
     */
    public function setDatos(?array $datos): self
    {
        $this->datos = $datos;
        return $this;
    }

    /**
     * Obtiene el mensaje de la notificación.
     * @return string|null
     */
    public function getMensaje(): ?string
    {
        return $this->mensaje;
    }

    /**
     * Establece el mensaje de la notificación.
     * @param string $mensaje
     * @return self
     */
    public function setMensaje(string $mensaje): self
    {
        $this->mensaje = $mensaje;
        return $this;
    }
}
