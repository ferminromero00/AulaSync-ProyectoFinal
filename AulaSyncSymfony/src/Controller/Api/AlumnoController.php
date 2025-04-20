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
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    #[Route('/perfil', name: 'api_alumno_perfil_get', methods: ['GET'])]
    public function getPerfil(): JsonResponse
    {
        $alumno = $this->getUser();
        // Log para depuración
        error_log("[AlumnoController] getPerfil usuario: " . ($alumno ? $alumno->getEmail() : 'null'));
        error_log("[AlumnoController] getPerfil datos: " . json_encode([
            'firstName' => $alumno->getFirstName(),
            'lastName' => $alumno->getLastName(),
            'email' => $alumno->getEmail(),
            'curso' => $alumno->getCurso(),
            'matricula' => $alumno->getMatricula(),
            'fotoPerfilUrl' => $alumno->getProfileImage() ?? null
        ]));
        return new JsonResponse([
            'id' => $alumno->getId(), // <-- Añadido el campo id
            'firstName' => $alumno->getFirstName(),
            'lastName' => $alumno->getLastName(),
            'email' => $alumno->getEmail(),
            'curso' => $alumno->getCurso(),
            'matricula' => $alumno->getMatricula(),
            'fotoPerfilUrl' => $alumno->getProfileImage() ?? null // Add null coalescing operator
        ], 200, ['Content-Type' => 'application/json']);
    }

    #[Route('/perfil', name: 'api_alumno_perfil_update', methods: ['PUT'])]
    public function actualizarPerfil(Request $request): JsonResponse
    {
        $alumno = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $alumno->setFirstName($data['firstName']);
        $alumno->setLastName($data['lastName']);
        $alumno->setEmail($data['email']);
        $alumno->setCurso($data['curso'] ?? null);

        $this->em->flush();

        return new JsonResponse(['message' => 'Perfil actualizado correctamente']);
    }

    #[Route('/password', name: 'api_alumno_password_update', methods: ['PUT'])]
    public function cambiarPassword(Request $request, UserPasswordHasherInterface $passwordHasher): JsonResponse
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

        $this->em->flush();

        return new JsonResponse(['message' => 'Contraseña actualizada correctamente']);
    }

    #[Route('/clases', name: 'api_alumno_clases', methods: ['GET'])]
    public function getClases(): JsonResponse
    {
        $alumno = $this->getUser();
        // Supongamos que el alumno tiene método getClases() que devuelve una colección
        $clases = $alumno->getClases()->toArray();

        $clasesArray = array_map(function($clase) {
            return [
                'id' => $clase->getId(),
                'nombre' => $clase->getNombre(),
                'codigoClase' => $clase->getCodigoClase(),
                'numEstudiantes' => $clase->getNumEstudiantes()
                // ...otros datos necesarios...
            ];
        }, $clases);

        return new JsonResponse($clasesArray);
    }
}
