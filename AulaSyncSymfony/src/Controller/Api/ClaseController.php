<?php

namespace App\Controller\Api;

use App\Entity\Clase;
use App\Entity\Anuncio;
use App\Entity\EntregaTarea;
use App\Entity\Notificacion;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;

/**
 * Controlador para gestionar las operaciones relacionadas con las clases en la API.
 *
 * @package App\Controller\Api
 */
#[Route('/api', name: 'api_')]
class ClaseController extends AbstractController
{
    private $apiLogger;
    private $userActionsLogger;

    public function __construct(
        LoggerInterface $apiLogger,
        LoggerInterface $userActionsLogger
    ) {
        $this->apiLogger = $apiLogger;
        $this->userActionsLogger = $userActionsLogger;
    }

    /**
     * Crea una nueva clase.
     *
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/clases', name: 'clases_crear', methods: ['POST'])]
    public function crearClase(Request $request, EntityManagerInterface $em): JsonResponse
    {
        try {
            $this->apiLogger->debug('Iniciando creación de clase');
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
                    'codigoClase' => $clase->getCodigoClase(),
                    'profesor' => [
                        'nombre' => $profesor->getFirstName() . ' ' . $profesor->getLastName(),
                        'especialidad' => $profesor->getEspecialidad()
                    ]
                ]
            ], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            $this->apiLogger->error('Error al crear clase: ' . $e->getMessage());
            return new JsonResponse(['error' => 'Error al crear la clase'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Devuelve todas las clases del profesor autenticado.
     *
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
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

    /**
     * Devuelve estadísticas de clases y estudiantes del profesor.
     *
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/clases/profesor/stats', name: 'clases_profesor_stats', methods: ['GET'])]
    public function getClasesProfesorStats(EntityManagerInterface $em): JsonResponse
    {
        try {
            $profesor = $this->getUser();
            
            $totalClases = $em->createQueryBuilder()
                ->select('COUNT(c.id)')
                ->from(Clase::class, 'c')
                ->where('c.profesor = :profesor')
                ->setParameter('profesor', $profesor)
                ->getQuery()
                ->getSingleScalarResult();

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

    /**
     * Elimina una clase (solo el profesor propietario puede hacerlo).
     *
     * @param int $id
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
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

            if ($clase->getProfesor() !== $this->getUser()) {
                return new JsonResponse(
                    ['error' => 'No tienes permiso para eliminar esta clase'], 
                    JsonResponse::HTTP_FORBIDDEN
                );
            }

            // 1. Eliminar todas las invitaciones asociadas
            $invitaciones = $em->getRepository(\App\Entity\Invitacion::class)
                ->findBy(['clase' => $clase]);
            foreach ($invitaciones as $invitacion) {
                $em->remove($invitacion);
            }
            $em->flush();

            // 2. Eliminar las relaciones con alumnos
            $clase->removeAllAlumnos();
            $em->flush();

            // 3. Finalmente eliminar la clase
            $em->remove($clase);
            $em->flush();
            
            $this->userActionsLogger->info('Clase eliminada', [
                'id' => $id,
                'usuario' => $this->getUser()->getEmail()
            ]);
            
            return new JsonResponse(['message' => 'Clase eliminada correctamente']);
        } catch (\Exception $e) {
            $this->apiLogger->error('Error al eliminar clase: ' . $e->getMessage());
            return new JsonResponse(
                ['error' => 'Error al eliminar la clase'], 
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Devuelve el detalle de una clase para el profesor.
     *
     * @param int $id
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/clases/{id}', name: 'clase_detalle', methods: ['GET'])]
    public function getClaseDetalle(int $id, EntityManagerInterface $em): JsonResponse
    {
        try {
            // OPTIMIZACIÓN: fetch join para alumnos y profesor
            $qb = $em->createQueryBuilder()
                ->select('c', 'a', 'p')
                ->from(\App\Entity\Clase::class, 'c')
                ->leftJoin('c.alumnos', 'a')
                ->leftJoin('c.profesor', 'p')
                ->where('c.id = :id')
                ->setParameter('id', $id);
            $clase = $qb->getQuery()->getOneOrNullResult();

            if (!$clase) {
                return new JsonResponse(['error' => 'Clase no encontrada'], JsonResponse::HTTP_NOT_FOUND);
            }

            if ($clase->getProfesor() !== $this->getUser()) {
                return new JsonResponse(['error' => 'No tienes permiso para ver esta clase'], JsonResponse::HTTP_FORBIDDEN);
            }

            // Limitar los campos de los estudiantes para respuesta rápida
            $estudiantes = array_map(function($estudiante) {
                return [
                    'id' => $estudiante->getId(),
                    'nombre' => $estudiante->getFirstName() . ' ' . $estudiante->getLastName(),
                    'email' => $estudiante->getEmail(),
                    'fotoPerfilUrl' => $estudiante->getProfileImage() ?? '/uploads/perfiles/default.png'
                ];
            }, $clase->getAlumnos()->toArray());

            // NUEVO: Añadir datos del profesor en la respuesta
            $profesor = $clase->getProfesor();
            $profesorData = $profesor ? [
                'id' => $profesor->getId(),
                'nombre' => $profesor->getFirstName() . ' ' . $profesor->getLastName(),
                'email' => $profesor->getEmail(),
                'especialidad' => $profesor->getEspecialidad(),
                'departamento' => $profesor->getDepartamento()
            ] : null;

            return new JsonResponse([
                'id' => $clase->getId(),
                'nombre' => $clase->getNombre(),
                'codigoClase' => $clase->getCodigoClase(),
                'numEstudiantes' => $clase->getNumEstudiantes(),
                'profesor' => $profesorData,
                'estudiantes' => $estudiantes,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error al obtener los detalles de la clase'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Devuelve el detalle de una clase para el alumno autenticado.
     *
     * @param int $id
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/clases/{id}/alumno', name: 'clase_detalle_alumno', methods: ['GET'])]
    public function getClaseDetalleAlumno(int $id, EntityManagerInterface $em): JsonResponse
    {
        try {
            // OPTIMIZACIÓN: fetch join para alumnos y profesor
            $qb = $em->createQueryBuilder()
                ->select('c', 'a', 'p')
                ->from(\App\Entity\Clase::class, 'c')
                ->leftJoin('c.alumnos', 'a')
                ->leftJoin('c.profesor', 'p')
                ->where('c.id = :id')
                ->setParameter('id', $id);
            $clase = $qb->getQuery()->getOneOrNullResult();

            if (!$clase) {
                return new JsonResponse(['error' => 'Clase no encontrada'], JsonResponse::HTTP_NOT_FOUND);
            }

            $alumno = $this->getUser();

            if (!$clase->getAlumnos()->contains($alumno)) {
                return new JsonResponse(['error' => 'No estás inscrito en esta clase'], JsonResponse::HTTP_FORBIDDEN);
            }

            $estudiantes = $clase->getAlumnos()->map(function ($alumno) {
                return [
                    'id' => $alumno->getId(),
                    'nombre' => $alumno->getFirstName() . ' ' . $alumno->getLastName(),
                    'email' => $alumno->getEmail(),
                    'fotoPerfilUrl' => $alumno->getProfileImage() ?? '/uploads/perfiles/default.png'
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

    /**
     * Busca una clase por código para el alumno.
     *
     * @param string $codigo
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/alumno/clases/buscar/{codigo}', name: 'clase_buscar_alumno', methods: ['GET', 'OPTIONS'])]
    public function buscarClasePorCodigoAlumno(string $codigo, Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Manejar preflight OPTIONS
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse([], 200, [
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
            ]);
        }

        $clase = $em->getRepository(Clase::class)->findOneBy(['codigoClase' => $codigo]);
        if (!$clase) {
            return new JsonResponse(['error' => 'Clase no encontrada'], JsonResponse::HTTP_NOT_FOUND, [
                'Access-Control-Allow-Origin' => '*'
            ]);
        }
        // Cambiar profesor a string
        return new JsonResponse([
            'id' => $clase->getId(),
            'nombre' => $clase->getNombre(),
            'profesor' => $clase->getProfesor()->getFirstName().' '.$clase->getProfesor()->getLastName(),
            'codigoClase' => $clase->getCodigoClase(),
        ], 200, [
            'Access-Control-Allow-Origin' => '*'
        ]);
    }

    /**
     * Permite a un alumno unirse a una clase por código.
     *
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/alumno/clases/unirse', name: 'clase_unirse_alumno', methods: ['POST', 'OPTIONS'])]
    public function unirseAClase(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Manejar preflight OPTIONS
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse([], 200, [
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'POST, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
            ]);
        }

        $data = json_decode($request->getContent(), true);
        if (empty($data['codigo'])) {
            return new JsonResponse(
                ['error' => 'No se proporcionó código'], 
                JsonResponse::HTTP_BAD_REQUEST,
                ['Access-Control-Allow-Origin' => '*']
            );
        }
        
        $clase = $em->getRepository(Clase::class)->findOneBy(['codigoClase' => $data['codigo']]);
        if (!$clase) {
            return new JsonResponse(
                ['error' => 'Clase no encontrada'], 
                JsonResponse::HTTP_NOT_FOUND,
                ['Access-Control-Allow-Origin' => '*']
            );
        }
        
        $alumno = $this->getUser();
        
        if ($clase->getAlumnos()->contains($alumno)) {
            return new JsonResponse(
                ['error' => 'Ya estás inscrito en esta clase'], 
                JsonResponse::HTTP_CONFLICT,
                ['Access-Control-Allow-Origin' => '*']
            );
        }
        
        $clase->addAlumno($alumno);
        $em->flush();
        
        return new JsonResponse(
            [
                'message' => 'Te has unido a la clase correctamente',
                'claseId' => $clase->getId()
            ],
            200,
            ['Access-Control-Allow-Origin' => '*']
        );
    }

    /**
     * Permite a un alumno salir de una clase.
     *
     * @param Clase $clase
     * @param EntityManagerInterface $entityManager
     * @return JsonResponse
     */
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

