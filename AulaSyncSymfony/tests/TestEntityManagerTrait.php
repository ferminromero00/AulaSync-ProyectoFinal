<?php

namespace App\Tests;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;

trait TestEntityManagerTrait 
{
    protected function createMockEntityManager(): EntityManagerInterface
    {
        $repository = $this->createMock(EntityRepository::class);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        
        $entityManager->method('getRepository')
            ->willReturn($repository);
            
        return $entityManager;
    }
}
