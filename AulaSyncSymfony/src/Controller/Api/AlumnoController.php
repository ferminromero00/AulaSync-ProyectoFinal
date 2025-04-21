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
    public function actualizarPerfil(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $alumno = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $form = $this->createForm(ConfiguracionAlumnoType::class, $alumno);
        $form->submit($data);

        if ($form->isValid()) {
            $em->flush();
            return new JsonResponse(['message' => 'Perfil actualizado correctamente']);
        }

        return new JsonResponse(['error' => 'Datos inválidos'], 400);
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

    #[Route('/perfil/foto', name: 'api_alumno_foto_update', methods: ['POST'])]
    public function actualizarFotoPerfil(
        Request $request, 
        EntityManagerInterface $em,
        SluggerInterface $slugger
    ): JsonResponse
    {
        $alumno = $this->getUser();
        $form = $this->createForm(FotoPerfilType::class);
        $form->submit($request->files->all());

        if ($form->isValid()) {
            $fotoFile = $form->get('foto')->getData();
            
            if ($fotoFile) {
                $originalFilename = pathinfo($fotoFile->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFilename = $slugger->slug($originalFilename);
                $newFilename = $safeFilename.'-'.uniqid().'.'.$fotoFile->guessExtension();

                try {
                    $fotoFile->move(
                        $this->getParameter('fotos_perfil_directory'),
                        $newFilename
                    );
                    
                    // Actualizar ruta en la base de datos
                    $alumno->setProfileImage($newFilename);
                    $em->flush();

                    return new JsonResponse([
                        'message' => 'Foto de perfil actualizada correctamente',
                        'fotoPerfilUrl' => '/uploads/fotos_perfil/' . $newFilename
                    ]);
                } catch (FileException $e) {
                    return new JsonResponse(['error' => 'Error al subir el archivo'], 500);
                }
            }
        }

        return new JsonResponse(['error' => 'Archivo inválido'], 400);
    }
}
