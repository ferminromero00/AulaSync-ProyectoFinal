<?php

namespace App\Controller\Api;

use App\Entity\Clase;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class ClaseController extends AbstractController
{
    #[Route('/clases', name: 'clases_crear', methods: ['POST'])]
    public function crearClase(Request $request, EntityManagerInterface $em): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $profesor = $this->getUser();
            
            $clase = new Clase();
            $clase->setNombre($data['nombre'])
                  ->setProfesor($profesor)
                  ->setNumEstudiantes(0)
                  ->setCreatedAt(new \DateTime());

            $em->persist($clase);
            $em->flush();
            
            return new JsonResponse([
                'message' => 'Clase creada correctamente',
                'clase' => [
                    'id' => $clase->getId(),
                    'nombre' => $clase->getNombre(),
                    'numEstudiantes' => $clase->getNumEstudiantes(),
                    'createdAt' => $clase->getCreatedAt()->format('Y-m-d H:i:s')
                ]
            ], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error al crear la clase'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/clases/profesor', name: 'clases_profesor', methods: ['GET', 'OPTIONS'])]
    public function getClasesProfesor(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
        }

        try {
            $profesor = $this->getUser();
            $queryBuilder = $em->createQueryBuilder()
                ->select('c')
                ->from(Clase::class, 'c')
                ->where('c.profesor = :profesor')
                ->setParameter('profesor', $profesor)
                ->orderBy('c.createdAt', 'DESC');

            $clases = $queryBuilder->getQuery()
                ->setHint(\Doctrine\ORM\Query::HINT_FORCE_PARTIAL_LOAD, true)
                ->getResult();

            $clasesArray = array_map(function($clase) {
                return [
                    'id' => $clase->getId(),
                    'nombre' => $clase->getNombre(),
                    'numEstudiantes' => $clase->getNumEstudiantes(),
                    'createdAt' => $clase->getCreatedAt()->format('Y-m-d H:i:s')
                ];
            }, $clases);

            return new JsonResponse($clasesArray);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error al obtener las clases'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
