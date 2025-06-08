<?php

namespace App\Entity;

use App\Repository\CursoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CursoRepository::class)]
class Curso
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nombre = null;

    #[ORM\ManyToMany(targetEntity: Alumno::class, mappedBy: "cursos")]
    private Collection $alumnos;

    /**
     * Constructor: inicializa la colección de alumnos.
     */
    public function __construct()
    {
        $this->alumnos = new ArrayCollection();
    }

    /**
     * Obtiene el ID del curso.
     *
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene el nombre del curso.
     *
     * @return string|null
     */
    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    /**
     * Establece el nombre del curso.
     *
     * @param string $nombre
     * @return self
     */
    public function setNombre(string $nombre): self
    {
        $this->nombre = $nombre;
        return $this;
    }

    /**
     * Obtiene la colección de alumnos inscritos en el curso.
     *
     * @return Collection<int, Alumno>
     */
    public function getAlumnos(): Collection
    {
        return $this->alumnos;
    }

    /**
     * Añade un alumno al curso.
     *
     * @param Alumno $alumno
     * @return self
     */
    public function addAlumno(Alumno $alumno): self
    {
        if (!$this->alumnos->contains($alumno)) {
            $this->alumnos->add($alumno);
            $alumno->addCurso($this);
        }
        return $this;
    }

    /**
     * Elimina un alumno del curso.
     *
     * @param Alumno $alumno
     * @return self
     */
    public function removeAlumno(Alumno $alumno): self
    {
        if ($this->alumnos->removeElement($alumno)) {
            $alumno->removeCurso($this);
        }
        return $this;
    }
}
