<?php

namespace App\Tests\Unit\Controller;

use App\Tests\TestEntityManagerTrait;
use PHPUnit\Framework\TestCase;
use App\Controller\Api\AlumnoController;
use App\Service\FileUploader;
use App\Service\DatabaseConnectionService;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Entity\Alumno;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\ContainerInterface;

class AlumnoControllerTest extends TestCase
{
    use TestEntityManagerTrait;

    private $fileUploader;
    private $passwordHasher;
    private $entityManager;
    private $security;
    private $controller;
    private $databaseService;
    private $container;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMockEntityManager();
        $this->databaseService = $this->createMock(DatabaseConnectionService::class);
        $this->fileUploader = $this->createMock(FileUploader::class);
        $this->passwordHasher = $this->createMock(UserPasswordHasherInterface::class);
        $this->security = $this->createMock(Security::class);
        $this->container = $this->createMock(ContainerInterface::class);

        // Mock container para devolver security y entityManager
        $this->container->expects($this->any())
            ->method('get')
            ->willReturnMap([
                ['security.helper', ContainerInterface::EXCEPTION_ON_INVALID_REFERENCE, $this->security],
                ['doctrine.orm.entity_manager', ContainerInterface::EXCEPTION_ON_INVALID_REFERENCE, $this->entityManager]
            ]);

        $this->controller = new AlumnoController(
            $this->entityManager,
            $this->databaseService,
            $this->fileUploader,
            $this->passwordHasher
        );
        $this->controller->setContainer($this->container);

        // Mock comportamiento básico del entityManager
        $this->entityManager->expects($this->any())
            ->method('persist')
            ->willReturnCallback(function($entity) {}); // Callback vacío en lugar de return null
            
        $this->entityManager->expects($this->any())
            ->method('flush')
            ->willReturnCallback(function() {}); // Callback vacío en lugar de return null
    }

    public function testActualizarPerfil()
    {
        // Mock del alumno actual
        $alumno = new Alumno();
        $alumno->setEmail('test@example.com')
              ->setFirstName('Old Name')
              ->setLastName('Old Last');

        $this->security
            ->method('getUser')
            ->willReturn($alumno);

        $request = new Request([], [
            'firstName' => 'Test',
            'lastName' => 'User'
        ]);

        $response = $this->controller->actualizarPerfil($request, $this->entityManager);
        $this->assertEquals(500, $response->getStatusCode());
    }
}
