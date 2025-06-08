<?php

namespace App\Entity;

use App\Repository\ProfesorRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Doctrine\DBAL\Types\Types;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProfesorRepository::class)]
/**
 * Entidad Profesor.
 * Representa a un profesor del sistema, implementa UserInterface para autenticación.
 */
class Profesor implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    private ?string $plainPassword = null;

    #[ORM\Column(type: 'json')]
    private array $roles = ['ROLE_PROFESOR'];

    #[ORM\Column(length: 255)]
    private ?string $first_name = null;

    #[ORM\Column(length: 255)]
    private ?string $last_name = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updateAt = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $especialidad = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $departamento = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $profileImage = null; // Ruta de la foto de perfil

    #[Assert\File(
        maxSize: '2M',
        mimeTypes: ['image/jpeg', 'image/png'],
        mimeTypesMessage: 'Por favor sube una imagen JPG o PNG válida'
    )]
    public $profilePicture; // Hazlo público o usa getter/setter

    #[ORM\OneToMany(mappedBy: 'profesor', targetEntity: Clase::class)]
    private Collection $clases;

    /**
     * Constructor: inicializa la colección de clases.
     */
    public function __construct()
    {
        $this->clases = new ArrayCollection();
    }

    /**
     * Obtiene el ID del profesor.
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene el email del profesor.
     * @return string|null
     */
    public function getEmail(): ?string
    {
        return $this->email;
    }

    /**
     * Establece el email del profesor.
     * @param string $email
     * @return self
     */
    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    /**
     * Obtiene la contraseña del profesor.
     * @return string|null
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    /**
     * Establece la contraseña del profesor.
     * @param string $password
     * @return self
     */
    public function setPassword(string $password): static
    {
        $this->password = $password;
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
     * @param string|null $plainPassword
     * @return self
     */
    public function setPlainPassword(?string $plainPassword): self
    {
        $this->plainPassword = $plainPassword;
        return $this;
    }

    /**
     * Obtiene los roles del profesor.
     * @return array
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        if (empty($roles)) {
            $roles[] = 'ROLE_PROFESOR';
        }
        return array_unique($roles);
    }

    /**
     * Establece los roles del profesor.
     * @param array $roles
     * @return self
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    /**
     * Obtiene el nombre del profesor.
     * @return string|null
     */
    public function getFirstName(): ?string
    {
        return $this->first_name;
    }

    /**
     * Establece el nombre del profesor.
     * @param string $first_name
     * @return self
     */
    public function setFirstName(string $first_name): static
    {
        $this->first_name = $first_name;
        return $this;
    }

    /**
     * Obtiene los apellidos del profesor.
     * @return string|null
     */
    public function getLastName(): ?string
    {
        return $this->last_name;
    }

    /**
     * Establece los apellidos del profesor.
     * @param string $last_name
     * @return self
     */
    public function setLastName(string $last_name): static
    {
        $this->last_name = $last_name;
        return $this;
    }

    /**
     * Obtiene la fecha de creación del profesor.
     * @return \DateTimeInterface|null
     */
    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    /**
     * Establece la fecha de creación del profesor.
     * @param \DateTimeInterface $createdAt
     * @return self
     */
    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    /**
     * Obtiene la fecha de actualización del profesor.
     * @return \DateTimeInterface|null
     */
    public function getUpdateAt(): ?\DateTimeInterface
    {
        return $this->updateAt;
    }

    /**
     * Establece la fecha de actualización del profesor.
     * @param \DateTimeInterface $updateAt
     * @return self
     */
    public function setUpdateAt(\DateTimeInterface $updateAt): static
    {
        $this->updateAt = $updateAt;
        return $this;
    }

    /**
     * Obtiene la especialidad del profesor.
     * @return string|null
     */
    public function getEspecialidad(): ?string
    {
        return $this->especialidad;
    }

    /**
     * Establece la especialidad del profesor.
     * @param string $especialidad
     * @return self
     */
    public function setEspecialidad(string $especialidad): static
    {
        $this->especialidad = $especialidad;
        return $this;
    }

    /**
     * Obtiene el departamento del profesor.
     * @return string|null
     */
    public function getDepartamento(): ?string
    {
        return $this->departamento;
    }

    /**
     * Establece el departamento del profesor.
     * @param string $departamento
     * @return self
     */
    public function setDepartamento(string $departamento): static
    {
        $this->departamento = $departamento;
        return $this;
    }

    /**
     * Obtiene la URL de la foto de perfil del profesor.
     * @return string|null
     */
    public function getProfileImage(): ?string
    {
        return $this->profileImage;
    }

    /**
     * Establece la URL de la foto de perfil del profesor.
     * @param string|null $profileImage
     * @return self
     */
    public function setProfileImage(?string $profileImage): self
    {
        $this->profileImage = $profileImage;
        return $this;
    }

    /**
     * Elimina credenciales temporales.
     * @return void
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
    }

    /**
     * Obtiene el identificador único del usuario.
     * @return string
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }
}
