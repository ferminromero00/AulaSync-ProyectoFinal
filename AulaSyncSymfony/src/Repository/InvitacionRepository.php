<?php

namespace App\Repository;

use App\Entity\Invitacion;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Invitacion>
 */
class InvitacionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Invitacion::class);
    }

    public function save(Invitacion $invitacion, bool $flush = false): void
    {
        $this->getEntityManager()->persist($invitacion);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Invitacion $invitacion, bool $flush = false): void
    {
        $this->getEntityManager()->remove($invitacion);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
