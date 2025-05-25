<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Alumno;
use PHPUnit\Framework\TestCase;

class AlumnoTest extends TestCase
{
    private $alumno;

    protected function setUp(): void
    {
        $this->alumno = new Alumno();
    }

    public function testGetterAndSetterEmail()
    {
        $this->alumno->setEmail('test@example.com');
        $this->assertEquals('test@example.com', $this->alumno->getEmail());
    }

    public function testGetterAndSetterFirstName()
    {
        $this->alumno->setFirstName('Juan');
        $this->assertEquals('Juan', $this->alumno->getFirstName());
    }

    public function testGetterAndSetterLastName()
    {
        $this->alumno->setLastName('Pérez');
        $this->assertEquals('Pérez', $this->alumno->getLastName());
    }

    public function testDefaultRoles()
    {
        $this->assertEquals(['ROLE_ALUMNO'], $this->alumno->getRoles());
    }
}
