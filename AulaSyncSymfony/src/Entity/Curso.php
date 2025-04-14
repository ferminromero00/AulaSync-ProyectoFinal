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

    public function __construct()
    {
        $this->alumnos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): self
    {
        $this->nombre = $nombre;
        return $this;
    }

    public function getAlumnos(): Collection
    {
        return $this->alumnos;
    }

    public function addAlumno(Alumno $alumno): self
    {
        if (!$this->alumnos->contains($alumno)) {
            $this->alumnos->add($alumno);
            $alumno->addCurso($this);
        }
        return $this;
    }

    public function removeAlumno(Alumno $alumno): self
    {
        if ($this->alumnos->removeElement($alumno)) {
            $alumno->removeCurso($this);
        }
        return $this;
    }
}
