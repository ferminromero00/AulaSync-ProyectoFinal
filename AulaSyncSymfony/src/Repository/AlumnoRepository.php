<?php

namespace App\Repository;

use App\Entity\Alumno;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repositorio para la entidad Alumno.
 * Permite realizar consultas personalizadas sobre los alumnos.
 *
 * @extends ServiceEntityRepository<Alumno>
 */
class AlumnoRepository extends ServiceEntityRepository
{
    /**
     * Constructor del repositorio AlumnoRepository.
     *
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Alumno::class);
    }

    // Añade aquí métodos personalizados para consultas sobre alumnos si es necesario.
}
