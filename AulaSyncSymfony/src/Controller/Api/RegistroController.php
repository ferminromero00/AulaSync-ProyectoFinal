<?php

namespace App\Controller\Api;

use App\Entity\Alumno;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api', name: 'api_')]
class RegistroController extends AbstractController
{
    #[Route('/registro', name: 'registro', methods: ['POST'])]
    public function register(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $alumno = new Alumno();
        $alumno->setEmail($data['email']);
        $alumno->setFirstName($data['firstName']);
        $alumno->setLastName($data['lastName']);
        $alumno->setRoles('ROLE_ALUMNO');
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
}
