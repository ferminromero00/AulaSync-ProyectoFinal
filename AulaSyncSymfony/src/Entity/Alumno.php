<?php

namespace App\Entity;

use App\Repository\AlumnoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use App\Entity\Clase;
use App\Entity\Curso;

/**
 * Entidad Alumno.
 * Representa a un alumno del sistema, implementa UserInterface para autenticación.
 */
#[ORM\Entity(repositoryClass: AlumnoRepository::class)]
class Alumno implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(type: "json")]
    private array $roles = [];

    #[ORM\Column(length: 255)]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    private ?string $lastName = null;

    private ?string $plainPassword = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $created_at = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $update_at = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $curso = null;

    #[ORM\Column(length: 255, unique: true, nullable: true)]
    private ?string $matricula = null; 

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $profileImage = null; // Ruta de la foto de perfil

    #[ORM\ManyToMany(targetEntity: Clase::class, mappedBy: "alumnos")]
    private Collection $clases;

    #[ORM\ManyToMany(targetEntity: Curso::class, inversedBy: "alumnos")]
    private Collection $cursos;

    /**
     * Constructor: inicializa las colecciones de clases y cursos.
     */
    public function __construct()
    {
        $this->clases = new ArrayCollection();
        $this->cursos = new ArrayCollection();
    }

    /**
     * Obtiene el ID del alumno.
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene el email del alumno.
     * @return string|null
     */
    public function getEmail(): ?string
    {
        return $this->email;
    }

    /**
     * Establece el email del alumno.
     * @param string $email
     * @return self
     */
    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    /**
     * Obtiene la contraseña del alumno.
     * @return string|null
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    /**
     * Establece la contraseña del alumno.
     * @param string $password
     * @return self
     */
    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    /**
     * Obtiene los roles del alumno.
     * @return array
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        if (empty($roles)) {
            $roles[] = 'ROLE_ALUMNO';
        }
        return array_unique($roles);
    }

    /**
     * Establece los roles del alumno.
     * @param array $roles
     * @return self
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    /**
     * Obtiene el nombre del alumno.
     * @return string|null
     */
    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    /**
     * Establece el nombre del alumno.
     * @param string $firstName
     * @return self
     */
    public function setFirstName(string $firstName): self
    {
        $this->firstName = $firstName;
        return $this;
    }

    /**
     * Obtiene los apellidos del alumno.
     * @return string|null
     */
    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    /**
     * Establece los apellidos del alumno.
     * @param string $lastName
     * @return self
     */
    public function setLastName(string $lastName): self
    {
        $this->lastName = $lastName;
        return $this;
    }

    /**
     * Obtiene la contraseña en texto plano (no persistida).
     * @return string|null
     */
    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    /**
     * Establece la contraseña en texto plano (no persistida).
     * @param string $plainPassword
     * @return self
     */
    public function setPlainPassword(string $plainPassword): self
    {
        $this->plainPassword = $plainPassword;
        return $this;
    }

    /**
     * Obtiene la fecha de creación del alumno.
     * @return \DateTimeInterface|null
     */
    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->created_at;
    }

    /**
     * Establece la fecha de creación del alumno.
     * @param \DateTimeInterface $created_at
     * @return self
     */
    public function setCreatedAt(\DateTimeInterface $created_at): static
    {
        $this->created_at = $created_at;
        return $this;
    }

    /**
     * Obtiene la fecha de actualización del alumno.
     * @return \DateTimeInterface|null
     */
    public function getUpdateAt(): ?\DateTimeInterface
    {
        return $this->update_at;
    }

    /**
     * Establece la fecha de actualización del alumno.
     * @param \DateTimeInterface $update_at
     * @return self
     */
    public function setUpdateAt(\DateTimeInterface $update_at): static
    {
        $this->update_at = $update_at;
        return $this;
    }

    /**
     * Obtiene el curso del alumno.
     * @return string|null
     */
    public function getCurso(): ?string
    {
        return $this->curso;
    }

    /**
     * Establece el curso del alumno.
     * @param string|null $curso
     * @return self
     */
    public function setCurso(?string $curso): static
    {
        $this->curso = $curso;
        return $this;
    }

    /**
     * Obtiene la matrícula del alumno.
     * @return string|null
     */
    public function getMatricula(): ?string
    {
        return $this->matricula;
    }

    /**
     * Establece la matrícula del alumno.
     * @param string|null $matricula
     * @return self
     */
    public function setMatricula(?string $matricula): static
    {
        $this->matricula = $matricula;
        return $this;
    }

    /**
     * Obtiene la URL de la foto de perfil del alumno.
     * @return string|null
     */
    public function getProfileImage(): ?string
    {
        return $this->profileImage;
    }

    /**
     * Establece la URL de la foto de perfil del alumno.
     * @param string|null $profileImage
     * @return self
     */
    public function setProfileImage(?string $profileImage): self
    {
        $this->profileImage = $profileImage;
        return $this;
    }

    /**
     * Obtiene la colección de cursos del alumno.
     * @return Collection<int, Curso>
     */
    public function getCursos(): Collection
    {
        return $this->cursos;
    }

    /**
     * Añade un curso al alumno.
     * @param Curso $curso
     * @return self
     */
    public function addCurso(Curso $curso): self
    {
        if (!$this->cursos->contains($curso)) {
            $this->cursos->add($curso);
        }
        return $this;
    }

    /**
     * Elimina un curso del alumno.
     * @param Curso $curso
     * @return self
     */
    public function removeCurso(Curso $curso): self
    {
        $this->cursos->removeElement($curso);
        return $this;
    }

    /**
     * Obtiene la colección de clases del alumno.
     * @return Collection<int, Clase>
     */
    public function getClases(): Collection
    {
        return $this->clases ?? new ArrayCollection();
    }

    /**
     * Añade una clase al alumno.
     * @param Clase $clase
     * @return self
     */
    public function addClase(Clase $clase): self 
    {
        if (!$this->clases->contains($clase)) {
            $this->clases->add($clase);
            $clase->addAlumno($this);
        }
        return $this;
    }

    /**
     * Elimina una clase del alumno.
     * @param Clase $clase
     * @return self
     */
    public function removeClase(Clase $clase): self
    {
        if ($this->clases->removeElement($clase)) {
            $clase->removeAlumno($this);
        }
        return $this;
    }

    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }
}
