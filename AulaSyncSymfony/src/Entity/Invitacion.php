<?php

namespace App\Entity;

use App\Repository\InvitacionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InvitacionRepository::class)]
class Invitacion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Alumno::class)]
    private ?Alumno $alumno = null;

    #[ORM\ManyToOne(targetEntity: Clase::class)]
    private ?Clase $clase = null;

    #[ORM\Column(length: 20)]
    private ?string $estado = 'pendiente'; // pendiente, aceptada, rechazada

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $fecha;

    /**
     * Constructor: inicializa la fecha de la invitación.
     */
    public function __construct()
    {
        $this->fecha = new \DateTime();
    }

    /**
     * Obtiene el ID de la invitación.
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene el alumno invitado.
     * @return Alumno|null
     */
    public function getAlumno(): ?Alumno
    {
        return $this->alumno;
    }

    /**
     * Establece el alumno invitado.
     * @param Alumno|null $alumno
     * @return self
     */
    public function setAlumno(?Alumno $alumno): self
    {
        $this->alumno = $alumno;
        return $this;
    }

    /**
     * Obtiene la clase a la que se invita.
     * @return Clase|null
     */
    public function getClase(): ?Clase
    {
        return $this->clase;
    }

    /**
     * Establece la clase a la que se invita.
     * @param Clase|null $clase
     * @return self
     */
    public function setClase(?Clase $clase): self
    {
        $this->clase = $clase;
        return $this;
    }

    /**
     * Obtiene el estado de la invitación.
     * @return string|null
     */
    public function getEstado(): ?string
    {
        return $this->estado;
    }

    /**
     * Establece el estado de la invitación.
     * @param string $estado
     * @return self
     */
    public function setEstado(string $estado): self
    {
        $this->estado = $estado;
        return $this;
    }

    /**
     * Obtiene la fecha de la invitación.
     * @return \DateTimeInterface|null
     */
    public function getFecha(): ?\DateTimeInterface
    {
        return $this->fecha;
    }

    /**
     * Establece la fecha de la invitación.
     * @param \DateTimeInterface $fecha
     * @return self
     */
    public function setFecha(\DateTimeInterface $fecha): self
    {
        $this->fecha = $fecha;
        return $this;
    }
}
