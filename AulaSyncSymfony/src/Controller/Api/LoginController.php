<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\Alumno;

#[Route('/api', name: 'api_')]
class LoginController extends AbstractController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(#[CurrentUser] ?Alumno $alumno): JsonResponse
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
}
