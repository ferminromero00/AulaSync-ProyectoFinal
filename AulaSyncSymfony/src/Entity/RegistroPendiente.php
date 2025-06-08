<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Entidad RegistroPendiente.
 * Representa un registro temporal para la verificación de email/código durante el registro.
 */
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

    /**
     * Obtiene el ID del registro pendiente.
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene el email asociado al registro pendiente.
     * @return string|null
     */
    public function getEmail(): ?string
    {
        return $this->email;
    }

    /**
     * Establece el email asociado al registro pendiente.
     * @param string $email
     * @return self
     */
    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    /**
     * Obtiene el código de verificación.
     * @return string|null
     */
    public function getCodigo(): ?string
    {
        return $this->codigo;
    }

    /**
     * Establece el código de verificación.
     * @param string $codigo
     * @return self
     */
    public function setCodigo(string $codigo): self
    {
        $this->codigo = $codigo;
        return $this;
    }

    /**
     * Obtiene los datos adicionales del registro.
     * @return string|null
     */
    public function getDatos(): ?string
    {
        return $this->datos;
    }

    /**
     * Establece los datos adicionales del registro.
     * @param string $datos
     * @return self
     */
    public function setDatos(string $datos): self
    {
        $this->datos = $datos;
        return $this;
    }

    /**
     * Obtiene la fecha de solicitud del registro.
     * @return \DateTimeInterface|null
     */
    public function getFechaSolicitud(): ?\DateTimeInterface
    {
        return $this->fechaSolicitud;
    }

    /**
     * Establece la fecha de solicitud del registro.
     * @param \DateTimeInterface $fechaSolicitud
     * @return self
     */
    public function setFechaSolicitud(\DateTimeInterface $fechaSolicitud): self
    {
        $this->fechaSolicitud = $fechaSolicitud;
        return $this;
    }
}
