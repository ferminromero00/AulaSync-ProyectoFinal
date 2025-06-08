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
use Symfony\Component\Ldap\Ldap;
use Symfony\Component\Ldap\Exception\LdapException;

/**
 * Controlador para gestionar el registro de alumnos y profesores en la API.
 * Incluye verificación por email y LDAP, así como el flujo de registro completo.
 */
#[Route('/api', name: 'api_')]
class RegistroController extends AbstractController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Inicia el proceso de registro.
     * - Valida el email.
     * - Verifica si el email ya está registrado.
     * - Si es profesor, verifica en LDAP.
     * - Envía un código de verificación por email.
     */
    #[Route('/registro/iniciar', name: 'registro_iniciar', methods: ['POST'])]
    public function iniciarRegistro(Request $request, EntityManagerInterface $em, MailerInterface $mailer, Ldap $ldap): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $email = isset($data['email']) ? trim(strtolower($data['email'])) : null;

            $this->logger->info('Iniciando registro', [
                'email' => $email,
                'role' => $data['role'] ?? 'no-role'
            ]);

            // Validar email y que no exista ya
            if (!$email) {
                $this->logger->warning('Email inválido o vacío');
                return new JsonResponse(['error' => 'Email inválido'], 400);
            }

            // Verificar si ya existe
            if (
                $em->getRepository(Alumno::class)->findOneBy(['email' => $email]) ||
                $em->getRepository(Profesor::class)->findOneBy(['email' => $email])
            ) {
                $this->logger->warning('Email ya registrado', ['email' => $email]);
                return new JsonResponse(['error' => 'Email ya registrado'], 400);
            }

            // Si es profesor, verificar en LDAP antes de continuar
            if (($data['role'] ?? null) === 'profesor') {
                try {
                    $this->logger->info('Intentando verificar profesor en LDAP', [
                        'host' => $_ENV['LDAP_HOST'],
                        'base_dn' => $_ENV['LDAP_BASE_DN']
                    ]);

                    // Verificar que tenemos todas las variables necesarias
                    if (!$_ENV['LDAP_HOST'] || !$_ENV['LDAP_BASE_DN'] || !$_ENV['LDAP_USER_DN'] || !$_ENV['LDAP_PASSWORD']) {
                        throw new \RuntimeException('Faltan variables de configuración LDAP');
                    }

                    $ldap->bind($_ENV['LDAP_USER_DN'], $_ENV['LDAP_PASSWORD']);

                    $query = $ldap->query(
                        $_ENV['LDAP_BASE_DN'],
                        sprintf('(&(objectClass=inetOrgPerson)(mail=%s))', $email)
                    );

                    $results = $query->execute();
                    $this->logger->info('Búsqueda LDAP completada', [
                        'resultCount' => count($results)
                    ]);

                    if (count($results) === 0) {
                        $this->logger->warning('Profesor no encontrado en LDAP', ['email' => $email]);
                        return new JsonResponse([
                            'success' => false,
                            'message' => 'No se pudo verificar al profesor en el sistema',
                            'error' => 'Tu email no está autorizado en la base de datos de profesores.'
                        ], 403);
                    }

                    // Añadir log de éxito cuando encuentra al profesor
                    $this->logger->info('Profesor encontrado en LDAP', [
                        'email' => $email,
                        'ldapEntry' => $results[0]->getAttributes()
                    ]);

                    // También puedes devolver una respuesta de éxito si quieres confirmar que se encontró
                    return new JsonResponse([
                        'success' => true,
                        'message' => 'Profesor verificado correctamente',
                        'email' => $email
                    ]);

                } catch (LdapException $e) {
                    $this->logger->error('Error de conexión LDAP', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    return new JsonResponse([
                        'success' => false,
                        'message' => 'No se pudo verificar al profesor en el sistema',
                        'error' => 'Error de conexión con el servidor de verificación.'
                    ], 500);
                }
            }

            // Limpiar registros pendientes anteriores
            $repoPendiente = $em->getRepository(RegistroPendiente::class);
            $pendientesPrevios = $repoPendiente->findBy(['email' => $email]);
            foreach ($pendientesPrevios as $pendiente) {
                $em->remove($pendiente);
            }
            $em->flush();

            // Generar y guardar nuevo registro
            $codigo = random_int(100000, 999999);
            $registro = new RegistroPendiente();
            $registro->setEmail($email);
            $registro->setDatos(json_encode($data));
            $registro->setCodigo($codigo);
            $registro->setFechaSolicitud(new \DateTime());

            $em->persist($registro);
            $em->flush();

            // Enviar email con el código
            $emailObj = (new Email())
                ->from('no-reply@aulasync.com')
                ->to($email)
                ->subject('Código de verificación AulaSync')
                ->text("Tu código de verificación es: $codigo");

            $mailer->send($emailObj);

            $this->logger->info('Registro iniciado correctamente', [
                'email' => $email,
                'role' => $data['role'] ?? 'alumno'
            ]);

            return new JsonResponse(['message' => 'Código enviado al email']);

        } catch (\Exception $e) {
            $this->logger->error('Error general en iniciarRegistro', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return new JsonResponse([
                'error' => 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Verifica el código de registro y crea el usuario (alumno o profesor).
     * - Valida el código recibido.
     * - Crea el usuario correspondiente si el código es correcto.
     */
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

    /**
     * Registro directo de alumno (sin verificación previa).
     * - Crea un nuevo alumno si los datos son válidos.
     */
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

    /**
     * Registro directo de profesor (sin verificación previa).
     * - Crea un nuevo profesor si los datos son válidos.
     */
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

    /**
     * Devuelve la lista de todos los alumnos.
     */
    #[Route('/alumnos', name: 'alumnos_list', methods: ['GET'])]
    public function listAlumnos(EntityManagerInterface $em): JsonResponse
    {
        $alumnos = $em->getRepository(Alumno::class)->findAll();

        $alumnosArray = array_map(function ($alumno) {
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

    /**
     * Permite a un profesor buscar alumnos por nombre o email.
     * Requiere el rol de profesor.
     */
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

            return new JsonResponse(array_map(function ($alumno) {
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
