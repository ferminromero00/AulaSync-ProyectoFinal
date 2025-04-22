<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Form\FotoPerfilType;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/api/profesor')]
class ProfesorController extends AbstractController
{
    #[Route('/perfil', name: 'api_profesor_perfil_get', methods: ['GET'])]
    public function getPerfil(): JsonResponse
    {
        $profesor = $this->getUser();
        if (!$profesor) {
            return new JsonResponse(['error' => 'No autenticado'], 401);
        }

        try {
            $data = [
                'id' => $profesor->getId(),
                'firstName' => $profesor->getFirstName() ?: '',
                'lastName' => $profesor->getLastName() ?: '',
                'email' => $profesor->getEmail() ?: '',
                'especialidad' => $profesor->getEspecialidad() ?: '',
                'departamento' => $profesor->getDepartamento() ?: '',
                'fotoPerfilUrl' => $profesor->getProfileImage() ?: null,
                'nombre' => ($profesor->getFirstName() . ' ' . $profesor->getLastName()) ?: ''
            ];

            error_log("[ProfesorController] Datos a enviar: " . json_encode($data));

            return new JsonResponse($data, 200, [
                'Content-Type' => 'application/json'
            ]);
        } catch (\Exception $e) {
            error_log("[ProfesorController] Error: " . $e->getMessage());
            return new JsonResponse(
                ['error' => 'Error interno del servidor'], 
                500,
                ['Content-Type' => 'application/json']
            );
        }
    }

    #[Route('/perfil', name: 'api_profesor_perfil_update', methods: ['PUT'])]
    public function actualizarPerfil(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $profesor = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $form = $this->createForm(ConfiguracionProfesorType::class, $profesor);
        $form->submit($data);

        if ($form->isValid()) {
            $em->flush();
            return new JsonResponse(['message' => 'Perfil actualizado correctamente']);
        }

        return new JsonResponse(['error' => 'Datos inválidos'], 400);
    }

    #[Route('/password', name: 'api_profesor_password_update', methods: ['PUT'])]
    public function cambiarPassword(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $profesor = $this->getUser();
        $data = json_decode($request->getContent(), true);

        // Verificar contraseña actual
        if (!$passwordHasher->isPasswordValid($profesor, $data['currentPassword'])) {
            return new JsonResponse(['error' => 'La contraseña actual es incorrecta'], 400);
        }

        // Actualizar contraseña
        $profesor->setPassword(
            $passwordHasher->hashPassword($profesor, $data['newPassword'])
        );

        $em->flush();

        return new JsonResponse(['message' => 'Contraseña actualizada correctamente']);
    }

    #[Route('/perfil/foto', name: 'api_profesor_foto_update', methods: ['POST'])]
    public function actualizarFotoPerfil(
        Request $request, 
        EntityManagerInterface $em,
        SluggerInterface $slugger
    ): JsonResponse
    {
        try {
            $profesor = $this->getUser();
            
            /** @var UploadedFile $uploadedFile */
            $uploadedFile = $request->files->get('foto');
            
            if (!$uploadedFile) {
                return new JsonResponse([
                    'error' => 'No se encontró el archivo',
                    'files' => $request->files->all(),
                    'post' => $request->request->all()
                ], 400);
            }

            // Validar el tipo MIME
            $mimeType = $uploadedFile->getMimeType();
            if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/jpg'])) {
                return new JsonResponse([
                    'error' => 'Tipo de archivo no válido. Solo se permiten imágenes JPG y PNG'
                ], 400);
            }

            $originalFilename = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = $safeFilename.'-'.uniqid().'.'.$uploadedFile->guessExtension();

            try {
                $uploadedFile->move(
                    $this->getParameter('fotos_perfil_directory'),
                    $newFilename
                );
                
                $profesor->setProfileImage($newFilename);
                $em->flush();

                return new JsonResponse([
                    'message' => 'Foto de perfil actualizada correctamente',
                    'fotoPerfilUrl' => '/uploads/fotos_perfil/' . $newFilename
                ]);
            } catch (FileException $e) {
                return new JsonResponse(['error' => 'Error al subir el archivo'], 500);
            }
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
