<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Clase;
use App\Entity\Profesor;
use PHPUnit\Framework\TestCase;

class ClaseTest extends TestCase
{
    private $clase;

    protected function setUp(): void
    {
        $this->clase = new Clase();
    }

    public function testGetterAndSetterNombre()
    {
        $this->clase->setNombre('Matemáticas');
        $this->assertEquals('Matemáticas', $this->clase->getNombre());
    }

    public function testGetterAndSetterNumEstudiantes()
    {
        $this->clase->setNumEstudiantes(25);
        $this->assertEquals(25, $this->clase->getNumEstudiantes());
    }

    public function testGetterAndSetterCodigoClase()
    {
        $codigo = 'ABC123';
        $this->clase->setCodigoClase($codigo);
        $this->assertEquals($codigo, $this->clase->getCodigoClase());
    }

    public function testProfesorRelation()
    {
        $profesor = new Profesor();
        $this->clase->setProfesor($profesor);
        $this->assertSame($profesor, $this->clase->getProfesor());
    }
}
