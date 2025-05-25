<?php

namespace App\Tests\Integration;

use App\Tests\TestEntityManagerTrait;
use PHPUnit\Framework\TestCase;
use App\Entity\Clase;
use App\Entity\Profesor;

class ClaseWorkflowTest extends TestCase
{
    use TestEntityManagerTrait;

    private $entityManager;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMockEntityManager();
    }

    public function testClaseCompleteWorkflow()
    {
        // Crear profesor
        $profesor = new Profesor();
        $profesor->setEmail('profesor@test.com')
                ->setPassword('password123')
                ->setFirstName('Test')
                ->setLastName('Professor');

        // Mock del repository
        $claseRepository = $this->createMock(\App\Repository\ClaseRepository::class);
        $claseRepository->method('findOneBy')
            ->willReturn(new Clase());

        $this->entityManager->method('getRepository')
            ->with(Clase::class)
            ->willReturn($claseRepository);

        // Test crear clase
        $clase = new Clase();
        $clase->setNombre('Clase Test')
              ->setProfesor($profesor);

        $this->entityManager->expects($this->once())
            ->method('persist')
            ->with($this->isInstanceOf(Clase::class));

        $this->entityManager->expects($this->once())
            ->method('flush');

        $clase = new Clase();
        $clase->setNombre('Clase Test')
              ->setProfesor($profesor);

        // Simula el guardado
        $this->entityManager->persist($clase);
        $this->entityManager->flush();

        // Verificación
        $this->assertSame('Clase Test', $clase->getNombre());
        $this->assertSame($profesor, $clase->getProfesor());
    }
}
