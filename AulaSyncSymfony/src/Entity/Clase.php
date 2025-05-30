<?php

namespace App\Entity;

use App\Repository\ClaseRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\Alumno;
use App\Entity\Anuncio;

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
    private Collection $estudiantes;

    #[ORM\OneToMany(mappedBy: 'clase', targetEntity: Anuncio::class, orphanRemoval: true)]
    private Collection $anuncios;

    public function __construct()
    {
        $this->alumnos = new ArrayCollection();
        $this->estudiantes = new ArrayCollection();
        $this->anuncios = new ArrayCollection();
        $this->codigoClase = $this->generarCodigoClase();
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

    public function getNumEstudiantes(): ?int
    {
        return $this->numEstudiantes;
    }

    public function setNumEstudiantes(int $numEstudiantes): self
    {
        $this->numEstudiantes = $numEstudiantes;
        return $this;
    }

    public function updateNumEstudiantes(): self
    {
        $this->numEstudiantes = $this->alumnos->count();
        return $this;
    }

    public function getProfesor(): ?Profesor
    {
        return $this->profesor;
    }

    public function setProfesor(?Profesor $profesor): self
    {
        $this->profesor = $profesor;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getCodigoClase(): ?string
    {
        return $this->codigoClase;
    }

    public function setCodigoClase(string $codigoClase): self
    {
        $this->codigoClase = $codigoClase;
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
            $alumno->addClase($this); // Cambiado de addClass a addClase
            $this->numEstudiantes = $this->alumnos->count();
        }
        return $this;
    }

    public function removeAlumno(Alumno $alumno): self
    {
        if ($this->alumnos->removeElement($alumno)) {
            $alumno->removeClase($this); // Cambiado de removeClass a removeClase
            $this->numEstudiantes = $this->alumnos->count();
        }
        return $this;
    }

    public function removeAllAlumnos(): self
    {
        foreach ($this->alumnos as $alumno) {
            $this->removeAlumno($alumno);
        }
        return $this;
    }

    /**
     * @return Collection<int, Alumno>
     */
    public function getEstudiantes(): Collection
    {
        return $this->estudiantes;
    }

    public function addEstudiante(Alumno $estudiante): self
    {
        if (!$this->estudiantes->contains($estudiante)) {
            $this->estudiantes->add($estudiante);
        }

        return $this;
    }

    public function removeEstudiante(Alumno $estudiante): self
    {
        $this->estudiantes->removeElement($estudiante);
        return $this;
    }

    public function getAnuncios(): Collection
    {
        return $this->anuncios;
    }

    public function addAnuncio(Anuncio $anuncio): self
    {
        if (!$this->anuncios->contains($anuncio)) {
            $this->anuncios->add($anuncio);
            $anuncio->setClase($this);
        }
        return $this;
    }

    public function removeAnuncio(Anuncio $anuncio): self
    {
        if ($this->anuncios->removeElement($anuncio)) {
            if ($anuncio->getClase() === $this) {
                $anuncio->setClase(null);
            }
        }
        return $this;
    }

    public function removeAllAnuncios(): self
    {
        foreach ($this->anuncios as $anuncio) {
            $this->removeAnuncio($anuncio);
        }
        return $this;
    }

    public function getAnunciosByType(string $type): array
    {
        return $this->anuncios
            ->filter(fn($anuncio) => $anuncio->getTipo() === $type)
            ->toArray();
    }

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
