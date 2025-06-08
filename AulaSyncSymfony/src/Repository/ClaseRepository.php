<?php

namespace App\Repository;

use App\Entity\Clase;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repositorio para la entidad Clase.
 * Permite realizar consultas personalizadas sobre las clases.
 *
 * @extends ServiceEntityRepository<Clase>
 */
class ClaseRepository extends ServiceEntityRepository
{
    /**
     * Constructor del repositorio ClaseRepository.
     *
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Clase::class);
    }

    // Añade aquí métodos personalizados para consultas sobre clases si es necesario.
}