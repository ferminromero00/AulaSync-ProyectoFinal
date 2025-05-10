<?php

namespace App\Repository;

use App\Entity\Notificacion;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class NotificacionRepository extends ServiceEntityRepository
{
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
}
