<?php

namespace App\Repository;

use App\Entity\Profesor;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repositorio para la entidad Profesor.
 * Permite realizar consultas personalizadas sobre los profesores.
 *
 * @extends ServiceEntityRepository<Profesor>
 */
class ProfesorRepository extends ServiceEntityRepository
{
    /**
     * Constructor del repositorio ProfesorRepository.
     *
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Profesor::class);
    }

    // Añade aquí métodos personalizados para consultas sobre profesores si es necesario.
}
