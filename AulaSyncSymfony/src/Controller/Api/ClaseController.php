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
            // El código se genera automáticamente en el constructor

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
                    'codigoClase' => $clase->getCodigoClase(),
                    'profesor' => [
                        'nombre' => $profesor->getFirstName() . ' ' . $profesor->getLastName(),
                        'especialidad' => $profesor->getEspecialidad()
                    ]
                ]
            ], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error al crear la clase: ' . $e->getMessage()], 
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
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
                    'codigoClase' => $clase->getCodigoClase(),
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

    #[Route('/clases/alumno', name: 'clases_alumno', methods: ['GET'])]
    public function getClasesAlumno(EntityManagerInterface $em): JsonResponse
    {
        try {
            /** @var Alumno $alumno */
            $alumno = $this->getUser();
            if (!$alumno) {
                return new JsonResponse(['error' => 'No autenticado'], JsonResponse::HTTP_UNAUTHORIZED);
            }

            // Obtener las clases del alumno
            $clases = $alumno->getClases();
            $clasesArray = [];

            foreach ($clases as $clase) {
                $clasesArray[] = [
                    'id' => $clase->getId(),
                    'nombre' => $clase->getNombre(),
                    'codigoClase' => $clase->getCodigoClase(),
                    'createdAt' => $clase->getCreatedAt()->format('Y-m-d H:i:s'),
                    'profesor' => $clase->getProfesor()->getFirstName() . ' ' . $clase->getProfesor()->getLastName(),
                    'numEstudiantes' => $clase->getNumEstudiantes(),
                ];
            }

            return new JsonResponse($clasesArray);
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Error al obtener las clases: ' . $e->getMessage()], 
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    // --- Todas las rutas con /clases/{id} deben ir después ---
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

            // Verificar que el profesor actual es el propietario de la clase
            if ($clase->getProfesor() !== $this->getUser()) {
                return new JsonResponse(['error' => 'No tienes permiso para ver esta clase'], JsonResponse::HTTP_FORBIDDEN);
            }

            // Transformar la colección de alumnos en un array con sus datos
            $estudiantes = $clase->getAlumnos()->map(function($alumno) {
                return [
                    'id' => $alumno->getId(),
                    'nombre' => $alumno->getFirstName() . ' ' . $alumno->getLastName(),
                    'email' => $alumno->getEmail(),
                    'matricula' => $alumno->getMatricula()
                ];
            })->toArray();

            return new JsonResponse([
                'id' => $clase->getId(),
                'nombre' => $clase->getNombre(),
                'codigoClase' => $clase->getCodigoClase(),
                'numEstudiantes' => $clase->getNumEstudiantes(),
                'createdAt' => $clase->getCreatedAt()->format('Y-m-d H:i:s'),
                'profesor' => [
                    'nombre' => $clase->getProfesor()->getFirstName() . ' ' . $clase->getProfesor()->getLastName(),
                    'especialidad' => $clase->getProfesor()->getEspecialidad()
                ],
                'estudiantes' => $estudiantes
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error al obtener los detalles de la clase'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/clases/buscar/{codigo}', name: 'buscar_clase', methods: ['GET'])]
    public function buscarClasePorCodigo(string $codigo, EntityManagerInterface $em): JsonResponse
    {
        $usuario = $this->getUser();
        if (!$usuario) {
            return new JsonResponse(['error' => 'No autenticado'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        try {
            $clase = $em->getRepository(Clase::class)->findOneBy(['codigoClase' => $codigo]);

            if (!$clase) {
                return new JsonResponse(
                    ['error' => 'Clase no encontrada'], 
                    JsonResponse::HTTP_NOT_FOUND
                );
            }

            return new JsonResponse([
                'nombre' => $clase->getNombre(),
                'profesor' => $clase->getProfesor()->getFirstName() . ' ' . $clase->getProfesor()->getLastName(),
                'codigoClase' => $clase->getCodigoClase()
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Error al buscar la clase'], 
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/clases/unirse/{codigo}', name: 'clase_unirse', methods: ['POST'])]
    public function unirseAClase(string $codigo, EntityManagerInterface $em): JsonResponse
    {
        $alumno = $this->getUser();
        if (!$alumno) {
            return new JsonResponse(['error' => 'No autenticado'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $clase = $em->getRepository(Clase::class)->findOneBy(['codigoClase' => $codigo]);
        if (!$clase) {
            return new JsonResponse(['error' => 'Clase no encontrada'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($clase->getAlumnos()->contains($alumno)) {
            return new JsonResponse(['message' => 'Ya estás inscrito en esta clase'], JsonResponse::HTTP_OK);
        }

        $clase->addAlumno($alumno);
        $clase->setNumEstudiantes($clase->getAlumnos()->count());
        $em->persist($clase);
        $em->flush();

        return new JsonResponse(['message' => 'Te has unido a la clase correctamente']);
    }
}
