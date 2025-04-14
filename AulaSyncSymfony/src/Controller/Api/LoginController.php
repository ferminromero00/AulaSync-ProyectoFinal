<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\Alumno;
use App\Entity\Profesor;

#[Route('/api', name: 'api_')]
class LoginController extends AbstractController
{
    #[Route('/alumno/login', name: 'login_alumno', methods: ['POST'])]
    public function loginAlumno(#[CurrentUser] ?Alumno $alumno): JsonResponse
    {
        if (null === $alumno) {
            return $this->json([
                'message' => 'Credenciales inválidas',
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'user' => $alumno->getUserIdentifier(),
            'roles' => $alumno->getRoles(),
        ]);
    }

    #[Route('/profesor/login', name: 'login_profesor', methods: ['POST'])]
    public function loginProfesor(#[CurrentUser] ?Profesor $profesor): JsonResponse
    {
        if (null === $profesor) {
            return $this->json([
                'message' => 'Credenciales inválidas',
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'user' => $profesor->getUserIdentifier(),
            'roles' => $profesor->getRoles(),
        ]);
    }
}
