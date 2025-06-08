<?php

namespace App\Controller\Api;

// Importaciones necesarias para el controlador de login
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\Alumno;
use App\Entity\Profesor;
use Psr\Log\LoggerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Controlador para gestionar la autenticación de usuarios en la API.
 * Maneja los endpoints de login para alumnos y profesores.
 */
#[Route('/api', name: 'api_')]
class LoginController extends AbstractController
{
    // Servicios de logging para la API y acciones de usuario
    private $apiLogger;
    private $userActionsLogger;

    /**
     * Constructor del controlador que inicializa los loggers.
     */
    public function __construct(
        LoggerInterface $apiLogger,
        LoggerInterface $userActionsLogger
    ) {
        $this->apiLogger = $apiLogger;
        $this->userActionsLogger = $userActionsLogger;
    }

    /**
     * Endpoint para el login de alumnos.
     * Verifica credenciales y devuelve token JWT si son válidas.
     */
    #[Route('/alumno/login', name: 'login_alumno', methods: ['POST'])]
    public function loginAlumno(Request $request, UserPasswordHasherInterface $passwordHasher, JWTTokenManagerInterface $jwtManager, EntityManagerInterface $em): JsonResponse
    {
        $this->apiLogger->debug('Intento de login de alumno');

        try {
            $alumno = $this->getUser();
            if (null === $alumno) {
                $this->apiLogger->info('Login API llamada', [
                    'user' => null
                ]);
                return $this->json([
                    'message' => 'Credenciales inválidas',
                ], JsonResponse::HTTP_UNAUTHORIZED);
            }

            $this->apiLogger->info('Login API llamada', [
                'user' => $alumno->getUserIdentifier()
            ]);

            $this->userActionsLogger->info('Usuario logueado correctamente', [
                'user' => $alumno->getUserIdentifier()
            ]);

            $token = $jwtManager->create($alumno);

            // Obtener datos del alumno
            $clases = $em->getRepository(Clase::class)->findClasesByAlumno($alumno);
            $invitaciones = $em->getRepository(Invitacion::class)->findInvitacionesPendientes($alumno);

            return $this->json([
                'token' => $token,
                'user' => [
                    'id' => $alumno->getId(),
                    'email' => $alumno->getEmail(),
                    'firstName' => $alumno->getFirstName(),
                    'lastName' => $alumno->getLastName(),
                    'curso' => $alumno->getCurso(),
                    'matricula' => $alumno->getMatricula(),
                    'profileImage' => $alumno->getProfileImage()
                ],
                'clases' => $clases,
                'invitaciones' => $invitaciones
            ]);
        } catch (\Exception $e) {
            $this->apiLogger->error('Error en login', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Método auxiliar para obtener los datos de las clases de un alumno.
     * @param Alumno $alumno El alumno del que se quieren obtener las clases
     * @param EntityManagerInterface $em El gestor de entidades
     * @return array Array con los datos de las clases
     */
    private function getClasesData(Alumno $alumno, EntityManagerInterface $em): array 
    {
        return array_map(function($clase) {
            return [
                'id' => $clase->getId(),
                'nombre' => $clase->getNombre(),
                'numEstudiantes' => $clase->getNumEstudiantes(),
                'codigoClase' => $clase->getCodigoClase(),
                'createdAt' => $clase->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }, $alumno->getClases()->toArray());
    }

    /**
     * Método auxiliar para obtener las invitaciones pendientes de un alumno.
     * @param Alumno $alumno El alumno del que se quieren obtener las invitaciones
     * @param EntityManagerInterface $em El gestor de entidades
     * @return array Array con los datos de las invitaciones pendientes
     */
    private function getInvitacionesPendientes(Alumno $alumno, EntityManagerInterface $em): array
    {
        $invitaciones = $em->getRepository(Invitacion::class)->findBy([
            'alumno' => $alumno,
            'estado' => 'pendiente'
        ]);
        
        return array_map(function($inv) {
            return [
                'id' => $inv->getId(),
                'clase' => [
                    'id' => $inv->getClase()->getId(),
                    'nombre' => $inv->getClase()->getNombre(),
                    'profesor' => $inv->getClase()->getProfesor()->getFullName()
                ],
                'fecha' => $inv->getFecha()->format('Y-m-d H:i:s')
            ];
        }, $invitaciones);
    }

    /**
     * Endpoint para el login de profesores.
     * Verifica credenciales y devuelve información del profesor si son válidas.
     */
    #[Route('/profesor/login', name: 'login_profesor', methods: ['POST'])]
    public function loginProfesor(#[CurrentUser] ?Profesor $profesor): JsonResponse
    {
        try {
            if (null === $profesor) {
                $this->apiLogger->info('Login API llamada', [
                    'user' => null
                ]);
                return $this->json([
                    'message' => 'Credenciales inválidas',
                ], JsonResponse::HTTP_UNAUTHORIZED);
            }

            $this->apiLogger->info('Login API llamada', [
                'user' => $profesor->getUserIdentifier()
            ]);

            $this->userActionsLogger->info('Usuario logueado correctamente', [
                'user' => $profesor->getUserIdentifier()
            ]);

            return $this->json([
                'user' => $profesor->getUserIdentifier(),
                'roles' => $profesor->getRoles(),
            ]);
        } catch (\Exception $e) {
            $this->apiLogger->error('Error en login', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
