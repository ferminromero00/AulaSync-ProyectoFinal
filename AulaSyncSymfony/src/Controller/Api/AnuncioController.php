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
        $anuncio->setContenido($data['contenido']);
        $anuncio->setTipo($data['tipo']);
        $anuncio->setClase($clase);
        $anuncio->setFechaCreacion(new \DateTime());
        $anuncio->setAutor($clase->getProfesor());

        // Campos adicionales para tareas
        if ($data['tipo'] === 'tarea') {
            $anuncio->setTitulo($data['titulo']);
            $anuncio->setFechaEntrega(new \DateTime($data['fechaEntrega']));
            // Aquí iría la lógica para manejar el archivo
            if (isset($data['archivoUrl'])) {
                $anuncio->setArchivoUrl($data['archivoUrl']);
            }
        }

        $entityManager->persist($anuncio);
        $entityManager->flush();

        return $this->json([
            'message' => 'Anuncio creado correctamente',
            'id' => $anuncio->getId()
        ]);
    }

    #[Route('/api/anuncios/{claseId}', name: 'obtener_anuncios', methods: ['GET'])]
    public function obtenerAnuncios(int $claseId, ClaseRepository $claseRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $clase = $claseRepository->find($claseId);
            if (!$clase) {
                return $this->json(['error' => 'Clase no encontrada'], 404);
            }

            $qb = $entityManager->getRepository(Anuncio::class)->createQueryBuilder('a');
            $anuncios = $qb
                ->select('a.id', 'a.contenido', 'a.tipo', 'a.fechaCreacion', 
                         'a.fechaEntrega', 'a.titulo', 'a.archivoUrl',
                         'p.id as autorId', 'p.first_name', 'p.last_name')
                ->leftJoin('a.autor', 'p')
                ->where('a.clase = :clase')
                ->setParameter('clase', $clase)
                ->orderBy('a.fechaCreacion', 'DESC')
                ->getQuery()
                ->getResult();

            $formattedAnuncios = array_map(function($anuncio) {
                return [
                    'id' => $anuncio['id'],
                    'contenido' => $anuncio['contenido'],
                    'tipo' => $anuncio['tipo'],
                    'fechaCreacion' => $anuncio['fechaCreacion']->format('Y-m-d H:i:s'),
                    'fechaEntrega' => $anuncio['fechaEntrega'] ? $anuncio['fechaEntrega']->format('Y-m-d H:i:s') : null,
                    'titulo' => $anuncio['titulo'] ?? null,
                    'archivoUrl' => $anuncio['archivoUrl'] ?? null,
                    'autor' => [
                        'id' => $anuncio['autorId'],
                        'nombre' => trim($anuncio['first_name'] . ' ' . $anuncio['last_name'])
                    ]
                ];
            }, $anuncios);

            return $this->json(['anuncios' => $formattedAnuncios], 200, [], [
                'groups' => ['anuncio']
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al obtener los anuncios',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/api/anuncios/{id}', name: 'eliminar_anuncio', methods: ['DELETE'])]
    public function eliminarAnuncio(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $anuncio = $entityManager->getRepository(Anuncio::class)->find($id);
            
            if (!$anuncio) {
                return $this->json(['error' => 'Anuncio no encontrado'], 404);
            }

            // Solo el profesor de la clase puede eliminar anuncios
            $user = $this->getUser();
            if ($anuncio->getClase()->getProfesor()->getEmail() !== $user->getUserIdentifier()) {
                return $this->json(['error' => 'No tienes permiso para eliminar este anuncio'], 403);
            }

            $entityManager->remove($anuncio);
            $entityManager->flush();

            return $this->json(['message' => 'Anuncio eliminado correctamente']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Error al eliminar el anuncio'], 500);
        }
    }
}
