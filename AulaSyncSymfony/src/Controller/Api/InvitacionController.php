<?php

namespace App\Controller\Api;

use App\Entity\Invitacion;
use App\Entity\Alumno;
use App\Entity\Clase;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class InvitacionController extends AbstractController
{
    #[Route('/invitaciones/enviar', name: 'invitacion_enviar', methods: ['POST'])]
    public function enviarInvitacion(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $alumno = $em->getRepository(Alumno::class)->find($data['alumnoId']);
        $clase = $em->getRepository(Clase::class)->find($data['claseId']);
        
        if (!$alumno || !$clase) {
            return new JsonResponse(['error' => 'Alumno o clase no encontrados'], 404);
        }

        // NUEVO: Comprobar si el alumno ya está en la clase
        if ($clase->getAlumnos()->contains($alumno)) {
            return new JsonResponse(['error' => 'El alumno ya pertenece a esta clase'], 409);
        }

        // Verificar si ya existe una invitación pendiente
        $invitacionExistente = $em->getRepository(Invitacion::class)->findOneBy([
            'alumno' => $alumno,
            'clase' => $clase,
            'estado' => 'pendiente'
        ]);

        if ($invitacionExistente) {
            return new JsonResponse(['error' => 'Ya existe una invitación pendiente'], 400);
        }

        $invitacion = new Invitacion();
        $invitacion->setAlumno($alumno);
        $invitacion->setClase($clase);
        
        $em->persist($invitacion);
        $em->flush();

        return new JsonResponse(['message' => 'Invitación enviada']);
    }

    #[Route('/invitaciones/responder/{id}', name: 'invitacion_responder', methods: ['POST'])]
    public function responderInvitacion(Invitacion $invitacion, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $respuesta = $data['respuesta']; // 'aceptar' o 'rechazar'
        
        if ($invitacion->getAlumno() !== $this->getUser()) {
            return new JsonResponse(['error' => 'No autorizado'], 403);
        }

        if ($respuesta === 'aceptar') {
            $clase = $invitacion->getClase();
            $alumno = $invitacion->getAlumno();
            // Evita duplicados
            if (!$clase->getAlumnos()->contains($alumno)) {
                $clase->addAlumno($alumno);
            }
            $invitacion->setEstado('aceptada');
        } else {
            $invitacion->setEstado('rechazada');
        }

        $em->flush();
        return new JsonResponse(['message' => 'Invitación ' . $respuesta . 'da']);
    }

    #[Route('/invitaciones/pendientes', name: 'invitaciones_pendientes', methods: ['GET'])]
    public function obtenerInvitacionesPendientes(EntityManagerInterface $em): JsonResponse
    {
        $alumno = $this->getUser();

        // Añade este chequeo para evitar consultas erróneas
        if (!$alumno instanceof \App\Entity\Alumno) {
            return new JsonResponse(['error' => 'No autenticado como alumno'], 401);
        }
        
        $invitaciones = $em->getRepository(Invitacion::class)->findBy([
            'alumno' => $alumno,
            'estado' => 'pendiente'
        ]);

        $data = array_map(function(Invitacion $inv) {
            $clase = $inv->getClase();
            $profesor = $clase ? $clase->getProfesor() : null;
            return [
                'id' => $inv->getId(),
                'clase' => [
                    'id' => $clase ? $clase->getId() : null,
                    'nombre' => $clase ? $clase->getNombre() : 'Clase eliminada',
                    'profesor' => $profesor ? ($profesor->getFirstName() . ' ' . $profesor->getLastName()) : 'Profesor desconocido'
                ],
                'fecha' => $inv->getFecha() ? $inv->getFecha()->format('Y-m-d H:i:s') : null
            ];
        }, $invitaciones);

        return new JsonResponse($data);
    }
}
