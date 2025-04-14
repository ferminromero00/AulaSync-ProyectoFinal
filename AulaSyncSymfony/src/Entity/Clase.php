<?php

namespace App\Entity;

use App\Repository\ClaseRepository;
use Doctrine\ORM\Mapping as ORM;

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

    // Getters y setters...
}
