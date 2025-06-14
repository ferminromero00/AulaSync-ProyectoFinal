<?php

namespace App\Entity;

use App\Repository\ClaseRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\Alumno;
use App\Entity\Anuncio;

/**
 * Entidad Clase.
 * Representa una clase/grupo en el sistema, con relación a alumnos, profesor y anuncios.
 */
#[ORM\Entity(repositoryClass: ClaseRepository::class)]
class Clase
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nombre = null;

    #[ORM\Column]
    private ?int $numEstudiantes = 0;

    #[ORM\ManyToOne(inversedBy: 'clases')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Profesor $profesor = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $codigoClase = null;

    #[ORM\ManyToMany(targetEntity: Alumno::class, inversedBy: "clases")]
    #[ORM\JoinTable(name: 'clase_alumno')]
    private Collection $alumnos;

    #[ORM\ManyToMany(targetEntity: Alumno::class)]
    #[ORM\JoinTable(name: 'clase_estudiante')] // Renombrado para evitar conflicto
    private Collection $estudiantes;

    #[ORM\OneToMany(mappedBy: 'clase', targetEntity: Anuncio::class, orphanRemoval: true)]
    private Collection $anuncios;

    /**
     * Constructor: inicializa colecciones y genera un código de clase único.
     */
    public function __construct()
    {
        $this->alumnos = new ArrayCollection();
        $this->estudiantes = new ArrayCollection();
        $this->anuncios = new ArrayCollection();
        $this->codigoClase = $this->generarCodigoClase();
    }

    /**
     * Obtiene el ID de la clase.
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene el nombre de la clase.
     * @return string|null
     */
    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    /**
     * Establece el nombre de la clase.
     * @param string $nombre
     * @return self
     */
    public function setNombre(string $nombre): self
    {
        $this->nombre = $nombre;
        return $this;
    }

    /**
     * Obtiene el número de estudiantes.
     * @return int|null
     */
    public function getNumEstudiantes(): ?int
    {
        return $this->numEstudiantes;
    }

    /**
     * Establece el número de estudiantes.
     * @param int $numEstudiantes
     * @return self
     */
    public function setNumEstudiantes(int $numEstudiantes): self
    {
        $this->numEstudiantes = $numEstudiantes;
        return $this;
    }

    /**
     * Actualiza el número de estudiantes según la colección de alumnos.
     * @return self
     */
    public function updateNumEstudiantes(): self
    {
        $this->numEstudiantes = $this->alumnos->count();
        return $this;
    }

    /**
     * Obtiene el profesor de la clase.
     * @return Profesor|null
     */
    public function getProfesor(): ?Profesor
    {
        return $this->profesor;
    }

    /**
     * Establece el profesor de la clase.
     * @param Profesor|null $profesor
     * @return self
     */
    public function setProfesor(?Profesor $profesor): self
    {
        $this->profesor = $profesor;
        return $this;
    }

    /**
     * Obtiene la fecha de creación de la clase.
     * @return \DateTimeInterface|null
     */
    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    /**
     * Establece la fecha de creación de la clase.
     * @param \DateTimeInterface $createdAt
     * @return self
     */
    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    /**
     * Obtiene el código único de la clase.
     * @return string|null
     */
    public function getCodigoClase(): ?string
    {
        return $this->codigoClase;
    }

    /**
     * Establece el código único de la clase.
     * @param string $codigoClase
     * @return self
     */
    public function setCodigoClase(string $codigoClase): self
    {
        $this->codigoClase = $codigoClase;
        return $this;
    }

    /**
     * Obtiene la colección de alumnos de la clase.
     * @return Collection<int, Alumno>
     */
    public function getAlumnos(): Collection
    {
        return $this->alumnos;
    }

    /**
     * Añade un alumno a la clase.
     * @param Alumno $alumno
     * @return self
     */
    public function addAlumno(Alumno $alumno): self
    {
        if (!$this->alumnos->contains($alumno)) {
            $this->alumnos->add($alumno);
            $alumno->addClase($this); // Cambiado de addClass a addClase
            $this->numEstudiantes = $this->alumnos->count();
        }
        return $this;
    }

    /**
     * Elimina un alumno de la clase.
     * @param Alumno $alumno
     * @return self
     */
    public function removeAlumno(Alumno $alumno): self
    {
        if ($this->alumnos->removeElement($alumno)) {
            $alumno->removeClase($this); // Cambiado de removeClass a removeClase
            $this->numEstudiantes = $this->alumnos->count();
        }
        return $this;
    }

    /**
     * Elimina todos los alumnos de la clase.
     * @return self
     */
    public function removeAllAlumnos(): self
    {
        foreach ($this->alumnos as $alumno) {
            $this->removeAlumno($alumno);
        }
        return $this;
    }

    /**
     * Obtiene la colección de estudiantes (relación alternativa).
     * @return Collection<int, Alumno>
     */
    public function getEstudiantes(): Collection
    {
        return $this->estudiantes;
    }

    /**
     * Añade un estudiante a la colección alternativa.
     * @param Alumno $estudiante
     * @return self
     */
    public function addEstudiante(Alumno $estudiante): self
    {
        if (!$this->estudiantes->contains($estudiante)) {
            $this->estudiantes->add($estudiante);
        }

        return $this;
    }

    /**
     * Elimina un estudiante de la colección alternativa.
     * @param Alumno $estudiante
     * @return self
     */
    public function removeEstudiante(Alumno $estudiante): self
    {
        $this->estudiantes->removeElement($estudiante);
        return $this;
    }

    /**
     * Obtiene la colección de anuncios de la clase.
     * @return Collection<int, Anuncio>
     */
    public function getAnuncios(): Collection
    {
        return $this->anuncios;
    }

    /**
     * Añade un anuncio a la clase.
     * @param Anuncio $anuncio
     * @return self
     */
    public function addAnuncio(Anuncio $anuncio): self
    {
        if (!$this->anuncios->contains($anuncio)) {
            $this->anuncios->add($anuncio);
            $anuncio->setClase($this);
        }
        return $this;
    }

    /**
     * Elimina un anuncio de la clase.
     * @param Anuncio $anuncio
     * @return self
     */
    public function removeAnuncio(Anuncio $anuncio): self
    {
        if ($this->anuncios->removeElement($anuncio)) {
            if ($anuncio->getClase() === $this) {
                $anuncio->setClase(null);
            }
        }
        return $this;
    }

    /**
     * Elimina todos los anuncios de la clase.
     * @return self
     */
    public function removeAllAnuncios(): self
    {
        foreach ($this->anuncios as $anuncio) {
            $this->removeAnuncio($anuncio);
        }
        return $this;
    }

    /**
     * Obtiene los anuncios de un tipo específico.
     * @param string $type
     * @return array
     */
    public function getAnunciosByType(string $type): array
    {
        return $this->anuncios
            ->filter(fn($anuncio) => $anuncio->getTipo() === $type)
            ->toArray();
    }

    /**
     * Obtiene las tareas de la clase.
     * @return array
     */
    public function getTareas(): array
    {
        return $this->getAnunciosByType('tarea');
    }

    private function generarCodigoClase(): string
    {
        // Generar un código aleatorio de 6 caracteres alfanuméricos
        $caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $codigo = '';
        for ($i = 0; $i < 6; $i++) {
            $codigo .= $caracteres[rand(0, strlen($caracteres) - 1)];
        }
        return $codigo;
    }
}