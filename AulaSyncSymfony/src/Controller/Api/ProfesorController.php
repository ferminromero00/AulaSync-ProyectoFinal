<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;  // Agregar este import
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Form\FotoPerfilType;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\String\Slugger\SluggerInterface;
use App\Service\FileUploader;
use Symfony\Component\HttpFoundation\File\UploadedFile;

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
        try {
            $profesor = $this->getUser();
            $data = json_decode($request->getContent(), true);
            
            error_log("[ProfesorController] Datos recibidos: " . json_encode($data));

            // Validar datos
            if (!isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email'])) {
                return new JsonResponse(['error' => 'Faltan campos requeridos'], 400);
            }

            // Actualizar datos
            $profesor->setFirstName($data['firstName']);
            $profesor->setLastName($data['lastName']);
            $profesor->setEmail($data['email']);
            
            if (isset($data['especialidad'])) {
                $profesor->setEspecialidad($data['especialidad']);
            }
            if (isset($data['departamento'])) {
                $profesor->setDepartamento($data['departamento']);
            }

            $em->persist($profesor);
            $em->flush();

            return new JsonResponse([
                'success' => true,
                'message' => 'Perfil actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            error_log("[ProfesorController] Error actualizando perfil: " . $e->getMessage());
            return new JsonResponse([
                'success' => false,
                'error' => 'Error al actualizar el perfil'
            ], 500);
        }
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

    #[Route('/perfil/foto', name: 'api_profesor_foto_perfil', methods: ['POST'])]
    public function actualizarFotoPerfil(Request $request, FileUploader $fileUploader, EntityManagerInterface $em): JsonResponse
    {
        /** @var Profesor $profesor */
        $profesor = $this->getUser();
        
        /** @var UploadedFile $foto */
        $foto = $request->files->get('foto');
        
        if (!$foto) {
            return new JsonResponse(['error' => 'No se ha subido ninguna foto'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Eliminar foto anterior si existe
            $oldFilename = $profesor->getFotoPerfilFilename();
            if ($oldFilename && $oldFilename !== 'default.png') {
                $oldFilePath = $this->getParameter('fotos_perfil_directory') . '/' . $oldFilename;
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
            }

            // Subir nueva foto
            $fileName = $fileUploader->upload($foto);
            
            // Actualizar rutas en la base de datos
            $profesor->setFotoPerfilFilename($fileName);
            $profesor->setProfileImage('/uploads/fotos_perfil/' . $fileName); // Cambiar a la ruta correcta

            $em->persist($profesor);
            $em->flush();

            return new JsonResponse([
                'message' => 'Foto de perfil actualizada correctamente',
                'fotoPerfilUrl' => $profesor->getProfileImage()
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => $e->getMessage()], 
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
