<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/alumno')]
class AlumnoController extends AbstractController
{
    #[Route('/perfil', name: 'api_alumno_perfil_get', methods: ['GET'])]
    public function getPerfil(): JsonResponse
    {
        $alumno = $this->getUser();

        return new JsonResponse([
            'firstName' => $alumno->getFirstName(),
            'lastName' => $alumno->getLastName(),
            'email' => $alumno->getEmail(),
            'curso' => $alumno->getCurso(),
            'matricula' => $alumno->getMatricula()
        ]);
    }

    #[Route('/perfil', name: 'api_alumno_perfil_update', methods: ['PUT'])]
    public function actualizarPerfil(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $alumno = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $alumno->setFirstName($data['firstName']);
        $alumno->setLastName($data['lastName']);
        $alumno->setEmail($data['email']);
        $alumno->setCurso($data['curso'] ?? null);

        $em->flush();

        return new JsonResponse(['message' => 'Perfil actualizado correctamente']);
    }

    #[Route('/password', name: 'api_alumno_password_update', methods: ['PUT'])]
    public function cambiarPassword(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $alumno = $this->getUser();
        $data = json_decode($request->getContent(), true);

        // Verificar contraseña actual
        if (!$passwordHasher->isPasswordValid($alumno, $data['currentPassword'])) {
            return new JsonResponse(['error' => 'La contraseña actual es incorrecta'], 400);
        }

        // Actualizar contraseña
        $alumno->setPassword(
            $passwordHasher->hashPassword($alumno, $data['newPassword'])
        );

        $em->flush();

        return new JsonResponse(['message' => 'Contraseña actualizada correctamente']);
    }
}
