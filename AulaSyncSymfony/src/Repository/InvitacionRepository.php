<?php

namespace App\Repository;

use App\Entity\Invitacion;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repositorio para la entidad Invitacion.
 * Permite realizar consultas personalizadas sobre las invitaciones.
 *
 * @extends ServiceEntityRepository<Invitacion>
 */
class InvitacionRepository extends ServiceEntityRepository
{
    /**
     * Constructor del repositorio InvitacionRepository.
     *
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Invitacion::class);
    }

    /**
     * Guarda una invitación en la base de datos.
     *
     * @param Invitacion $invitacion
     * @param bool $flush Si se debe hacer flush inmediatamente
     * @return void
     */
    public function save(Invitacion $invitacion, bool $flush = false): void
    {
        $this->getEntityManager()->persist($invitacion);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Elimina una invitación de la base de datos.
     *
     * @param Invitacion $invitacion
     * @param bool $flush Si se debe hacer flush inmediatamente
     * @return void
     */
    public function remove(Invitacion $invitacion, bool $flush = false): void
    {
        $this->getEntityManager()->remove($invitacion);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
