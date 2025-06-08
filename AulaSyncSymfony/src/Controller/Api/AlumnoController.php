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
use App\Service\DatabaseConnectionService;
use App\Service\FileUploader;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Form\ConfiguracionAlumnoType;

/**
 * Controlador para gestionar las operaciones relacionadas con el alumno en la API.
 *
 * @package App\Controller\Api
 */
#[Route('/api/alumno')]
class AlumnoController extends AbstractController
{
    /**
     * El gestor de entidades de Doctrine.
     *
     * @var EntityManagerInterface
     */
    private EntityManagerInterface $em;
    
    /**
     * El servicio de conexión a la base de datos.
     *
     * @var DatabaseConnectionService
     */
    private $databaseService;

    /**
     * Constructor del controlador AlumnoController.
     * 
     * @param EntityManagerInterface $em El gestor de entidades para interactuar con la base de datos.
     * @param DatabaseConnectionService $databaseService Servicio para manejar conexiones a la base de datos.
     */
    public function __construct(EntityManagerInterface $em, DatabaseConnectionService $databaseService)
    {
        $this->em = $em;
        $this->databaseService = $databaseService;
    }

    /**
     * Obtiene el perfil completo del alumno actual.
     * 
     * Recupera toda la información del perfil del alumno, incluyendo sus datos personales
     * y la lista de clases en las que está matriculado.
     * 
     * @return JsonResponse Los datos del perfil del alumno o un mensaje de error.
     * @throws \Exception Si hay un error en la conexión con la base de datos.
     */
    #[Route('/perfil', name: 'api_alumno_perfil_get', methods: ['GET'])]
    public function getPerfil(): JsonResponse
    {
        try {
            $connection = $this->databaseService->getConnection();
            $alumno = $this->getUser();

            // Obtener las clases del alumno
            $clases = [];
            foreach ($alumno->getClases() as $clase) {
                $clases[] = [
                    'id' => $clase->getId(),
                    'nombre' => $clase->getNombre(),
                    'codigoClase' => $clase->getCodigoClase(),
                    'numEstudiantes' => $clase->getNumEstudiantes()
                ];
            }

            $response = new JsonResponse([
                'id' => $alumno->getId(),
                'firstName' => $alumno->getFirstName(),
                'lastName' => $alumno->getLastName(),
                'email' => $alumno->getEmail(),
                'curso' => $alumno->getCurso(),
                'matricula' => $alumno->getMatricula(),
                'fotoPerfilUrl' => $alumno->getProfileImage() ?? '/uploads/perfiles/default.png',
                'clases' => $clases
            ]);

            $this->databaseService->closeConnection();
            return $response;
        } catch (\Exception $e) {
            $this->databaseService->closeConnection();
            return new JsonResponse(['error' => 'Error de conexión'], 500);
        }
    }

    /**
     * Actualiza los datos del perfil del alumno.
     * 
     * Permite modificar la información básica del perfil como nombre, apellidos y email.
     * 
     * @param Request $request La petición HTTP con los datos a actualizar.
     * @param EntityManagerInterface $em El gestor de entidades.
     * 
     * @return JsonResponse Confirmación de la actualización o mensaje de error.
     * @throws \Exception Si hay un error durante la actualización.
     */
    #[Route('/perfil', name: 'api_alumno_perfil_update', methods: ['PUT'])]
    public function actualizarPerfil(Request $request, EntityManagerInterface $em): JsonResponse
    {
        try {
            $alumno = $this->getUser();
            $data = json_decode($request->getContent(), true);

            // Validar datos
            if (!isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email'])) {
                return new JsonResponse(['error' => 'Faltan campos requeridos'], 400);
            }

            // Actualizar datos
            $alumno->setFirstName($data['firstName']);
            $alumno->setLastName($data['lastName']);
            $alumno->setEmail($data['email']);
            $alumno->setUpdateAt(new \DateTime());
            
            $em->persist($alumno);
            $em->flush();

            return new JsonResponse([
                'message' => 'Perfil actualizado correctamente',
                'data' => [
                    'firstName' => $alumno->getFirstName(),
                    'lastName' => $alumno->getLastName(),
                    'email' => $alumno->getEmail()
                ]
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error al actualizar el perfil: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Actualiza la contraseña del alumno.
     * 
     * Verifica la contraseña actual y actualiza a la nueva contraseña si es correcta.
     * 
     * @param Request $request La petición HTTP con las contraseñas.
     * @param UserPasswordHasherInterface $passwordHasher Servicio para encriptar contraseñas.
     * 
     * @return JsonResponse Confirmación del cambio o mensaje de error.
     */
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

    /**
     * Obtiene la lista de clases del alumno.
     * 
     * Recupera todas las clases en las que está matriculado el alumno con sus detalles.
     * 
     * @return JsonResponse Lista de clases con sus detalles.
     */
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

    /**
     * Actualiza la foto de perfil del alumno.
     * 
     * Gestiona la subida de una nueva foto de perfil, elimina la anterior si existe,
     * y actualiza la referencia en la base de datos.
     * 
     * @param Request $request La petición HTTP con la nueva foto.
     * @param EntityManagerInterface $em El gestor de entidades.
     * @param FileUploader $fileUploader Servicio para gestionar la subida de archivos.
     * 
     * @return JsonResponse Confirmación de la actualización o mensaje de error.
     * @throws \Exception Si hay un error durante la subida o procesamiento del archivo.
     */
    #[Route('/perfil/foto', name: 'api_alumno_foto_update', methods: ['POST'])]
    public function actualizarFotoPerfil(Request $request, EntityManagerInterface $em, FileUploader $fileUploader): JsonResponse
    {
        /** @var \App\Entity\Alumno $alumno */
        $alumno = $this->getUser();
        
        /** @var UploadedFile $foto */
        $foto = $request->files->get('foto');
        
        if (!$foto) {
            return new JsonResponse(['error' => 'No se ha subido ninguna foto'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $em->beginTransaction();
            
            // Eliminar foto anterior si existe y no es la default
            $oldProfileImage = $alumno->getProfileImage();
            if ($oldProfileImage && $oldProfileImage !== '/uploads/perfiles/default.png') {
                $oldFilePath = $this->getParameter('fotos_perfil_directory') . '/' . basename($oldProfileImage);
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
            }

            // Subir nueva foto
            $fileName = $fileUploader->upload($foto);
            
            // Actualizar rutas en la base de datos
            $alumno->setProfileImage('/uploads/fotos_perfil/' . $fileName);

            $em->flush();
            $em->commit();

            return new JsonResponse([
                'message' => 'Foto de perfil actualizada correctamente',
                'fotoPerfilUrl' => $alumno->getProfileImage(),
                'success' => true
            ]);
            
        } catch (\Exception $e) {
            if ($em->getConnection()->isTransactionActive()) {
                $em->rollback();
            }
            return new JsonResponse(
                ['error' => $e->getMessage()], 
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}