<?php

namespace App\Controller\Api;

use App\Entity\Alumno;
use App\Entity\Profesor;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Psr\Log\LoggerInterface;

#[Route('/api', name: 'api_')]
class RegistroController extends AbstractController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    #[Route('/registro', name: 'registro', methods: ['POST'])]
    public function register(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $alumno = new Alumno();
        $alumno->setEmail($data['email']);
        $alumno->setFirstName($data['firstName']);
        $alumno->setLastName($data['lastName']);
        $alumno->setRoles(['ROLE_ALUMNO']); // <-- Cambiado aquí
        $alumno->setPassword($passwordHasher->hashPassword($alumno, $data['password']));
        $alumno->setCreatedAt(new \DateTime());
        $alumno->setUpdateAt(new \DateTime());
        
        // Generar matrícula única
        $matricula = 'ALU' . date('Y') . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $alumno->setMatricula($matricula);
        
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
        $data = json_decode($request->getContent(), true);
        
        $profesor = new Profesor();
        $profesor->setEmail($data['email']);
        $profesor->setFirstName($data['firstName']);
        $profesor->setLastName($data['lastName']);
        $profesor->setRoles(['ROLE_PROFESOR']);
        $profesor->setPassword($passwordHasher->hashPassword($profesor, $data['password']));
        $profesor->setCreatedAt(new \DateTime());
        $profesor->setUpdateAt(new \DateTime());
        
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
                ->orWhere('CONCAT(a.first_name, \' \', a.last_name) LIKE :query')
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
