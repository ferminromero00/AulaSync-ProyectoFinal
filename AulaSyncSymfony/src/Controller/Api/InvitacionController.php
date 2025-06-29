<?php

namespace App\Controller\Api;

use App\Entity\Invitacion;
use App\Entity\Alumno;
use App\Entity\Clase;
use App\Entity\Notificacion;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Controlador para gestionar invitaciones y notificaciones de alumnos.
 *
 * Permite enviar, responder y listar invitaciones, así como gestionar notificaciones.
 */
#[Route('/api')]
class InvitacionController extends AbstractController
{
    /**
     * Envía una invitación a un alumno para unirse a una clase.
     *
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
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

    /**
     * Permite al alumno responder (aceptar/rechazar) una invitación.
     *
     * @param Invitacion $invitacion
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
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

    /**
     * Devuelve todas las invitaciones pendientes y notificaciones del alumno autenticado.
     *
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/invitaciones/pendientes', name: 'invitaciones_pendientes', methods: ['GET'])]
    public function obtenerInvitacionesPendientes(EntityManagerInterface $em): JsonResponse
    {
        $alumno = $this->getUser();
        error_log('[InvitacionController] Obteniendo invitaciones para alumno ID: ' . $alumno->getId());

        if (!$alumno instanceof \App\Entity\Alumno) {
            error_log('[InvitacionController] Usuario no es instancia de Alumno');
            return new JsonResponse(['error' => 'No autenticado como alumno'], 401);
        }
        
        $invitaciones = $em->getRepository(Invitacion::class)->findBy([
            'alumno' => $alumno,
            'estado' => 'pendiente'
        ]);

        error_log('[InvitacionController] Invitaciones encontradas: ' . count($invitaciones));

        // También buscar notificaciones de tareas
        $notificaciones = $em->getRepository(Notificacion::class)->findBy([
            'alumno' => $alumno,
            'tipo' => ['nueva_tarea', 'tarea_calificada']
        ]);

        error_log('[InvitacionController] Notificaciones encontradas: ' . count($notificaciones));

        // Combinar invitaciones y notificaciones
        $todasLasNotificaciones = array_merge(
            $this->formatearInvitaciones($invitaciones),
            $this->formatearNotificaciones($notificaciones)
        );

        error_log('[InvitacionController] Total notificaciones enviadas: ' . count($todasLasNotificaciones));
        return new JsonResponse($todasLasNotificaciones);
    }

    /**
     * Marca una notificación como leída (la elimina).
     *
     * @param Notificacion $notificacion
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/notificaciones/{id}/leer', name: 'notificacion_leer', methods: ['POST'])]
    public function marcarNotificacionLeida(Notificacion $notificacion, EntityManagerInterface $em): JsonResponse
    {
        $alumno = $this->getUser();
        if (!$alumno instanceof \App\Entity\Alumno || $notificacion->getAlumno() !== $alumno) {
            return new JsonResponse(['error' => 'No autorizado'], 403);
        }

        $em->remove($notificacion);
        $em->flush();

        return new JsonResponse(['message' => 'Notificación leída']);
    }

    /**
     * Borra todas las notificaciones del alumno autenticado.
     *
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/notificaciones/borrar-todas', name: 'notificaciones_borrar_todas', methods: ['DELETE'])]
    public function borrarTodasNotificaciones(EntityManagerInterface $em): JsonResponse
    {
        $alumno = $this->getUser();
        if (!$alumno instanceof \App\Entity\Alumno) {
            return new JsonResponse(['error' => 'No autenticado como alumno'], 401);
        }

        // Eliminar todas las notificaciones del alumno
        $notificaciones = $em->getRepository(\App\Entity\Notificacion::class)->findBy(['alumno' => $alumno]);
        foreach ($notificaciones as $notif) {
            $em->remove($notif);
        }
        $em->flush();

        return new JsonResponse(['success' => true]);
    }

    /**
     * Formatea las invitaciones para la respuesta JSON.
     *
     * @param array $invitaciones
     * @return array
     */
    private function formatearInvitaciones($invitaciones): array 
    {
        return array_map(function($inv) {
            $clase = $inv->getClase();
            $profesor = $clase ? $clase->getProfesor() : null;
            return [
                'id' => $inv->getId(),
                'tipo' => 'invitacion',
                'clase' => [
                    'id' => $clase ? $clase->getId() : null,
                    'nombre' => $clase ? $clase->getNombre() : 'Clase eliminada',
                    'profesor' => $profesor ? ($profesor->getFirstName() . ' ' . $profesor->getLastName()) : 'Profesor desconocido'
                ],
                'fecha' => $inv->getFecha() ? $inv->getFecha()->format('Y-m-d H:i:s') : null
            ];
        }, $invitaciones);
    }

    /**
     * Formatea las notificaciones para la respuesta JSON.
     *
     * @param array $notificaciones
     * @return array
     */
    private function formatearNotificaciones($notificaciones): array 
    {
        return array_map(function($notif) {
            return [
                'id' => $notif->getId(),
                'tipo' => $notif->getTipo(),
                'mensaje' => $notif->getContenido(), // Changed from getMensaje to getContenido
                'datos' => $notif->getDatos(),
                'createdAt' => $notif->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }, $notificaciones);
    }
}
