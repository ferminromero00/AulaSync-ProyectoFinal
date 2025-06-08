<?php

namespace App\Repository;

use App\Entity\Anuncio;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repositorio para la entidad Anuncio.
 * Permite realizar consultas personalizadas sobre los anuncios.
 *
 * @extends ServiceEntityRepository<Anuncio>
 */
class AnuncioRepository extends ServiceEntityRepository
{
    /**
     * Constructor del repositorio AnuncioRepository.
     *
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Anuncio::class);
    }

    // Añade aquí métodos personalizados para consultas sobre anuncios si es necesario.
}
