<?php

namespace App\Repository;

use App\Entity\Notificacion;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repositorio para la entidad Notificacion.
 * Permite realizar consultas personalizadas sobre las notificaciones.
 *
 * @extends ServiceEntityRepository<Notificacion>
 */
class NotificacionRepository extends ServiceEntityRepository
{
    /**
     * Constructor del repositorio NotificacionRepository.
     *
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notificacion::class);
    }

    public function save(Notificacion $notificacion, bool $flush = false): void
    {
        $this->getEntityManager()->persist($notificacion);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
    // Añade aquí métodos personalizados para consultas sobre notificaciones si es necesario.
}