    /**
     * Devuelve todas las clases del alumno autenticado.
     *
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/clases/alumno', name: 'clases_alumno', methods: ['GET'])]
    public function getClasesAlumno(EntityManagerInterface $em): JsonResponse
    {
        try {
            $alumno = $this->getUser();
            if (!$alumno instanceof \App\Entity\Alumno) {
                return new JsonResponse(['error' => 'No autenticado como alumno'], 401);
            }

            $clases = $alumno->getClases();
            $data = [];

            foreach ($clases as $clase) {
                $profesor = $clase->getProfesor();
                $profesorNombre = $profesor ? $profesor->getFirstName().' '.$profesor->getLastName() : '';
                $data[] = [
                    'id' => $clase->getId(),
                    'nombre' => $clase->getNombre(),
                    'numEstudiantes' => $clase->getNumEstudiantes(),
                    'codigoClase' => $clase->getCodigoClase(),
                    'createdAt' => $clase->getCreatedAt()->format('Y-m-d H:i:s'),
                    'profesor' => $profesorNombre
                ];
            }

            return new JsonResponse($data);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error al obtener las clases'], 500);
        }
    }

    /**
     * Devuelve estadísticas de tareas para el usuario autenticado.
     *
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/tareas/stats', name: 'tareas_stats', methods: ['GET'])]
    public function getTareasStats(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'No autenticado'], 401);
        }

        // Si es profesor, contar tareas de sus clases
        if ($user instanceof \App\Entity\Profesor) {
            $qb = $em->createQueryBuilder()
                ->select('COUNT(a.id)')
                ->from(Anuncio::class, 'a')
                ->join('a.clase', 'c')
                ->where('a.tipo = :tipo')
                ->andWhere('c.profesor = :profesor')
                ->setParameter('tipo', 'tarea')
                ->setParameter('profesor', $user);

            $totalTareas = (int) $qb->getQuery()->getSingleScalarResult();
            return new JsonResponse(['totalTareas' => $totalTareas]);
        }

        // Si es alumno, contar tareas de sus clases inscritas
        if ($user instanceof \App\Entity\Alumno) {
            $qb = $em->createQueryBuilder()
                ->select('COUNT(a.id)')
                ->from(Anuncio::class, 'a')
                ->join('a.clase', 'c')
                ->join('c.alumnos', 'al')
                ->where('a.tipo = :tipo')
                ->andWhere('al = :alumno')
                ->setParameter('tipo', 'tarea')
                ->setParameter('alumno', $user);

            $totalTareas = (int) $qb->getQuery()->getSingleScalarResult();
            return new JsonResponse(['totalTareas' => $totalTareas]);
        }

        return new JsonResponse(['error' => 'Rol no soportado'], 400);
    }

    /**
     * Devuelve todas las tareas del alumno autenticado.
     *
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/tareas/alumno', name: 'tareas_alumno', methods: ['GET'])]
    public function getTareasAlumno(EntityManagerInterface $em): JsonResponse
    {
        try {
            $alumno = $this->getUser();
            if (!$alumno instanceof \App\Entity\Alumno) {
                return new JsonResponse(['error' => 'Usuario no autenticado'], 401);
            }

            $qb = $em->createQueryBuilder();
            $qb->select('a', 'c', 'e')
                ->from(\App\Entity\Anuncio::class, 'a')
                ->join('a.clase', 'c')
                ->join('c.alumnos', 'al')
                ->leftJoin('a.entregas', 'e', 'WITH', 'e.alumno = :alumno')
                ->where('a.tipo = :tipo')
                ->andWhere('al = :alumno')
                ->setParameter('tipo', 'tarea')
                ->setParameter('alumno', $alumno)
                ->orderBy('a.fechaCreacion', 'DESC');

            $tareas = $qb->getQuery()->getResult();

            $result = array_map(function($tarea) use ($alumno) {
                // Filtramos específicamente por el alumno actual
                $entrega = $tarea->getEntregas()->filter(
                    fn($e) => $e->getAlumno()->getId() === $alumno->getId()
                )->first();
                
                return [
                    'id' => $tarea->getId(),
                    'titulo' => $tarea->getTitulo(),
                    'contenido' => $tarea->getContenido(),
                    'fechaEntrega' => $tarea->getFechaEntrega() ? $tarea->getFechaEntrega()->format('Y-m-d H:i:s') : null,
                    'clase' => [
                        'id' => $tarea->getClase()->getId(),
                        'nombre' => $tarea->getClase()->getNombre()
                    ],
                    'archivoUrl' => $tarea->getArchivoUrl(),
                    'entregada' => $entrega ? true : false,
                    'comentarioEntrega' => $entrega ? $entrega->getComentario() : null,
                    'archivoEntregaUrl' => $entrega ? $entrega->getArchivoUrl() : null,
                    'fechaEntregada' => $entrega ? $entrega->getFechaEntrega()?->format('Y-m-d H:i:s') : null,
                    'entregaId' => $entrega ? $entrega->getId() : null,
                    'nota' => $entrega ? $entrega->getNota() : null,
                    'comentarioCorreccion' => $entrega ? $entrega->getComentarioCorreccion() : null
                ];
            }, $tareas);

            return new JsonResponse($result);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error al obtener las tareas: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Permite a un alumno entregar una tarea.
     *
     * @param int $id
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/tareas/{id}/entregar', name: 'tarea_entregar', methods: ['POST'])]
    public function entregarTarea(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $alumno = $this->getUser();
        if (!$alumno instanceof \App\Entity\Alumno) {
            return new JsonResponse(['error' => 'No autenticado como alumno'], 401);
        }

        $tarea = $em->getRepository(\App\Entity\Anuncio::class)->find($id);
        if (!$tarea || $tarea->getTipo() !== 'tarea') {
            return new JsonResponse(['error' => 'Tarea no encontrada'], 404);
        }

        // Comprobar si ya existe una entrega para este alumno y tarea
        $entregaRepo = $em->getRepository(EntregaTarea::class);
        $entrega = $entregaRepo->findOneBy(['alumno' => $alumno, 'tarea' => $tarea]);
        if ($entrega) {
            return new JsonResponse(['error' => 'Ya has entregado esta tarea'], 409);
        }

        $entrega = new EntregaTarea();
        $entrega->setAlumno($alumno);
        $entrega->setTarea($tarea);
        $entrega->setComentario($request->request->get('comentario', ''));
        $entrega->setFechaEntrega(new \DateTime());

        /** @var UploadedFile $archivo */
        $archivo = $request->files->get('archivo');
        if ($archivo) {
            $uploadsDir = $this->getParameter('kernel.project_dir') . '/public/uploads/entregas';
            $nombreArchivo = uniqid() . '-' . $archivo->getClientOriginalName();
            try {
                $archivo->move($uploadsDir, $nombreArchivo);
                $entrega->setArchivoUrl('/uploads/entregas/' . $nombreArchivo);
            } catch (FileException $e) {
                return new JsonResponse(['error' => 'Error al subir el archivo'], 500);
            }
        }

