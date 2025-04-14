<?php
namespace App\Repository;

use App\Entity\Clase;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ClaseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Clase::class);
    }
    
    // Puedes agregar métodos personalizados si los necesitas.
}