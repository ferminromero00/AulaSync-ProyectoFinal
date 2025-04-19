<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class RegistroPendiente
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 180)]
    private ?string $email = null;

    #[ORM\Column(type: "string", length: 6)]
    private ?string $codigo = null;

    #[ORM\Column(type: "text")]
    private ?string $datos = null;

    #[ORM\Column(type: "datetime")]
    private ?\DateTimeInterface $fechaSolicitud = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getCodigo(): ?string
    {
        return $this->codigo;
    }

    public function setCodigo(string $codigo): self
    {
        $this->codigo = $codigo;
        return $this;
    }

    public function getDatos(): ?string
    {
        return $this->datos;
    }

    public function setDatos(string $datos): self
    {
        $this->datos = $datos;
        return $this;
    }

    public function getFechaSolicitud(): ?\DateTimeInterface
    {
        return $this->fechaSolicitud;
    }

    public function setFechaSolicitud(\DateTimeInterface $fechaSolicitud): self
    {
        $this->fechaSolicitud = $fechaSolicitud;
        return $this;
    }
}