        $em->persist($entrega);
        $em->flush();

        return new JsonResponse(['message' => 'Tarea entregada correctamente']);
    }

    /**
     * Devuelve los datos de una clase por su ID.
     *
     * @param int $id
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/api/clases/{id}', name: 'api_get_clase', methods: ['GET'])]
    public function getClase($id, EntityManagerInterface $em): JsonResponse
    {
        $clase = $em->getRepository(Clase::class)->find($id);

        if (!$clase) {
            return $this->json(['error' => 'Clase no encontrada'], 404);
        }

        // Obtener datos del profesor
        $profesor = $clase->getProfesor();
        $profesorData = $profesor ? [
            'id' => $profesor->getId(),
            'firstName' => $profesor->getFirstName(),
            'lastName' => $profesor->getLastName(),
            'email' => $profesor->getEmail(),
            'especialidad' => $profesor->getEspecialidad(),
            'departamento' => $profesor->getDepartamento(),
        ] : null;

        // Obtener estudiantes
        $estudiantes = [];
        foreach ($clase->getEstudiantes() as $alumno) {
            $estudiantes[] = [
                'id' => $alumno->getId(),
                'nombre' => $alumno->getFirstName() . ' ' . $alumno->getLastName(),
                'email' => $alumno->getEmail(),
                'fotoPerfilUrl' => $alumno->getProfileImage(),
            ];
        }

        return $this->json([
            'id' => $clase->getId(),
            'nombre' => $clase->getNombre(),
            'codigoClase' => $clase->getCodigoClase(),
            'numEstudiantes' => $clase->getNumEstudiantes(),
            'profesor' => $profesorData,
            'estudiantes' => $estudiantes,
        ]);
    }

    /**
     * Obtiene las entregas de una tarea específica
     */
    #[Route('/tareas/{id}/entregas', name: 'api_tarea_entregas', methods: ['GET'])]
    public function getTareaEntregas(int $id, EntityManagerInterface $em): JsonResponse
    {
        try {
            $tarea = $em->getRepository(Anuncio::class)->find($id);
            if (!$tarea) {
                return new JsonResponse(['error' => 'Tarea no encontrada'], 404);
            }

            $entregas = $em->getRepository(EntregaTarea::class)->findBy(['tarea' => $tarea]);
            
            $result = array_map(function($entrega) {
                return [
                    'id' => $entrega->getId(),
                    'alumnoId' => $entrega->getAlumno()->getId(),
                    'alumno' => [
                        'id' => $entrega->getAlumno()->getId(),
                        'nombre' => $entrega->getAlumno()->getFirstName() . ' ' . $entrega->getAlumno()->getLastName()
                    ],
                    'fechaEntrega' => $entrega->getFechaEntrega()?->format('Y-m-d H:i:s'),
                    'comentario' => $entrega->getComentario(),
                    'archivoUrl' => $entrega->getArchivoUrl(),
                    'nota' => $entrega->getNota(),
                    'comentarioCorreccion' => $entrega->getComentarioCorreccion()
                ];
            }, $entregas);

            return new JsonResponse($result);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error al obtener las entregas: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Permite al profesor calificar una entrega.
     *
     * @param int $id
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @return JsonResponse
     */
    #[Route('/entregas/{id}/calificar', name: 'entrega_calificar', methods: ['POST'])]
    public function calificarEntrega(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $entrega = $entityManager->getRepository(EntregaTarea::class)->find($id);
            
            if (!$entrega) {
                return $this->json(['error' => 'Entrega no encontrada'], 404);
            }

            // Verificar que el profesor es el de la clase
            if ($entrega->getTarea()->getClase()->getProfesor() !== $this->getUser()) {
                return $this->json(['error' => 'No tienes permiso para calificar esta entrega'], 403);
            }

            $entrega->setNota($data['nota']);
            $entrega->setComentarioCorreccion($data['comentarioCorreccion'] ?? null);

            // Crear notificación personalizada para el alumno
            $fechaActual = new \DateTime();
            $mensaje = "Ve a ver tu nota!";

            $notificacion = new Notificacion();
            $notificacion->setAlumno($entrega->getAlumno())
                ->setTipo('tarea_calificada')
                ->setContenido($mensaje)
                ->setMensaje($mensaje) // <-- AÑADE ESTA LÍNEA
                ->setDatos([
                    'tareaId' => $entrega->getTarea()->getId(),
                    'claseId' => $entrega->getTarea()->getClase()->getId(),
                    'nota' => $data['nota'],
                    'profesor' => $entrega->getTarea()->getClase()->getProfesor()->getFirstName() . ' ' . 
                                $entrega->getTarea()->getClase()->getProfesor()->getLastName(),
                    'tareaTitulo' => $entrega->getTarea()->getTitulo(),
                    'mensaje_accion' => 'Ve a ver tu nota!',
                    'fechaCalificacion' => $fechaActual->format('d/m/Y, H:i:s')
                ]);

            $entityManager->persist($notificacion);
            $entityManager->persist($entrega);
            $entityManager->flush();

            return $this->json([
                'message' => 'Entrega calificada correctamente',
                'nota' => $entrega->getNota(),
                'comentarioCorreccion' => $entrega->getComentarioCorreccion()
            ]);
        } catch (\Exception $e) {
            $this->apiLogger->error('Error al calificar entrega: ' . $e->getMessage());
            return $this->json(['error' => 'Error al calificar la entrega: ' . $e->getMessage()], 500);
        }
    }

    /**
     * (Privado) Crea una notificación de calificación de tarea.
     *
     * @param EntregaTarea $entrega
     * @return void
     */
    private function crearNotificacionCalificacion(EntregaTarea $entrega): void
    {
        try {
            $notificacion = new Notificacion();
            $notificacion->setAlumno($entrega->getAlumno())
                         ->setTipo('tarea_calificada')
                         ->setContenido("Tu tarea ha sido calificada")
                         ->setReferenciaId($entrega->getTarea()->getId());

            $this->entityManager->persist($notificacion);
            $this->entityManager->flush();
        } catch (\Exception $e) {
            // Log error pero no detener el proceso
            $this->logger->error('Error al crear notificación: ' . $e->getMessage());
        }
    }

    /**
     * Devuelve todas las tareas del profesor autenticado.
     *
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/tareas/profesor', name: 'api_tareas_profesor', methods: ['GET'])]
    public function getTareasProfesor(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user || !$user instanceof \App\Entity\Profesor) {
            return new JsonResponse(['error' => 'No autenticado como profesor'], 401);
        }

        $qb = $em->createQueryBuilder();
        $qb->select('a', 'c', 'e')
            ->from(Anuncio::class, 'a')
            ->join('a.clase', 'c')
            ->leftJoin('a.entregas', 'e')
            ->where('a.tipo = :tipo')
            ->andWhere('c.profesor = :profesor')
            ->setParameter('tipo', 'tarea')
            ->setParameter('profesor', $user)
            ->orderBy('a.fechaCreacion', 'DESC');

        $tareas = $qb->getQuery()->getResult();

        $result = [];
        foreach ($tareas as $tarea) {
            $entregas = [];
            foreach ($tarea->getEntregas() as $entrega) {
                $alumno = $entrega->getAlumno();
                $entregas[] = [
                    'id' => $entrega->getId(),
                    'alumno' => $alumno ? [
                        'id' => $alumno->getId(),
                        'nombre' => method_exists($alumno, 'getNombre') ? $alumno->getNombre() : ($alumno->getFirstName() . ' ' . $alumno->getLastName()),
                        'email' => $alumno->getEmail(),
                    ] : null,
                    'nota' => $entrega->getNota(),
                    'comentarioCorreccion' => $entrega->getComentarioCorreccion(),
                ];
            }
            $result[] = [
                'id' => $tarea->getId(),
                'titulo' => $tarea->getTitulo(),
                'contenido' => $tarea->getContenido(),
                'fechaEntrega' => $tarea->getFechaEntrega() ? $tarea->getFechaEntrega()->format('Y-m-d H:i:s') : null,
                'clase' => [
                    'id' => $tarea->getClase()->getId(),
                    'nombre' => $tarea->getClase()->getNombre(),
                ],
                'numEstudiantes' => $tarea->getClase()->getAlumnos()->count(),
                'entregas' => $entregas,
                'tipo' => $tarea->getTipo(),
            ];
        }

        return new JsonResponse($result);
    }
}
