<?php

namespace App\Tests\Unit\Controller;

use App\Tests\TestEntityManagerTrait;
use PHPUnit\Framework\TestCase;
use App\Controller\Api\ProfesorController;
use App\Entity\Profesor;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ProfesorControllerTest extends TestCase
{
    use TestEntityManagerTrait;

    private $entityManager;
    private $security;
    private $controller;
    private $container;

    protected function setUp(): void
    {
        $this->security = $this->createMock(Security::class);
        $this->entityManager = $this->createMockEntityManager();
        $this->container = $this->createMock(ContainerInterface::class);

        $this->container->expects($this->any())
            ->method('get')
            ->willReturnMap([
                ['security.helper', ContainerInterface::EXCEPTION_ON_INVALID_REFERENCE, $this->security],
                ['doctrine.orm.entity_manager', ContainerInterface::EXCEPTION_ON_INVALID_REFERENCE, $this->entityManager]
            ]);

        $this->controller = new ProfesorController();
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
        // Mock del profesor actual
        $profesor = new Profesor();
        $profesor->setEmail('profesor@test.com')
                ->setFirstName('Old Name')
                ->setLastName('Old Last');

        $this->security
            ->method('getUser')
            ->willReturn($profesor);

        $request = new Request([], [
            'firstName' => 'Test',
            'lastName' => 'User'
        ]);

        $response = $this->controller->actualizarPerfil($request, $this->entityManager);
        $this->assertEquals(500, $response->getStatusCode());
    }
}
