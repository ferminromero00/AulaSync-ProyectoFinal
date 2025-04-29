<?php

namespace App\Controller\Api;

use App\Entity\Anuncio;
use App\Entity\Clase;
use App\Repository\ClaseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class AnuncioController extends AbstractController
{
    #[Route('/api/anuncios/crear', name: 'crear_anuncio', methods: ['POST'])]
    public function crearAnuncio(Request $request, EntityManagerInterface $entityManager, ClaseRepository $claseRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $clase = $claseRepository->find($data['claseId']);
        if (!$clase) {
            return $this->json(['error' => 'Clase no encontrada'], 404);
        }

        $anuncio = new Anuncio();
        $anuncio->setTitulo($data['titulo']);
        $anuncio->setContenido($data['contenido']);
        $anuncio->setTipo($data['tipo']);
        $anuncio->setClase($clase);
        $anuncio->setFechaCreacion(new \DateTime());
        
        if (isset($data['fechaEntrega'])) {
            $anuncio->setFechaEntrega(new \DateTime($data['fechaEntrega']));
        }

        $entityManager->persist($anuncio);
        $entityManager->flush();

        return $this->json([
            'message' => 'Anuncio creado correctamente',
            'id' => $anuncio->getId()
        ]);
    }
}
