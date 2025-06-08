<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\EntregaTareaRepository;

/**
 * Entidad EntregaTarea.
 * Representa la entrega de una tarea por parte de un alumno.
 */
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

    /**
     * Obtiene el ID de la entrega.
     * @return int|null
     */
    public function getId(): ?int { return $this->id; }

    /**
     * Obtiene el alumno que realizó la entrega.
     * @return \App\Entity\Alumno|null
     */
    public function getAlumno(): ?\App\Entity\Alumno { return $this->alumno; }

    /**
     * Establece el alumno que realizó la entrega.
     * @param \App\Entity\Alumno|null $alumno
     * @return self
     */
    public function setAlumno(?\App\Entity\Alumno $alumno): self { $this->alumno = $alumno; return $this; }

    /**
     * Obtiene la tarea asociada a la entrega.
     * @return \App\Entity\Anuncio|null
     */
    public function getTarea(): ?\App\Entity\Anuncio { return $this->tarea; }

    /**
     * Establece la tarea asociada a la entrega.
     * @param \App\Entity\Anuncio|null $tarea
     * @return self
     */
    public function setTarea(?\App\Entity\Anuncio $tarea): self { $this->tarea = $tarea; return $this; }

    /**
     * Obtiene la URL del archivo entregado.
     * @return string|null
     */
    public function getArchivoUrl(): ?string { return $this->archivoUrl; }

    /**
     * Establece la URL del archivo entregado.
     * @param string|null $archivoUrl
     * @return self
     */
    public function setArchivoUrl(?string $archivoUrl): self { $this->archivoUrl = $archivoUrl; return $this; }

    /**
     * Obtiene el comentario de la entrega.
     * @return string|null
     */
    public function getComentario(): ?string { return $this->comentario; }

    /**
     * Establece el comentario de la entrega.
     * @param string|null $comentario
     * @return self
     */
    public function setComentario(?string $comentario): self { $this->comentario = $comentario; return $this; }

    /**
     * Obtiene la fecha de entrega.
     * @return \DateTimeInterface|null
     */
    public function getFechaEntrega(): ?\DateTimeInterface { return $this->fechaEntrega; }

    /**
     * Establece la fecha de entrega.
     * @param \DateTimeInterface $fechaEntrega
     * @return self
     */
    public function setFechaEntrega(\DateTimeInterface $fechaEntrega): self { $this->fechaEntrega = $fechaEntrega; return $this; }

    /**
     * Obtiene la nota de la entrega.
     * @return float|null
     */
    public function getNota(): ?float { return $this->nota; }

    /**
     * Establece la nota de la entrega.
     * @param float|null $nota
     * @return self
     */
    public function setNota(?float $nota): self { $this->nota = $nota; return $this; }

    /**
     * Obtiene el comentario de corrección.
     * @return string|null
     */
    public function getComentarioCorreccion(): ?string { return $this->comentarioCorreccion; }

    /**
     * Establece el comentario de corrección.
     * @param string|null $comentarioCorreccion
     * @return self
     */
    public function setComentarioCorreccion(?string $comentarioCorreccion): self { $this->comentarioCorreccion = $comentarioCorreccion; return $this; }
}
