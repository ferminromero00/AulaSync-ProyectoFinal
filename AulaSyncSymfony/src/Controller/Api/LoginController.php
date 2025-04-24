<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\Alumno;
use App\Entity\Profesor;
use Psr\Log\LoggerInterface;

#[Route('/api', name: 'api_')]
class LoginController extends AbstractController
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

    #[Route('/alumno/login', name: 'login_alumno', methods: ['POST'])]
    public function loginAlumno(#[CurrentUser] ?Alumno $alumno, Request $request): JsonResponse
    {
        $this->apiLogger->debug('Intento de login de alumno');

        try {
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

            return $this->json([
                'user' => $alumno->getUserIdentifier(),
                'roles' => $alumno->getRoles(),
            ]);
        } catch (\Exception $e) {
            $this->apiLogger->error('Error en login', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

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
