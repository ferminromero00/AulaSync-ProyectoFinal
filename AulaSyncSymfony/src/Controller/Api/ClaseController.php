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
        $profesor = $this->getUser();
        if (!$profesor || !in_array('ROLE_PROFESOR', $profesor->getRoles())) {
            return new JsonResponse([
                'error' => 'Acceso denegado'
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return new JsonResponse([
                'error' => 'Datos JSON inválidos'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }
        
        $profesor = $this->getUser();
        if (!$profesor) {
            return new JsonResponse([
                'error' => 'Usuario no autenticado'
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        try {
            $clase = new Clase();
            $clase->setNombre($data['nombre']);
            $clase->setProfesor($profesor);
            $clase->setNumEstudiantes(0);
            $clase->setCreatedAt(new \DateTime());

            $em->persist($clase);
            $em->flush();
            
            return new JsonResponse([
                'message' => 'Clase creada correctamente',
                'id' => $clase->getId(),
                'nombre' => $clase->getNombre(),
                'numEstudiantes' => $clase->getNumEstudiantes()
            ], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Error al crear la clase: ' . $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/clases/profesor', name: 'clases_profesor', methods: ['GET'])]
    public function getClasesProfesor(EntityManagerInterface $em): JsonResponse
    {
        $profesor = $this->getUser();
        $clases = $em->getRepository(Clase::class)->findBy(['profesor' => $profesor]);
        
        $clasesArray = array_map(function($clase) {
            return [
                'id' => $clase->getId(),
                'nombre' => $clase->getNombre(),
                'numEstudiantes' => $clase->getNumEstudiantes(),
            ];
        }, $clases);

        return new JsonResponse($clasesArray);
    }
}
