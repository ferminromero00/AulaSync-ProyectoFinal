<?php

namespace App\Repository;

use App\Entity\EntregaTarea;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repositorio para la entidad EntregaTarea.
 * Permite realizar consultas personalizadas sobre las entregas de tareas.
 *
 * @extends ServiceEntityRepository<EntregaTarea>
 */
class EntregaTareaRepository extends ServiceEntityRepository
{
    /**
     * Constructor del repositorio EntregaTareaRepository.
     *
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EntregaTarea::class);
    }

    // Añade aquí métodos personalizados para consultas sobre entregas de tareas si es necesario.
}
