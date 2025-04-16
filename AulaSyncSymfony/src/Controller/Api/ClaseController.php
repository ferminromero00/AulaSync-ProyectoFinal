<?php

namespace App\Controller\Api;

use App\Entity\Clase;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;

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
                    'createdAt' => $clase->getCreatedAt()->format('Y-m-d H:i:s'),
                    'ultimaActividad' => $clase->getCreatedAt()->format('d/m/Y'),
                    'estado' => 'Activa',
                    'codigoClase' => $clase->getCodigoClase(), // <-- Usar el código real de la base de datos
                    'profesor' => [
                        'nombre' => $profesor->getFirstName() . ' ' . $profesor->getLastName(),
                        'especialidad' => $profesor->getEspecialidad()
                    ]
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
            if (!$profesor) {
                return new JsonResponse(['error' => 'Usuario no autenticado'], JsonResponse::HTTP_UNAUTHORIZED);
            }

            $clases = $em->getRepository(Clase::class)->findBy(['profesor' => $profesor]);

            $clasesArray = array_map(function($clase) {
                return [
                    'id' => $clase->getId(),
                    'nombre' => $clase->getNombre(),
                    'numEstudiantes' => $clase->getNumEstudiantes(),
                    'createdAt' => $clase->getCreatedAt()->format('Y-m-d H:i:s'),
                    'ultimaActividad' => $clase->getCreatedAt()->format('d/m/Y'),
                    'estado' => 'Activa',
                    'codigoClase' => $clase->getCodigoClase(),  // Usar el código generado aleatoriamente
                    'profesor' => [
                        'nombre' => $clase->getProfesor()->getFirstName() . ' ' . $clase->getProfesor()->getLastName(),
                        'especialidad' => $clase->getProfesor()->getEspecialidad()
                    ]
                ];
            }, $clases);

            return new JsonResponse($clasesArray);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/clases/profesor/stats', name: 'clases_profesor_stats', methods: ['GET'])]
    public function getClasesProfesorStats(EntityManagerInterface $em): JsonResponse
    {
        try {
            $profesor = $this->getUser();
            
            // Obtener total de clases
            $totalClases = $em->createQueryBuilder()
                ->select('COUNT(c.id)')
                ->from(Clase::class, 'c')
                ->where('c.profesor = :profesor')
                ->setParameter('profesor', $profesor)
                ->getQuery()
                ->getSingleScalarResult();

            // Obtener suma total de estudiantes
            $totalEstudiantes = $em->createQueryBuilder()
                ->select('SUM(c.numEstudiantes)')
                ->from(Clase::class, 'c')
                ->where('c.profesor = :profesor')
                ->setParameter('profesor', $profesor)
                ->getQuery()
                ->getSingleScalarResult();

            return new JsonResponse([
                'totalClases' => (int)$totalClases,
                'totalEstudiantes' => (int)($totalEstudiantes ?? 0)
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Error al obtener estadísticas'], 
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/clases/{id}', name: 'clase_eliminar', methods: ['DELETE'])]
    public function eliminarClase(int $id, EntityManagerInterface $em): JsonResponse
    {
        try {
            $clase = $em->getRepository(Clase::class)->find($id);
            
            if (!$clase) {
                return new JsonResponse(
                    ['error' => 'Clase no encontrada'], 
                    JsonResponse::HTTP_NOT_FOUND
                );
            }

            // Verificar que el profesor actual es el propietario de la clase
            if ($clase->getProfesor() !== $this->getUser()) {
                return new JsonResponse(
                    ['error' => 'No tienes permiso para eliminar esta clase'], 
                    JsonResponse::HTTP_FORBIDDEN
                );
            }

            $em->remove($clase);
            $em->flush();
            
            return new JsonResponse(['message' => 'Clase eliminada correctamente']);
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Error al eliminar la clase'], 
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/clases/{id}', name: 'clase_detalle', methods: ['GET'])]
    public function getClaseDetalle(int $id, EntityManagerInterface $em): JsonResponse
    {
        try {
            $clase = $em->getRepository(Clase::class)->find($id);

            if (!$clase) {
                return new JsonResponse(['error' => 'Clase no encontrada'], JsonResponse::HTTP_NOT_FOUND);
            }

            if ($clase->getProfesor() !== $this->getUser()) {
                return new JsonResponse(['error' => 'No tienes permiso para ver esta clase'], JsonResponse::HTTP_FORBIDDEN);
            }

            $estudiantes = $clase->getAlumnos()->map(function ($alumno) {
                $nombreCompleto = $alumno->getFirstName() . ' ' . $alumno->getLastName();
                return [
                    'id' => $alumno->getId(),
                    'nombre' => strlen($nombreCompleto) > 20 
                        ? substr($nombreCompleto, 0, 17) . '...' 
                        : $nombreCompleto,
                ];
            })->toArray();

            return new JsonResponse([
                'id' => $clase->getId(),
                'nombre' => $clase->getNombre(),
                'codigoClase' => $clase->getCodigoClase(),
                'numEstudiantes' => $clase->getNumEstudiantes(),
                'estudiantes' => $estudiantes,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error al obtener los detalles de la clase'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/clases/{id}/alumno', name: 'clase_detalle_alumno', methods: ['GET'])]
    public function getClaseDetalleAlumno(int $id, EntityManagerInterface $em): JsonResponse
    {
        try {
            $clase = $em->getRepository(Clase::class)->find($id);

            if (!$clase) {
                return new JsonResponse(['error' => 'Clase no encontrada'], JsonResponse::HTTP_NOT_FOUND);
            }

            $alumno = $this->getUser();

            if (!$clase->getAlumnos()->contains($alumno)) {
                return new JsonResponse(['error' => 'No estás inscrito en esta clase'], JsonResponse::HTTP_FORBIDDEN);
            }

            $estudiantes = $clase->getAlumnos()->map(function ($alumno) {
                $nombreCompleto = $alumno->getFirstName() . ' ' . $alumno->getLastName();
                return [
                    'id' => $alumno->getId(),
                    'nombre' => strlen($nombreCompleto) > 20 
                        ? substr($nombreCompleto, 0, 17) . '...' 
                        : $nombreCompleto,
                ];
            })->toArray();

            return new JsonResponse([
                'id' => $clase->getId(),
                'nombre' => $clase->getNombre(),
                'codigoClase' => $clase->getCodigoClase(),
                'numEstudiantes' => $clase->getNumEstudiantes(),
                'estudiantes' => $estudiantes,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error al obtener los detalles de la clase'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/alumno/clases/buscar/{codigo}', name: 'clase_buscar_alumno', methods: ['GET'])]
    public function buscarClasePorCodigoAlumno(string $codigo, EntityManagerInterface $em): JsonResponse
    {
        \Symfony\Component\VarDumper\VarDumper::dump("buscarClasePorCodigoAlumno - Código recibido: " . $codigo); // Log 1
        $clase = $em->getRepository(Clase::class)->findOneBy(['codigoClase' => $codigo]);
        if (!$clase) {
            // Para debug (remover en producción)
            // $clase = new Clase();
            // $clase->setNombre("Clase de prueba");
            // $clase->setCodigoClase($codigo);
            // $clase->setCreatedAt(new \DateTime());
            \Symfony\Component\VarDumper\VarDumper::dump("buscarClasePorCodigoAlumno - Clase no encontrada con código: " . $codigo); // Log 2
            return new JsonResponse(['error' => 'Clase no encontrada'], JsonResponse::HTTP_NOT_FOUND);
        }
        // Si se desea, se pueden incluir otros detalles
        \Symfony\Component\VarDumper\VarDumper::dump("buscarClasePorCodigoAlumno - Clase encontrada: " . $clase->getNombre()); // Log 3
        return new JsonResponse([
            'id' => $clase->getId(),
            'nombre' => $clase->getNombre(),
            'profesor' => $clase->getProfesor()->getFirstName().' '.$clase->getProfesor()->getLastName(),
            'codigoClase' => $clase->getCodigoClase(),
        ]);
    }

    #[Route('/alumno/clases/unirse', name: 'clase_unirse_alumno', methods: ['POST'])]
    public function unirseAClase(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        \Symfony\Component\VarDumper\VarDumper::dump("unirseAClase - Datos recibidos: " . json_encode($data)); // Log 1
        if (empty($data['codigo'])) {
            \Symfony\Component\VarDumper\VarDumper::dump("unirseAClase - No se proporcionó código"); // Log 2
            return new JsonResponse(['error' => 'No se proporcionó código'], JsonResponse::HTTP_BAD_REQUEST);
        }
        
        $clase = $em->getRepository(Clase::class)->findOneBy(['codigoClase' => $data['codigo']]);
        if (!$clase) {
            \Symfony\Component\VarDumper\VarDumper::dump("unirseAClase - Clase no encontrada con código: " . $data['codigo']); // Log 3
            return new JsonResponse(['error' => 'Clase no encontrada'], JsonResponse::HTTP_NOT_FOUND);
        }
        
        $alumno = $this->getUser();
        
        if ($clase->getAlumnos()->contains($alumno)) {
            return new JsonResponse(['error' => 'Ya estás inscrito en esta clase'], JsonResponse::HTTP_CONFLICT);
        }
        
        $clase->addAlumno($alumno);
        $em->flush();
        
        return new JsonResponse([
            'message' => 'Te has unido a la clase correctamente',
            'claseId' => $clase->getId()
        ]);
    }

    #[Route('/alumno/clases/{id}/salir', name: 'clase_salir_alumno', methods: ['POST'])]
    public function salirDeClase(
        #[MapEntity] Clase $clase,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            if (!$clase) {
                return new JsonResponse(
                    ['error' => 'Clase no encontrada'],
                    JsonResponse::HTTP_NOT_FOUND
                );
            }

            $alumno = $this->getUser();
            
            if (!$clase->getAlumnos()->contains($alumno)) {
                return new JsonResponse(
                    ['error' => 'No estás inscrito en esta clase'],
                    JsonResponse::HTTP_BAD_REQUEST
                );
            }

            $clase->removeAlumno($alumno);
            $entityManager->flush();

            return new JsonResponse([
                'message' => 'Has salido de la clase correctamente'
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Error al salir de la clase: ' . $e->getMessage()],
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
