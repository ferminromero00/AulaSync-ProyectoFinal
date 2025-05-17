<?php

namespace App\Controller\Api;

use App\Entity\Alumno;
use App\Entity\Profesor;
use App\Form\AlumnoRegistroType;
use App\Form\ProfesorRegistroType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use App\Entity\RegistroPendiente;

#[Route('/api', name: 'api_')]
class RegistroController extends AbstractController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    #[Route('/registro/iniciar', name: 'registro_iniciar', methods: ['POST'])]
    public function iniciarRegistro(Request $request, EntityManagerInterface $em, MailerInterface $mailer): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = isset($data['email']) ? trim(strtolower($data['email'])) : null;

        // Validar email y que no exista ya
        if (!$email || $em->getRepository(Alumno::class)->findOneBy(['email' => $email]) || $em->getRepository(Profesor::class)->findOneBy(['email' => $email])) {
            return new JsonResponse(['error' => 'Email inválido o ya registrado'], 400);
        }

        // Eliminar registros pendientes previos para ese email
        $repoPendiente = $em->getRepository(RegistroPendiente::class);
        $pendientesPrevios = $repoPendiente->findBy(['email' => $email]);
        foreach ($pendientesPrevios as $pendiente) {
            $em->remove($pendiente);
        }
        $em->flush();

        // Generar código y guardar datos en RegistroPendiente
        $codigo = random_int(100000, 999999);
        $registro = new RegistroPendiente();
        $registro->setEmail($email);
        $registro->setDatos(json_encode($data));
        $registro->setCodigo($codigo);
        $registro->setFechaSolicitud(new \DateTime());
        $em->persist($registro);
        $em->flush();

        // Enviar email
        $emailObj = (new Email())
            ->from('no-reply@aulasync.com')
            ->to($email)
            ->subject('Código de verificación AulaSync')
            ->text("Tu código de verificación es: $codigo");
        $mailer->send($emailObj);

        return new JsonResponse(['message' => 'Código enviado al email']);
    }

    #[Route('/registro/verificar', name: 'registro_verificar', methods: ['POST'])]
    public function verificarRegistro(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        error_log('DEBUG: Datos recibidos en verificarRegistro: ' . json_encode($data));
        $email = isset($data['email']) ? trim(strtolower($data['email'])) : null;
        $codigo = $data['codigo'] ?? null;

        $this->logger->debug('Datos recibidos para verificación', [
            'email' => $email,
            'codigo' => $codigo,
        ]);

        if (!$email || !$codigo) {
            error_log('DEBUG: Falta email o código');
            return new JsonResponse(['error' => 'Email o código faltante'], 400);
        }

        $registro = $em->getRepository(RegistroPendiente::class)->findOneBy(['email' => $email, 'codigo' => $codigo]);
        if (!$registro) {
            error_log('DEBUG: No se encontró registro pendiente para email/código');
            return new JsonResponse(['error' => 'Código incorrecto o expirado'], 400);
        }

        $datos = json_decode($registro->getDatos(), true);
        error_log('DEBUG: Datos del registro recuperados: ' . json_encode($datos));
        if (!$datos) {
            error_log('DEBUG: Datos del registro no válidos');
            return new JsonResponse(['error' => 'Datos del registro no válidos'], 400);
        }

        $isAlumno = ($datos['role'] ?? 'alumno') === 'alumno';
        error_log('DEBUG: isAlumno=' . ($isAlumno ? 'true' : 'false'));

        unset($datos['role']);
        error_log('DEBUG: Datos enviados al formulario: ' . json_encode($datos));

        if ($isAlumno) {
            $alumno = new Alumno();
            $form = $this->createForm(AlumnoRegistroType::class, $alumno);
            
            // Ajustar los datos para usar plainPassword en lugar de password
            $formData = [
                'email' => $datos['email'],
                'plainPassword' => $datos['password'], // Aquí hacemos la conversión
                'firstName' => $datos['firstName'],
                'lastName' => $datos['lastName']
            ];
            
            $form->submit($formData);

            if (!$form->isValid()) {
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                error_log('DEBUG: Errores de formulario alumno: ' . json_encode($errors));
                return new JsonResponse(['error' => $errors], 400);
            }

            $alumno->setRoles(['ROLE_ALUMNO']);
            $alumno->setPassword($passwordHasher->hashPassword($alumno, $datos['password']));
            $alumno->setCreatedAt(new \DateTime());
            $alumno->setUpdateAt(new \DateTime());
            $matricula = 'ALU' . date('Y') . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $alumno->setMatricula($matricula);
            $alumno->setProfileImage('/uploads/perfiles/default.png'); // Ruta relativa accesible desde el frontend

            try {
                $em->persist($alumno);
                $em->remove($registro);
                $em->flush();

                return new JsonResponse(['message' => 'Alumno registrado correctamente'], 200);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Error al registrar el alumno: ' . $e->getMessage()], 500);
            }
        } else {
            $profesor = new Profesor();
            $form = $this->createForm(ProfesorRegistroType::class, $profesor);
            
            // Ajustar los datos para usar plainPassword en lugar de password
            $formData = [
                'email' => $datos['email'],
                'plainPassword' => $datos['password'],
                'firstName' => $datos['firstName'],
                'lastName' => $datos['lastName']
            ];
            
            error_log('DEBUG: Datos enviados al formulario: ' . json_encode($formData));
            
            $form->submit($formData);

            if (!$form->isValid()) {
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                error_log('DEBUG: Errores de formulario profesor: ' . json_encode($errors));
                return new JsonResponse(['error' => $errors], 400);
            }

            $profesor->setRoles(['ROLE_PROFESOR']);
            $profesor->setPassword($passwordHasher->hashPassword($profesor, $datos['password']));
            $profesor->setCreatedAt(new \DateTime());
            $profesor->setUpdateAt(new \DateTime());
            $profesor->setProfileImage('/uploads/perfiles/default.png'); // Ruta relativa accesible desde el frontend

            try {
                $em->persist($profesor);
                $em->remove($registro);
                $em->flush();

                return new JsonResponse(['message' => 'Profesor registrado correctamente'], 200);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Error al registrar el profesor: ' . $e->getMessage()], 500);
            }
        }
    }

    #[Route('/registro', name: 'registro', methods: ['POST'])]
    public function register(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $alumno = new Alumno();
        $form = $this->createForm(AlumnoRegistroType::class, $alumno);
        $data = json_decode($request->getContent(), true);

        $form->submit($data);

        if (!$form->isValid()) {
            $errors = [];
            foreach ($form->getErrors(true) as $error) {
                $errors[] = $error->getMessage();
            }
            return new JsonResponse(['error' => $errors], JsonResponse::HTTP_BAD_REQUEST);
        }

        $alumno->setRoles(['ROLE_ALUMNO']);
        $alumno->setPassword($passwordHasher->hashPassword($alumno, $form->get('plainPassword')->getData()));
        $alumno->setCreatedAt(new \DateTime());
        $alumno->setUpdateAt(new \DateTime());
        $matricula = 'ALU' . date('Y') . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $alumno->setMatricula($matricula);
        $alumno->setProfileImage('/uploads/perfiles/default.png'); // Ruta relativa accesible desde el frontend

        try {
            $em->persist($alumno);
            $em->flush();

            return new JsonResponse([
                'message' => 'Alumno registrado correctamente',
                'id' => $alumno->getId()
            ], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Error al registrar el alumno: ' . $e->getMessage()
            ], JsonResponse::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/registro/profesor', name: 'registro_profesor', methods: ['POST'])]
    public function registerProfesor(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $profesor = new Profesor();
        $form = $this->createForm(ProfesorRegistroType::class, $profesor);
        $data = json_decode($request->getContent(), true);

        $form->submit($data);

        if (!$form->isValid()) {
            $errors = [];
            foreach ($form->getErrors(true) as $error) {
                $errors[] = $error->getMessage();
            }
            return new JsonResponse(['error' => $errors], JsonResponse::HTTP_BAD_REQUEST);
        }

        $profesor->setRoles(['ROLE_PROFESOR']);
        $profesor->setPassword($passwordHasher->hashPassword($profesor, $form->get('plainPassword')->getData()));
        $profesor->setCreatedAt(new \DateTime());
        $profesor->setUpdateAt(new \DateTime());
        $profesor->setProfileImage('/uploads/perfiles/default.png'); // Ruta relativa accesible desde el frontend

        try {
            $em->persist($profesor);
            $em->flush();

            return new JsonResponse([
                'message' => 'Profesor registrado correctamente',
                'id' => $profesor->getId()
            ], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Error al registrar el profesor: ' . $e->getMessage()
            ], JsonResponse::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/alumnos', name: 'alumnos_list', methods: ['GET'])]
    public function listAlumnos(EntityManagerInterface $em): JsonResponse
    {
        $alumnos = $em->getRepository(Alumno::class)->findAll();
        
        $alumnosArray = array_map(function($alumno) {
            return [
                'id' => $alumno->getId(),
                'email' => $alumno->getEmail(),
                'firstName' => $alumno->getFirstName(),
                'lastName' => $alumno->getLastName(),
                'matricula' => $alumno->getMatricula()
            ];
        }, $alumnos);

        return new JsonResponse($alumnosArray);
    }

    #[Route('/profesor/alumnos/search', name: 'api_alumnos_search', methods: ['GET'])]
    #[IsGranted('ROLE_PROFESOR')]
    public function searchAlumnos(Request $request, EntityManagerInterface $em): JsonResponse
    {
        try {
            $query = $request->query->get('query');
            
            if (!$query) {
                return new JsonResponse([]);
            }

            $this->logger->info('Búsqueda de alumnos iniciada', [
                'query' => $query,
                'user' => $this->getUser()?->getUserIdentifier()
            ]);

            $qb = $em->getRepository(Alumno::class)->createQueryBuilder('a')
                ->where('a.email LIKE :query')
                ->orWhere('CONCAT(a.firstName, \' \', a.lastName) LIKE :query')
                ->setParameter('query', '%' . $query . '%')
                ->setMaxResults(10);

            $alumnos = $qb->getQuery()->getResult();
            
            return new JsonResponse(array_map(function($alumno) {
                return [
                    'id' => $alumno->getId(),
                    'email' => $alumno->getEmail(),
                    'nombre' => $alumno->getFirstName() . ' ' . $alumno->getLastName()
                ];
            }, $alumnos));
        } catch (\Exception $e) {
            $this->logger->error('Error en búsqueda de alumnos', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return new JsonResponse([
                'error' => 'Error al buscar alumnos'
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
