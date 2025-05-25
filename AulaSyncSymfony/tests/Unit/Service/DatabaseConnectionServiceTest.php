<?php

namespace App\Tests\Unit\Service;

use App\Service\DatabaseConnectionService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class DatabaseConnectionServiceTest extends TestCase
{
    private $entityManager;
    private $logger;
    private $service;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $this->service = new DatabaseConnectionService($this->entityManager, $this->logger);
    }

    public function testGetEntityManager()
    {
        $this->assertSame($this->entityManager, $this->service->getEntityManager());
    }

    public function testLogError()
    {
        $error = "Test error message";
        
        $this->logger->expects($this->once())
            ->method('error')
            ->with($error);
            
        $this->service->logError($error);
    }
}
